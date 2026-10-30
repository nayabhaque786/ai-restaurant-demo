import uuid
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session

from .database import SessionLocal, engine
from .models import Base, MenuItemModel, TableSessionModel, OrderModel, OrderItemModel

# Create database tables if they don't exist yet
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Empire Restaurant AI Demo Backend", version="1.0")

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Pydantic Models (Request Validation) ---

class SessionCreate(BaseModel):
    restaurant_id: str
    table_number: int

class OrderItemRequest(BaseModel):
    item_id: str
    quantity: int

class OrderCreate(BaseModel):
    session_id: str
    items: List[OrderItemRequest]

class StatusUpdate(BaseModel):
    status: str

class ChatRequest(BaseModel):
    session_id: str
    message: str


# --- 1. Get Menu Endpoint (Reads from Database) ---
@app.get("/menu")
def get_menu(db: Session = Depends(get_db)):
    """Fetches the full restaurant menu from the SQLite database."""
    items = db.query(MenuItemModel).all()
    menu_list = []
    for item in items:
        menu_list.append({
            "id": item.id,
            "name": item.name,
            "price": item.price,
            "category": item.category,
            "description": item.description,
            "is_veg": item.is_veg,
            "is_available": item.is_available
        })
    return {
        "restaurant_name": "EMPIRE RESTAURANT",
        "menu": menu_list
    }


# --- 2. Create Table Session Endpoint (Saves to Database) ---
@app.post("/sessions")
def create_session(session_req: SessionCreate, db: Session = Depends(get_db)):
    """Initializes a table session and stores it in the database."""
    session_id = f"sess_{uuid.uuid4().hex[:8]}"
    new_session = TableSessionModel(
        session_id=session_id,
        restaurant_id=session_req.restaurant_id,
        table_number=session_req.table_number
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    return {
        "session_id": new_session.session_id,
        "table_number": new_session.table_number
    }


# --- 3. Place an Order Endpoint (Calculates totals & saves to DB) ---
@app.post("/orders", status_code=201)
def place_order(order_req: OrderCreate, db: Session = Depends(get_db)):
    """Places items from cart into kitchen queue, calculating totals server-side."""
    # Verify session exists in database
    session = db.query(TableSessionModel).filter(TableSessionModel.session_id == order_req.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found. Please scan the QR code again.")
    
    total_amount = 0
    order_items_resolved = []
    order_id = f"ord_{uuid.uuid4().hex[:6]}"
    
    for item_req in order_req.items:
        menu_item = db.query(MenuItemModel).filter(MenuItemModel.id == item_req.item_id).first()
        if not menu_item:
            raise HTTPException(status_code=400, detail=f"Item {item_req.item_id} not found in menu.")
        
        subtotal = menu_item.price * item_req.quantity
        total_amount += subtotal
        
        # Save order item
        db_order_item = OrderItemModel(
            order_id=order_id,
            item_id=item_req.item_id,
            quantity=item_req.quantity,
            price=menu_item.price
        )
        db.add(db_order_item)
        
        order_items_resolved.append({
            "item_id": item_req.item_id,
            "name": menu_item.name,
            "quantity": item_req.quantity,
            "price": menu_item.price
        })
        
    # Save main order record
    new_order = OrderModel(
        order_id=order_id,
        session_id=order_req.session_id,
        table_number=session.table_number,
        total_amount=total_amount,
        status="New"
    )
    db.add(new_order)
    db.commit()
    
    return {
        "order_id": order_id,
        "status": "New",
        "total_amount": total_amount,
        "items": order_items_resolved,
        "table_number": session.table_number
    }


# --- 4. Update Order Status (Kitchen Screen) Endpoint ---
@app.patch("/orders/{order_id}/status")
def update_order_status(order_id: str, update: StatusUpdate, db: Session = Depends(get_db)):
    """Updates order status in the database as it moves through the kitchen."""
    order = db.query(OrderModel).filter(OrderModel.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    
    valid_statuses = ["New", "Preparing", "Ready", "Delivered"]
    if update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
        
    order.status = update.status
    db.commit()
    db.refresh(order)
    
    return {
        "order_id": order.order_id,
        "status": order.status,
        "table_number": order.table_number,
        "total_amount": order.total_amount
    }


# --- 5. AI Waiter Chat Endpoint ---
@app.post("/chat")
def chat_with_ai(chat: ChatRequest, db: Session = Depends(get_db)):
    """Sends customer messages to the AI waiter agent."""
    session = db.query(TableSessionModel).filter(TableSessionModel.session_id == chat.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    
    msg = chat.message.lower()
    
    if "peanut" in msg or "allergy" in msg or "allergic" in msg:
        reply = "At Empire Restaurant, our Paneer Tikka is safe for you as it does not contain peanuts. Would you like me to add it to your cart?"
    elif "veg" in msg:
        reply = "We have wonderful vegetarian starters like Paneer Tikka. Would you like me to add one to your cart?"
    elif "water" in msg or "waiter" in msg:
        reply = "I have notified the floor staff. Someone will be at your table shortly!"
    else:
        reply = f"I'm your AI waiter at Empire Restaurant! I heard: '{chat.message}'. How can I help you explore the menu today?"
        
    return {"reply": reply}

# --- 6. ADD THIS CORS MIDDLEWARE BLOCK ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows your Next.js frontend to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 7. Get All Orders Endpoint (For Kitchen Display) ---
@app.get("/orders")
def get_orders(db: Session = Depends(get_db)):
    orders = db.query(OrderModel).all()
    order_list = []
    for order in orders:
        # Get items for this order
        items = db.query(OrderItemModel).filter(OrderItemModel.order_id == order.order_id).all()
        item_details = []
        for i in items:
            menu_item = db.query(MenuItemModel).filter(MenuItemModel.id == i.item_id).first()
            item_details.append({
                "item_id": i.item_id,
                "name": menu_item.name if menu_item else "Unknown",
                "quantity": i.quantity,
                "price": i.price
            })
            
        order_list.append({
            "order_id": order.order_id,
            "session_id": order.session_id,
            "table_number": order.table_number,
            "total_amount": order.total_amount,
            "status": order.status,
            "items": item_details
        })
    return {"orders": order_list}
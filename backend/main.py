import json
import os
import uuid
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Empire Restaurant AI Demo Backend", version="1.0")

# Path to your menu.json file
MENU_PATH = os.path.join(os.path.dirname(__file__), "menu.json")

def load_menu():
    """Helper function to load menu.json"""
    if os.path.exists(MENU_PATH):
        with open(MENU_PATH, "r") as f:
            return json.load(f)
    return {"restaurant_name": "EMPIRE RESTAURANT", "menu": []}

# In-memory storage for the demo (acts as our lightweight database)
sessions_db = {}
orders_db = {}

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


# --- 1. Get Menu Endpoint ---
@app.get("/menu")
def get_menu():
    """Fetches the full restaurant menu from menu.json"""
    return load_menu()


# --- 2. Create Table Session Endpoint ---
@app.post("/sessions")
def create_session(session: SessionCreate):
    """Initializes a session when a customer scans the QR code at a table."""
    session_id = f"sess_{uuid.uuid4().hex[:8]}"
    sessions_db[session_id] = {
        "session_id": session_id,
        "restaurant_id": session.restaurant_id,
        "table_number": session.table_number
    }
    return sessions_db[session_id]


# --- 3. Place an Order Endpoint ---
@app.post("/orders", status_code=201)
def place_order(order: OrderCreate):
    """Places items from the customer's cart into the kitchen queue."""
    if order.session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Session not found. Please scan the QR code again.")
    
    menu_data = load_menu()
    menu_items = {item["id"]: item for item in menu_data.get("menu", [])}
    
    total_amount = 0
    order_items_resolved = []
    
    for item_req in order.items:
        if item_req.item_id not in menu_items:
            raise HTTPException(status_code=400, detail=f"Item {item_req.item_id} not found in menu.")
        
        item_info = menu_items[item_req.item_id]
        subtotal = item_info["price"] * item_req.quantity
        total_amount += subtotal
        
        order_items_resolved.append({
            "item_id": item_req.item_id,
            "name": item_info["name"],
            "quantity": item_req.quantity,
            "price": item_info["price"]
        })
        
    order_id = f"ord_{uuid.uuid4().hex[:6]}"
    new_order = {
        "order_id": order_id,
        "session_id": order.session_id,
        "table_number": sessions_db[order.session_id]["table_number"],
        "items": order_items_resolved,
        "total_amount": total_amount,
        "status": "New"
    }
    
    orders_db[order_id] = new_order
    return new_order


# --- 4. Update Order Status (Kitchen Screen) Endpoint ---
@app.patch("/orders/{order_id}/status")
def update_order_status(order_id: str, update: StatusUpdate):
    """Updates the status of an order as it moves through the kitchen."""
    if order_id not in orders_db:
        raise HTTPException(status_code=404, detail="Order not found.")
    
    valid_statuses = ["New", "Preparing", "Ready", "Delivered"]
    if update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
        
    orders_db[order_id]["status"] = update.status
    return orders_db[order_id]


# --- 5. AI Waiter Chat Endpoint ---
@app.post("/chat")
def chat_with_ai(chat: ChatRequest):
    """Sends customer messages to the AI waiter agent."""
    if chat.session_id not in sessions_db:
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
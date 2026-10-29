from sqlalchemy import Column, Integer, String, Float, Boolean
from .database import Base

class MenuItemModel(Base):
    __tablename__ = "menu_items"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    category = Column(String)
    description = Column(String)
    is_veg = Column(Boolean)
    is_available = Column(Boolean)

class TableSessionModel(Base):
    __tablename__ = "table_sessions"
    
    session_id = Column(String, primary_key=True, index=True)
    restaurant_id = Column(String)
    table_number = Column(Integer)

class OrderModel(Base):
    __tablename__ = "orders"
    
    order_id = Column(String, primary_key=True, index=True)
    session_id = Column(String)
    table_number = Column(Integer)
    total_amount = Column(Float)
    status = Column(String, default="New")

class OrderItemModel(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(String)
    item_id = Column(String)
    quantity = Column(Integer)
    price = Column(Float)
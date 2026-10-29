import json
import os
from .database import SessionLocal, engine
from .models import Base, MenuItemModel

def seed_menu():
    # 1. Create the database tables if they don't exist yet
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # 2. Check if items already exist so we don't duplicate them
    existing_count = db.query(MenuItemModel).count()
    if existing_count > 0:
        print(f"Database already has {existing_count} items. Skipping seed.")
        db.close()
        return

    # 3. Load menu.json file
    menu_path = os.path.join(os.path.dirname(__file__), "menu.json")
    if not os.path.exists(menu_path):
        print("Error: menu.json not found in backend folder!")
        db.close()
        return

    with open(menu_path, "r") as f:
        data = json.load(f)
        menu_items = data.get("menu", [])

        # 4. Insert each dish into the SQLite database
        for item in menu_items:
            db_item = MenuItemModel(
                id=item["id"],
                name=item["name"],
                price=item["price"],
                category=item["category"],
                description=item["description"],
                is_veg=item["is_veg"],
                is_available=item["is_available"]
            )
            db.add(db_item)
        
        db.commit()
        print(f"Successfully seeded {len(menu_items)} menu items into the database!")
    
    db.close()

if __name__ == "__main__":
    seed_menu()
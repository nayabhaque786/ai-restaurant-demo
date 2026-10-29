# API Contract - AI Restaurant Demo

Base URL: `http://localhost:8000` (Local) / Production URL later.

---

## 1. Get Menu
* **URL:** `/menu`
* **Method:** `GET`
* **Description:** Fetches the full restaurant menu grouped by categories.
* **Response Example (200 OK):**
```json
{
  "restaurant_name": "EMPIRE RESTAURANT",
  "menu": [
    {
      "id": "item_1",
      "name": "Paneer Tikka Skewers",
      "price": 280,
      "category": "Starters",
      "is_veg": true,
      "is_available": true
    }
  ]
}

## 2. Create Table Session
- **URL:** `/sessions`
- **Method:** `POST`
- **Description:** Initializes a session when a customer scans the QR code at a table.
- **Request Body:**

JSON
{
  "restaurant_id": "empire_restaurant",
  "table_number": 4
}
- **Response Example (200 OK):**
{
  "session_id": "sess_abc123",
  "table_number": 4
}

## 3. Place an Order
- **URL:** `/orders`
- **Method:** `POST`
- **Description:** Places items from the customer's cart into the kitchen queue.
- **Request Body:**

JSON
{
  "session_id": "sess_abc123",
  "items": [
    { "item_id": "item_1", "quantity": 2 },
    { "item_id": "item_4", "quantity": 1 }
  ]
}
- **Response Example (201 Created):**
{
  "order_id": "ord_9988",
  "status": "New",
  "total_amount": 980
}

## 4. Update Order Status (Kitchen Screen)
- **URL:** `/orders/{id}/status`
- **Method:** `PATCH`
- **Description:** Updates the status of an order as it moves through the kitchen.
- **Request Body:**

JSON
{
  "status": "Preparing"
}
*(Valid statuses: `New`, `Preparing`, `Ready`, `Delivered`)*

## 5. AI Waiter Chat
- **URL:** `/chat`
- **Method:** `POST`
- **Description:** Sends customer messages to the AI waiter agent.
- **Request Body:**

JSON
{
  "session_id": "sess_abc123",
  "message": "I am allergic to peanuts, what can I eat?"
}
- **Response Example (200 OK):**
{
  "reply": "At Empire Restaurant, our Paneer Tikka is safe for you as it does not contain peanuts. Would you like me to add it to your cart?"
}
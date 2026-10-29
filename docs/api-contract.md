# API Contract - AI Restaurant Demo

**Base URL:** `http://localhost:8000` (Local Development)  
**Production URL:** To be configured later.

---

## 1. Get Menu

- **URL:** `/menu`
- **Method:** `GET`
- **Description:** Fetches the full restaurant menu grouped by categories.
- **Response Status:** `200 OK`

### Response Body

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
```

---

## 2. Create Table Session

- **URL:** `/sessions`
- **Method:** `POST`
- **Description:** Initializes a session when a customer scans the QR code at a table.
- **Response Status:** `200 OK`

### Request Body

```json
{
  "restaurant_id": "empire_restaurant",
  "table_number": 4
}
```

### Response Body

```json
{
  "session_id": "sess_abc123",
  "table_number": 4
}
```

---

## 3. Place an Order

- **URL:** `/orders`
- **Method:** `POST`
- **Description:** Places items from the customer's cart into the kitchen queue.
- **Response Status:** `201 Created`

### Request Body

```json
{
  "session_id": "sess_abc123",
  "items": [
    {
      "item_id": "item_1",
      "quantity": 2
    },
    {
      "item_id": "item_4",
      "quantity": 1
    }
  ]
}
```

### Response Body

```json
{
  "order_id": "ord_9988",
  "status": "New",
  "total_amount": 980
}
```

---

## 4. Update Order Status (Kitchen Screen)

- **URL:** `/orders/{id}/status`
- **Method:** `PATCH`
- **Description:** Updates the status of an order as it moves through the kitchen.
- **Response Status:** `200 OK` (proposed)

### Request Body

```json
{
  "status": "Preparing"
}
```

### Valid Order Statuses

- `New`
- `Preparing`
- `Ready`
- `Delivered`

---

## 5. AI Waiter Chat

- **URL:** `/chat`
- **Method:** `POST`
- **Description:** Sends customer messages to the AI waiter agent.
- **Response Status:** `200 OK`

### Request Body

```json
{
  "session_id": "sess_abc123",
  "message": "I am allergic to peanuts, what can I eat?"
}
```

### Response Body

```json
{
  "reply": "At Empire Restaurant, our Paneer Tikka is safe for you as it does not contain peanuts. Would you like me to add it to your cart?"
}
```

---

## General Notes

- The local development server runs at `http://localhost:8000`.
- Request and response bodies use JSON where applicable.
- Use the `Content-Type: application/json` header for `POST` and `PATCH` requests.
- These examples describe the expected API contract; the backend must implement the endpoints for them to work.
- The success status for updating an order is proposed and should be confirmed during backend implementation.
- Allergy recommendations must be based on verified ingredient and cross-contamination information.

---

**Project:** AI Restaurant Demo  
**Document:** API Contract  
**Version:** 1.0  
**Status:** Initial Draft

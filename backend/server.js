const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Full Menu Data with all properties required by the frontend
let menuItems = [
  { id: 1, n: 'Paneer Tikka Skewers', c: 'Starters', p: 289, v: 1, e: '🍢', sp: 2, t: 15, k: 'paneer', g: 'paneer, hung curd, bell peppers, spices', d: 'Charred cottage cheese in a smoky yoghurt marinade.', a: 1 },
  { id: 2, n: 'Chicken Malai Tikka', c: 'Starters', p: 339, v: 0, e: '🍗', sp: 1, t: 18, k: 'malai', g: 'chicken, cream, cheese, cardamom', d: 'Creamy, tender chicken grilled in the tandoor.', a: 1 },
  { id: 3, n: 'Crispy Corn Salt & Pepper', c: 'Starters', p: 229, v: 1, e: '🌽', sp: 2, t: 10, k: 'corn', g: 'sweet corn, pepper, spring onion, chilli', d: 'Golden fried corn tossed with cracked pepper.', a: 1 },
  { id: 4, n: 'Butter Chicken', c: 'Main Course', p: 399, v: 0, e: '🍛', sp: 1, t: 20, k: 'butter chicken', g: 'chicken, tomato, butter, cream, fenugreek', d: 'Tandoori chicken in a silky tomato-butter gravy.', a: 1 },
  { id: 5, n: 'Dal Makhani', c: 'Main Course', p: 299, v: 1, e: '🥘', sp: 1, t: 15, k: 'dal', g: 'black lentils, kidney beans, butter, cream', d: 'Rich, creamy lentils simmered overnight.', a: 1 },
  { id: 6, n: 'Hyderabadi Dum Biryani (Chicken)', c: 'Main Course', p: 429, v: 0, e: '🍚', sp: 3, t: 30, k: 'biryani', g: 'basmati, chicken, saffron, mint, fried onion', d: 'Fragrant, spicy layered rice, sealed and slow-cooked.', a: 1 },
  { id: 7, n: 'Butter Naan', c: 'Breads', p: 59, v: 1, e: '🫓', sp: 0, t: 8, k: 'butter naan', g: 'wheat flour, butter, yoghurt', d: 'Soft tandoor bread brushed with butter.', a: 1 },
  { id: 8, n: 'Garlic Naan', c: 'Breads', p: 79, v: 1, e: '🧄', sp: 0, t: 8, k: 'garlic', g: 'wheat flour, garlic, coriander', d: 'Tandoor naan with roasted garlic.', a: 1 },
  { id: 9, n: 'Classic Lemon Mint Mojito', c: 'Beverages', p: 149, v: 1, e: '🍹', sp: 0, t: 5, k: 'mojito|mint', g: 'lime, mint, soda, sugar', d: 'Cooling mint and lime over crushed ice.', a: 1 },
  { id: 10, n: 'Gulab Jamun with Ice Cream', c: 'Desserts', p: 179, v: 1, e: '🍨', sp: 0, t: 6, k: 'jamun|gulab', g: 'milk solids, rose syrup, vanilla ice cream', d: 'Warm rose-syrup dumplings with vanilla ice cream.', a: 1 }
];

// API Endpoint to get the menu
app.get('/api/menu', (req, res) => {
  res.json(menuItems);
});

// API Endpoint to add a new dish
app.post('/api/menu', (req, res) => {
  const newDish = {
    id: Date.now(),
    n: req.body.n,
    p: +req.body.p,
    c: req.body.c || 'Main Course',
    v: +req.body.v,
    e: '🍽️',
    sp: 0,
    t: 15,
    d: 'New addition from the chef.',
    g: 'on request',
    a: 1
  };
  menuItems.push(newDish);
  console.log("New dish added to backend:", newDish);
  res.status(201).json({ success: true, dish: newDish });
});

// API Endpoint to receive orders
app.post('/api/orders', (req, res) => {
  const newOrder = req.body;
  console.log("Order received on backend:", newOrder);
  res.status(201).json({ success: true, orderId: newOrder.id, data: newOrder });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
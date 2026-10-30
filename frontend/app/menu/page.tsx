"use client";

import { useState, useEffect } from "react";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  is_veg: boolean;
  is_available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Fetch menu from backend
  useEffect(() => {
    fetch("http://localhost:8000/menu")
      .then((res) => res.json())
      .then((data) => {
        setMenuItems(data.menu || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch menu:", err);
        setLoading(false);
      });
  }, []);

  const categories = ["All", ...Array.from(new Set(menuItems.map((item) => item.category)))];

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesVeg = !vegOnly || item.is_veg;
    return matchesSearch && matchesCategory && matchesVeg;
  });

  // Add item to cart
  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existing = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  // Remove or decrement item from cart
  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0);
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Submit Order to FastAPI Backend
  const handleCheckout = async () => {
    try {
      const sessionRes = await fetch("http://localhost:8000/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: "empire", table_number: 4 }),
      });
      const sessionData = await sessionRes.json();

      const orderRes = await fetch("http://localhost:8000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionData.session_id,
          items: cart.map((item) => ({ item_id: item.id, quantity: item.quantity })),
        }),
      });

      const orderData = await orderRes.json();
      if (orderRes.ok) {
        setOrderId(orderData.order_id);
        setOrderPlaced(true);
        setCart([]);
      } else {
        alert("Failed to place order: " + orderData.detail);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Error connecting to server during checkout.");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading menu from database...</div>;
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-800">Order Placed Successfully!</h1>
          <p className="text-gray-600 mt-2">Your order <span className="font-semibold text-indigo-600">#{orderId}</span> has been sent to the kitchen.</p>
          <button
            onClick={() => setOrderPlaced(false)}
            className="mt-6 w-full bg-orange-600 text-white py-3 rounded-xl font-medium hover:bg-orange-700 transition"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-orange-600 text-white p-4 shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-bold text-center">Empire Restaurant</h1>
        <p className="text-xs text-orange-100 text-center mt-0.5">Table #4</p>
        
        {/* Search Bar */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-xl text-gray-800 text-sm focus:outline-none shadow-inner"
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Vegetarian Only</span>
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
              vegOnly ? "bg-green-600" : "bg-gray-300"
            }`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${vegOnly ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-orange-600 text-white shadow-md shadow-orange-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu List */}
        <div className="mt-4 space-y-3">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
              <div className="pr-4">
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${item.is_veg ? "border-green-600" : "border-red-600"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.is_veg ? "bg-green-600" : "bg-red-600"}`} />
                  </span>
                  <h3 className="font-bold text-gray-800 text-base">{item.name}</h3>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                <p className="font-semibold text-gray-900 mt-2">₹{item.price}</p>
              </div>
              <button
                onClick={() => addToCart(item)}
                className="bg-orange-50 text-orange-600 border border-orange-200 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-orange-600 hover:text-white transition-all shadow-sm"
              >
                Add +
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{totalItemsCount} items in cart</p>
              <p className="text-lg font-bold text-gray-900">₹{totalAmount}</p>
            </div>
            <button
              onClick={handleCheckout}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-orange-200 transition"
            >
              Place Order →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
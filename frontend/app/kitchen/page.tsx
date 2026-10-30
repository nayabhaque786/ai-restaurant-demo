"use client";

import { useState, useEffect } from "react";

interface OrderItem {
  item_id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  order_id: string;
  session_id: string;
  table_number: number;
  total_amount: number;
  status: string; // "New", "Preparing", "Ready"
  items?: OrderItem[];
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from FastAPI backend
  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:8000/orders");
      const data = await res.json();
      setOrders(data.orders || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch kitchen orders:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll every 3 seconds for real-time updates without WebSockets
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  // Update order status in backend
  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:8000/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders(); // Refresh list immediately
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold tracking-wider text-orange-500">EMPIRE KITCHEN DISPLAY</h1>
        <span className="bg-green-600/20 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/30">
          ● Live Polling Feed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: New Orders */}
        <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-yellow-400">New Orders</h2>
            <span className="bg-yellow-400/10 text-yellow-400 text-xs px-2 py-0.5 rounded-full">
              {orders.filter(o => o.status === "New").length}
            </span>
          </div>
          <div className="space-y-4">
            {orders.filter(o => o.status === "New").length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-10">No new orders</p>
            ) : (
              orders
                .filter(o => o.status === "New")
                .map(order => (
                  <div key={order.order_id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-orange-400">#{order.order_id}</span>
                      <span className="bg-orange-500/20 text-orange-300 text-xs px-2 py-0.5 rounded-full">Table {order.table_number}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {order.items?.map((item, idx) => (
                        <p key={idx} className="text-xs text-gray-300">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-gray-200 mt-3">Total: ₹{order.total_amount}</p>
                    <div className="mt-4">
                      <button
                        onClick={() => updateStatus(order.order_id, "Preparing")}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs py-2 rounded-lg font-medium transition cursor-pointer"
                      >
                        Start Preparing →
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-blue-400">Preparing</h2>
            <span className="bg-blue-400/10 text-blue-400 text-xs px-2 py-0.5 rounded-full">
              {orders.filter(o => o.status === "Preparing").length}
            </span>
          </div>
          <div className="space-y-4">
            {orders.filter(o => o.status === "Preparing").length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-10">No active preparations</p>
            ) : (
              orders
                .filter(o => o.status === "Preparing")
                .map(order => (
                  <div key={order.order_id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-orange-400">#{order.order_id}</span>
                      <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full">Table {order.table_number}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {order.items?.map((item, idx) => (
                        <p key={idx} className="text-xs text-gray-300">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-gray-200 mt-3">Total: ₹{order.total_amount}</p>
                    <div className="mt-4">
                      <button
                        onClick={() => updateStatus(order.order_id, "Ready")}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded-lg font-medium transition cursor-pointer"
                      >
                        Mark Ready ✓
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Column 3: Ready */}
        <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-green-400">Ready to Serve</h2>
            <span className="bg-green-400/10 text-green-400 text-xs px-2 py-0.5 rounded-full">
              {orders.filter(o => o.status === "Ready").length}
            </span>
          </div>
          <div className="space-y-4">
            {orders.filter(o => o.status === "Ready").length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-10">No ready orders</p>
            ) : (
              orders
                .filter(o => o.status === "Ready")
                .map(order => (
                  <div key={order.order_id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-orange-400">#{order.order_id}</span>
                      <span className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full">Table {order.table_number}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {order.items?.map((item, idx) => (
                        <p key={idx} className="text-xs text-gray-300">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-gray-200 mt-3">Total: ₹{order.total_amount}</p>
                    <p className="text-xs text-green-400 mt-3 text-center font-medium">Ready for pickup / serving</p>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
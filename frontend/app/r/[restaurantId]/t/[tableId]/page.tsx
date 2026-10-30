"use client";

import { useParams } from "next/navigation";
import { Suspense } from "react";

function TableContent() {
  const params = useParams();
  const restaurantId = params.restaurantId;
  const tableId = params.tableId;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-2xl p-6 max-w-md w-full text-center">
        <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          Empire Restaurant
        </span>
        <h1 className="text-2xl font-bold text-gray-800 mt-4">Welcome!</h1>
        <p className="text-gray-600 mt-2">
          You are seated at <span className="font-bold text-indigo-600">Table {tableId}</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">Restaurant ID: {restaurantId}</p>

        <div className="mt-6">
          <button 
            onClick={() => alert(`Session started for Table ${tableId}!`)}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-xl transition duration-200 shadow-lg shadow-orange-200 cursor-pointer"
          >
            View Menu & Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TablePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading table info...</div>}>
      <TableContent />
    </Suspense>
  );
}
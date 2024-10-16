"use client"
import { useCallback, useEffect, useState } from 'react';
import { useSupabase } from '../../hooks/useSupabase';

export default function Orders() {
  const { fetchOrders } = useSupabase();
  const [orders, setOrders] = useState([]);
  const userId = 1;  // Replace with actual user ID

  const fetchOrdersCallback = useCallback(
    () => fetchOrders(userId).then(setOrders),
    [fetchOrders, userId]
  );

  useEffect(() => {
    fetchOrdersCallback();
  }, [fetchOrdersCallback]);

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">My Orders</h2>
      {orders.length === 0 && <p>You have no orders.</p>}
      {orders.map(order => (
        <div key={order.id} className="border p-4 rounded mb-4">
          <p>Order ID: {order.id}</p>
          <p>Total Amount: Ksh. {order.total_amount}</p>
          <p>Status: {order.status}</p>
        </div>
      ))}
    </div>
  );
}


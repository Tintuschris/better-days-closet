"use client"
import { useEffect, useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';

export default function OrderTable() {
  const { fetchOrders, approveOrder } = useSupabase();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders().then(setOrders);
  }, []);

  const handleApprove = async (orderId) => {
    await approveOrder(orderId);
  };

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Status</th>
          <th>Mpesa Code</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>{order.id}</td>
            <td>{order.customer_name}</td>
            <td>{order.status}</td>
            <td>{order.mpesa_code}</td>
            <td>
              {order.status === 'pending' && (
                <button
                  onClick={() => handleApprove(order.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Approve
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

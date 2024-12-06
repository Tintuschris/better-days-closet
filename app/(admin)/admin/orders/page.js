"use client";
import { useState } from 'react';
import OrderTable from '../components/ordertable';
import { useSupabase } from '../hooks/useSupabase';
import { FiFilter } from 'react-icons/fi';

export default function OrderManagement() {
  const { useOrders } = useSupabase();
  const { data: orders, isLoading } = useOrders();
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders?.filter(order => 
    statusFilter === 'all' ? true : order.status === statusFilter
  );

  console.log('Orders Data:', orders);

  const orderStats = {
    total: orders?.length || 0,
    pending: orders?.filter(order => order.status === 'PENDING').length || 0,
    completed: orders?.filter(order => order.status === 'CONFIRMED').length || 0,
    cancelled: orders?.filter(order => order.status === 'CANCELLED').length || 0
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
        <div className="flex items-center space-x-2">
          <FiFilter className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-gray-300 rounded-md text-sm focus:ring-primarycolor focus:border-primarycolor"
          >
            <option value="all">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Orders</div>
          <div className="text-2xl font-bold">{orderStats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Completed</div>
          <div className="text-2xl font-bold text-green-600">{orderStats.completed}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Cancelled</div>
          <div className="text-2xl font-bold text-red-600">{orderStats.cancelled}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : (
        <OrderTable orders={filteredOrders} />
      )}
    </div>
  );
}

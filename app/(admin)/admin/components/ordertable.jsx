"use client";
import { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { FiEye, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'sonner';
export default function OrderTable() {
  const { useOrders, useUpdateOrderStatus } = useSupabase();
  const { data: orders, isLoading } = useOrders();
  const updateStatusMutation = useUpdateOrderStatus();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateStatusMutation.mutateAsync({ id: orderId, status });
      toast.success(`Order ${status} successfully`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delivery Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders?.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    #{order.id}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.profiles?.full_name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {order.delivery_option}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.region}, {order.area}
                  </div>
                  {order.pickup_point && (
                    <div className="text-sm text-gray-500">
                      Pickup: {order.pickup_point}
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    {order.courier_service}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    Ksh.{Number(order.total_amount).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    M-Pesa: {order.mpesa_code}
                  </div>
                  <div className="text-sm text-gray-500">
                    Delivery: Ksh.{Number(order.delivery_cost).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      title="View Details"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <FiEye size={18} />
                    </button>
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'completed')}
                          title="Mark as Completed"
                          className="text-green-600 hover:text-green-900"
                        >
                          <FiCheck size={18} />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                          title="Cancel Order"
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiX size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client"
import { useState, useCallback, useEffect } from 'react';
import { useSupabaseContext } from '../../context/supabaseContext';
import Image from 'next/image';

export default function Orders() {
  const { fetchOrders, user } = useSupabaseContext();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("ongoing");

  const fetchOrdersCallback = useCallback(
    async () => {
      if (user) {
        try {
          const orderData = await fetchOrders(user.id);
          setOrders(orderData);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      }
    },
    [fetchOrders, user]
  );

  useEffect(() => {
    fetchOrdersCallback();
  }, [fetchOrdersCallback]);

  const ongoingOrders = orders.filter(order => order.status === "PENDING");
  const completedOrders = orders.filter(order => order.status === "COMPLETED");

  const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <Image
        src="/clip-boards.png"
        alt="Empty state illustration"
        width={200}
        height={200}
        className="mb-6"
      />
      <p className="text-primarycolor mb-2">{message}</p>
      <p className="text-sm text-primarycolor">
        {activeTab === "ongoing" 
          ? "You don't have an ongoing order yet at this time!"
          : "Please make purchases to see your orders here."}
      </p>
    </div>
  );

  const OrderCard = ({ order }) => (
    <div className="bg-white rounded-lg shadow-sm mb-4 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-lg">{order.product_name}</h3>
          <p className="text-gray-600">Ksh. {order.total_amount}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-6 text-primarycolor">MY ORDERS</h2>
      
      {/* Tabs */}
      <div className="mb-8">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("ongoing")}
            className={`flex-1 py-2 text-center ${
              activeTab === "ongoing"
                ? "text-secondarycolor border-b-2 border-secondarycolor font-medium"
                : "text-gray-500"
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-2 text-center ${
              activeTab === "completed"
                ? "text-secondarycolor border-b-2 border-secondarycolor font-medium"
                : "text-gray-500"
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "ongoing" && (
          <div>
            {ongoingOrders.length === 0 ? (
              <EmptyState message="You don't have an order yet" />
            ) : (
              ongoingOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        )}

        {activeTab === "completed" && (
          <div className='text-primarycolor'>
            {completedOrders.length === 0 ? (
              <EmptyState message="You don't have any complete orders yet" className='text-primarycolor' />
            ) : (
              completedOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
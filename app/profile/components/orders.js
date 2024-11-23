"use client";
import { useState, useEffect } from 'react';
import { useSupabaseContext } from '../../context/supabaseContext';
import Image from 'next/image';

export default function Orders() {
  const { fetchOrders, user } = useSupabaseContext();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("ongoing");

  useEffect(() => {
    const getOrders = async () => {
      if (!user?.id) return;
      
      try {
        const orderData = await fetchOrders(user.id);
        if (orderData) {
          setOrders(orderData);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    if (user?.id) {
      getOrders();
    }
  }, [user?.id, fetchOrders]);

  const ongoingOrders = orders.filter((order) => order.status === "PENDING");
  const completedOrders = orders.filter(
    (order) => order.status === "COMPLETED"
  );

  const OrderCard = ({ order }) => (
    <div className="bg-primarycolor rounded-2xl mb-4 overflow-hidden shadow-sm">
      {order.cart_items?.map((item, index) => (
        <div
          key={`${order.id}-${index}`}
          className="flex items-center p-3 border-b last:border-b-0 border-white/10"
        >
          <div className="w-20 h-20 relative rounded-xl overflow-hidden">
            {item.product?.image_url && (
              <Image
                src={item.product.image_url}
                alt={item.product.name || "Product image"}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="flex-1 ml-4">
            <h3 className="font-medium text-white text-lg">
              {item.product?.name}
            </h3>
            <div className="flex justify-between items-center mt-2">
              <span className="text-secondarycolor text-sm">
                Quantity: {item.quantity}
              </span>
              <span className="text-secondarycolor font-semibold">
                Ksh. {item.total_amount}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center mb-6">
        <button
          onClick={() => window.history.back()}
          className="mr-4 text-primarycolor"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-primarycolor">MY ORDERS</h2>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex">
          <button
            onClick={() => setActiveTab("ongoing")}
            className={`flex-1 py-2 text-center ${
              activeTab === "ongoing"
                ? "text-primarycolor font-semibold"
                : "text-gray-500"
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-2 text-center ${
              activeTab === "completed"
                ? "text-secondarycolor font-semibold border-b-2 border-secondarycolor"
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
              ongoingOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        )}

        {activeTab === "completed" && (
          <div>
            {completedOrders.length === 0 ? (
              <EmptyState message="You don't have any complete orders yet" />
            ) : (
              completedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

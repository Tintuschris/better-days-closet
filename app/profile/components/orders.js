"use client";
import { useState, useEffect } from 'react';
import { useSupabaseContext } from '../../context/supabaseContext';
import { useRouter } from "next/navigation";
import {ChevronLeft} from 'lucide-react';
import Image from 'next/image';

export default function Orders() {
  const { fetchOrders, user } = useSupabaseContext();
  const [orders, setOrders] = useState([]);
  const router = useRouter();
  const { orders: contextOrders } = useSupabaseContext();
  const [activeTab, setActiveTab] = useState("ongoing");

  useEffect(() => {
    if (user?.id) {
      setOrders(contextOrders || []);
    }
  }, [user?.id, contextOrders]);

 // Filter orders by status
const ongoingOrders = orders.filter(order => 
  order.status === 'PENDING' || order.status === 'PROCESSING'
);

const completedOrders = orders.filter(order => 
  order.status === 'CONFIRMED' || order.status === 'DELIVERED'
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
        <div className="flex items-center justify-between mb-6 relative">
      <ChevronLeft 
        className="text-primarycolor cursor-pointer" 
        onClick={() => router.back()} 
      />
      <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-primarycolor">
        MY ORDERS
      </h1>
      <div className="w-6" /> {/* Spacer for alignment */}
    </div>

      {/* Tab navigation with proper spacing and centering */}
      <div className="flex justify-center items-center w-full border-b border-gray-200 mb-6">
        <div className="grid grid-cols-2 w-full">
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`pb-2 text-lg font-medium transition-all duration-200 text-center ${
              activeTab === 'ongoing'
                ? 'text-secondarycolor border-b-2 border-secondarycolor'
                : 'text-gray-400'
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-2 text-lg font-medium transition-all duration-200 text-center ${
              activeTab === 'completed'
                ? 'text-secondarycolor border-b-2 border-secondarycolor'
                : 'text-gray-400'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "ongoing" && (
          <div className="space-y-4">
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
          <div className="space-y-4">
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

"use client"
import { useState, useCallback, useEffect } from 'react';
import { useSupabaseContext } from '../../context/supabaseContext';
import Image from 'next/image';

export default function Orders() {
  const { fetchOrders, user, supabase } = useSupabaseContext();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("ongoing");
  const [ordersWithProducts, setOrdersWithProducts] = useState([]);

  const fetchOrdersCallback = useCallback(
    async () => {
      if (user && supabase) {  // Add check for supabase
        try {
          const orderData = await fetchOrders(user.id);
          setOrders(orderData);
          
          // Only proceed if we have orderData
          if (orderData && orderData.length > 0) {
            const ordersWithProductDetails = await Promise.all(
              orderData.map(async (order) => {
                const { data: product } = await supabase
                  .from('products')
                  .select('name, image_url, price')
                  .eq('id', order.product_id)
                  .single();
                
                return {
                  ...order,
                  product_name: product?.name,
                  product_image: product?.image_url,
                  product_price: product?.price
                };
              })
            );
            
            setOrdersWithProducts(ordersWithProductDetails);
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      }
    },
    [fetchOrders, user, supabase]
  );

  useEffect(() => {
    fetchOrdersCallback();
    console.log('Orders:', ordersWithProducts); // Add this
  }, [fetchOrdersCallback]);

  const ongoingOrders = ordersWithProducts.filter(order => order.status === "PENDING");
  const completedOrders = ordersWithProducts.filter(order => order.status === "COMPLETED");

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
    <div className="bg-primarycolor rounded-3xl mb-4 overflow-hidden">
      <div className="flex items-center">
        <div className="w-24 h-24 relative">
          <Image
            src={order.product_image}
            alt={order.product_name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 p-4 text-white">
          <h3 className="font-medium text-xl mb-1">{order.product_name}</h3>
          <p className="text-pink-300">Ksh. {order.product_price}</p>
        </div>
      </div>
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
              ongoingOrders.map(order => (
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
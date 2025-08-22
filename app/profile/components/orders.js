"use client";
import { useState, useEffect } from "react";
import { useSupabaseContext } from "../../context/supabaseContext";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { Button, GlassContainer, PremiumCard, GradientText } from "../../components/ui";

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
  const ongoingOrders = orders.filter(
    (order) => order.status === "PENDING" || order.status === "PROCESSING"
  );

  const completedOrders = orders.filter(
    (order) => order.status === "CONFIRMED" || order.status === "DELIVERED"
  );

  const OrderCard = ({ order }) => (
    <PremiumCard className="mb-4 overflow-hidden">
      <div className="bg-gradient-to-r from-primarycolor to-primarycolor/90 p-4">
        <div className="flex justify-between items-center text-white">
          <span className="font-medium">Order #{order.id}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-200' :
            order.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-200' :
            'bg-blue-500/20 text-blue-200'
          }`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {order.cart_items?.map((item, index) => (
          <div
            key={`${order.id}-${index}`}
            className="flex items-center space-x-4 p-3 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-xl"
          >
            <div className="w-16 h-16 relative rounded-lg overflow-hidden shadow-md">
              {item.product?.image_url && (
                <Image
                  src={item.product.image_url}
                  alt={item.product.name || "Product image"}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-primarycolor">
                {item.product?.name}
              </h3>
              <div className="flex justify-between items-center mt-1">
                <span className="text-primarycolor/70 text-sm">
                  Qty: {item.quantity}
                </span>
                <span className="text-primarycolor font-semibold">
                  Ksh. {item.total_amount}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PremiumCard>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30">
      {/* Premium Header */}
      <div className="sticky top-0 backdrop-blur-xl bg-white/80 border-b border-white/20 z-10 shadow-lg shadow-primarycolor/5">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="text-primarycolor flex items-center justify-center w-10 h-10 rounded-full hover:bg-gradient-to-r hover:from-primarycolor/10 hover:to-secondarycolor/10 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronLeft size={24} />
          </button>

          <GradientText className="text-lg font-semibold">
            My Orders
          </GradientText>

          <div className="w-10 h-10"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Premium Tab Navigation */}
        <GlassContainer className="p-2 mb-6">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setActiveTab("ongoing")}
              variant={activeTab === "ongoing" ? "primary" : "ghost"}
              size="md"
              radius="lg"
              fullWidth
            >
              Ongoing
            </Button>
            <Button
              onClick={() => setActiveTab("completed")}
              variant={activeTab === "completed" ? "primary" : "ghost"}
              size="md"
              radius="lg"
              fullWidth
            >
              Completed
            </Button>
          </div>
        </GlassContainer>

        {/* Tab Content */}
        <div className="mt-4">
        {activeTab === "ongoing" && (
          <div className="space-y-4">
            {ongoingOrders.length === 0 ? (
              <EmptyState message="You don't have an order yet" />
            ) : (
              ongoingOrders.map((order, index) => (
                <OrderCard key={`ongoing-${order.id || index}`} order={order} />
              ))
            )}
          </div>
        )}

        {activeTab === "completed" && (
          <div className="space-y-4">
            {completedOrders.length === 0 ? (
              <EmptyState message="You don't have any complete orders yet" />
            ) : (
              completedOrders.map((order, index) => (
                <OrderCard key={`completed-${order.id || index}`} order={order} />
              ))
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

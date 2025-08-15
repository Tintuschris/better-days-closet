"use client";
import { useState, useEffect } from 'react';
import { CheckCircle, Package, Truck, MapPin, Clock, Copy, ExternalLink, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';

export default function OrderConfirmation({ 
  order, 
  cartItems, 
  user, 
  guestInfo,
  onClose 
}) {
  const [copied, setCopied] = useState(false);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);

  useEffect(() => {
    // Calculate estimated delivery date based on delivery option
    const calculateDeliveryDate = () => {
      const now = new Date();
      let daysToAdd = 3; // Default 3 days

      if (order?.delivery_option === 'CBD Pickup Point') {
        daysToAdd = 1; // Next day for pickup
      } else if (order?.delivery_option === 'Nairobi Delivery') {
        daysToAdd = 2; // 2 days for Nairobi
      } else if (order?.delivery_option === 'Rest of Kenya') {
        daysToAdd = 5; // 5 days for rest of Kenya
      }

      const deliveryDate = new Date(now);
      deliveryDate.setDate(now.getDate() + daysToAdd);
      setEstimatedDelivery(deliveryDate);
    };

    calculateDeliveryDate();
  }, [order]);

  const copyOrderNumber = () => {
    if (order?.id) {
      navigator.clipboard.writeText(order.id.toString());
      setCopied(true);
      toast.success('Order number copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getDeliveryIcon = () => {
    switch (order?.delivery_option) {
      case 'CBD Pickup Point':
        return <MapPin className="w-5 h-5 text-primarycolor" />;
      case 'Nairobi Delivery':
      case 'Rest of Kenya':
        return <Truck className="w-5 h-5 text-primarycolor" />;
      default:
        return <Package className="w-5 h-5 text-primarycolor" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-primarycolor/5">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-primarycolor mb-2">
              Order Confirmed!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for your purchase. We&apos;ll send you updates on your order.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Details - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-primarycolor">Order Details</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order?.status)}`}>
                    {order?.status || 'Confirmed'}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm text-gray-500">Order Number</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-lg font-semibold text-primarycolor">
                        #{order?.id || 'N/A'}
                      </span>
                      <button
                        onClick={copyOrderNumber}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copy order number"
                      >
                        <Copy className={`w-4 h-4 ${copied ? 'text-green-600' : 'text-gray-400'}`} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Order Date</label>
                    <p className="font-semibold text-primarycolor mt-1">
                      {order?.created_at ? format(new Date(order.created_at), 'PPP') : 'Today'}
                    </p>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-primarycolor mb-3">Customer Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Name</label>
                      <p className="font-medium">{user?.name || guestInfo?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <p className="font-medium">{user?.email || guestInfo?.email || 'N/A'}</p>
                    </div>
                    {(guestInfo?.phone || user?.phone) && (
                      <div>
                        <label className="text-sm text-gray-500">Phone</label>
                        <p className="font-medium">{guestInfo?.phone || user?.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  {getDeliveryIcon()}
                  <h2 className="text-xl font-semibold text-primarycolor">Delivery Information</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Delivery Method</label>
                    <p className="font-semibold text-primarycolor mt-1">
                      {order?.delivery_option || 'Standard Delivery'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Estimated Delivery</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <p className="font-semibold text-primarycolor">
                        {estimatedDelivery ? format(estimatedDelivery, 'PPP') : 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>

                {order?.area && (
                  <div className="mt-4 pt-4 border-t">
                    <label className="text-sm text-gray-500">Delivery Address</label>
                    <p className="font-medium mt-1">
                      {order.area}
                      {order.region && order.region !== order.area && `, ${order.region}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-primarycolor mb-4">Order Items</h2>
                <div className="space-y-4">
                  {cartItems?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-primarycolor">{item.name || 'Product'}</h3>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity || 1}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primarycolor">
                          KES {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Panel - Right Column */}
            <div className="space-y-6">
              {/* Order Total */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-primarycolor mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">KES {(order?.total_amount - order?.delivery_cost || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium">KES {(order?.delivery_cost || 0).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-primarycolor">Total</span>
                      <span className="text-lg font-bold text-primarycolor">
                        KES {(order?.total_amount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {user ? (
                  <Link
                    href="/profile?tab=orders"
                    className="w-full bg-primarycolor text-white py-3 px-6 rounded-full font-semibold hover:bg-primarycolor/90 transition-colors flex items-center justify-center gap-2"
                  >
                    View All Orders
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href={`/track-order?order=${order?.id}&email=${guestInfo?.email || ''}`}
                      className="w-full bg-primarycolor text-white py-3 px-6 rounded-full font-semibold hover:bg-primarycolor/90 transition-colors flex items-center justify-center gap-2"
                    >
                      Track This Order
                      <Package className="w-4 h-4" />
                    </Link>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 mb-3">
                        Create an account to track your orders and enjoy faster checkout!
                      </p>
                      <Link
                        href="/auth/signup"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        Create Account
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 text-primarycolor py-3 px-6 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Help Section */}
              <div className="bg-primarycolor/5 rounded-xl p-6">
                <h3 className="font-semibold text-primarycolor mb-3">Need Help?</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    Questions about your order? We&apos;re here to help!
                  </p>
                  <div className="space-y-1">
                    <p className="text-primarycolor font-medium">📧 support@betterdayscloset.com</p>
                    <p className="text-primarycolor font-medium">📱 +254 XXX XXX XXX</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

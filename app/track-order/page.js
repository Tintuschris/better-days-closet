"use client";
import { useState, useEffect, Suspense } from 'react';
import {
  MagnifyingGlassIcon as Search,
  CubeIcon as Package,
  TruckIcon as Truck,
  CheckCircleIcon as CheckCircle,
  ClockIcon as Clock,
  ExclamationCircleIcon as AlertCircle,
  ChevronLeftIcon as ChevronLeft
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';

// Loading component for Suspense fallback
function TrackOrderSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-200 rounded-full animate-pulse w-10 h-10"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main track order component that uses useSearchParams
function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchData, setSearchData] = useState({
    orderNumber: '',
    email: ''
  });
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill form from URL parameters
  useEffect(() => {
    const orderParam = searchParams.get('order');
    const emailParam = searchParams.get('email');

    if (orderParam || emailParam) {
      setSearchData({
        orderNumber: orderParam || '',
        email: emailParam || ''
      });

      // Auto-search if both parameters are provided
      if (orderParam && emailParam) {
        setTimeout(() => {
          handleSearch(null, orderParam, emailParam);
        }, 500);
      }
    }
  }, [searchParams]); // handleSearch is defined after this useEffect

  const handleSearch = async (e, orderNumber = null, email = null) => {
    if (e) e.preventDefault();

    const orderNum = orderNumber || searchData.orderNumber.trim();
    const emailAddr = email || searchData.email.trim();

    if (!orderNum || !emailAddr) {
      toast.error('Please enter both order number and email');
      return;
    }

    setIsLoading(true);
    setError('');
    setOrder(null);

    try {
      // Search for order by ID and email
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderNum)
        .single();

      if (orderError) {
        throw new Error('Order not found');
      }

      // Verify email matches (for guest orders, check cart_items for guest details)
      let emailMatch = false;
      
      if (orderData.user_id) {
        // For registered users, check user email
        const { data: userData } = await supabase
          .from('users')
          .select('email')
          .eq('id', orderData.user_id)
          .single();
        
        emailMatch = userData?.email?.toLowerCase() === emailAddr.toLowerCase();
      } else {
        // For guest orders, check guest details in cart_items
        const guestDetails = orderData.cart_items?.[0]?.guest_details;
        emailMatch = guestDetails?.email?.toLowerCase() === emailAddr.toLowerCase();
      }

      if (!emailMatch) {
        throw new Error('Email does not match order records');
      }

      setOrder(orderData);
    } catch (err) {
      console.error('Error searching order:', err);
      setError(err.message || 'Order not found. Please check your order number and email.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'processing':
        return <Package className="w-6 h-6 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'shipped':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEstimatedDelivery = (order) => {
    if (!order?.created_at) return null;
    
    const orderDate = new Date(order.created_at);
    let daysToAdd = 3; // Default

    if (order.delivery_option === 'CBD Pickup Point') {
      daysToAdd = 1;
    } else if (order.delivery_option === 'Nairobi Delivery') {
      daysToAdd = 2;
    } else if (order.delivery_option === 'Rest of Kenya') {
      daysToAdd = 5;
    }

    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(orderDate.getDate() + daysToAdd);
    return estimatedDate;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-primarycolor" />
            </button>
            <h1 className="text-2xl font-bold text-primarycolor">Track Your Order</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Search className="w-6 h-6 text-primarycolor" />
            <h2 className="text-xl font-semibold text-primarycolor">Find Your Order</h2>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  value={searchData.orderNumber}
                  onChange={(e) => setSearchData(prev => ({ ...prev, orderNumber: e.target.value }))}
                  placeholder="Enter your order number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primarycolor focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={searchData.email}
                  onChange={(e) => setSearchData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primarycolor focus:border-transparent"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primarycolor text-white py-3 px-6 rounded-lg font-semibold hover:bg-primarycolor/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Track Order
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Order Results */}
        {order && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primarycolor">Order Details</h2>
              <div className={`px-4 py-2 rounded-full border ${getStatusColor(order.status)}`}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className="font-semibold capitalize">{order.status || 'Pending'}</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Order Information */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Order Number</label>
                  <p className="font-semibold text-primarycolor">#{order.id}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Order Date</label>
                  <p className="font-medium">{format(new Date(order.created_at), 'PPP')}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Total Amount</label>
                  <p className="font-semibold text-primarycolor">KES {order.total_amount?.toLocaleString()}</p>
                </div>
                {order.mpesa_code && (
                  <div>
                    <label className="text-sm text-gray-500">M-PESA Code</label>
                    <p className="font-medium">{order.mpesa_code}</p>
                  </div>
                )}
              </div>

              {/* Delivery Information */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Delivery Method</label>
                  <p className="font-medium">{order.delivery_option || 'Standard Delivery'}</p>
                </div>
                {order.area && (
                  <div>
                    <label className="text-sm text-gray-500">Delivery Location</label>
                    <p className="font-medium">
                      {order.area}
                      {order.region && order.region !== order.area && `, ${order.region}`}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-500">Estimated Delivery</label>
                  <p className="font-medium">
                    {getEstimatedDelivery(order) ? format(getEstimatedDelivery(order), 'PPP') : 'TBD'}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-primarycolor mb-4">Order Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-gray-600">{format(new Date(order.created_at), 'PPp')}</p>
                  </div>
                </div>
                
                {order.status === 'CONFIRMED' && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Payment Confirmed</p>
                      <p className="text-sm text-gray-600">Your payment has been verified</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-600">Processing</p>
                    <p className="text-sm text-gray-500">We&apos;re preparing your order</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-600">Shipped</p>
                    <p className="text-sm text-gray-500">Your order is on its way</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-600">Delivered</p>
                    <p className="text-sm text-gray-500">Order delivered successfully</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 pt-6 border-t bg-primarycolor/5 rounded-lg p-4">
              <h3 className="font-semibold text-primarycolor mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-3">
                If you have any questions about your order, please contact our support team.
              </p>
              <div className="space-y-1 text-sm">
                <p className="text-primarycolor font-medium">📧 support@betterdayscloset.com</p>
                <p className="text-primarycolor font-medium">📱 +254 XXX XXX XXX</p>
              </div>
            </div>
          </div>
        )}

        {/* Help Section for users without orders */}
        {!order && !isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-primarycolor mb-4">How to Track Your Order</h2>
            <div className="space-y-3 text-gray-600">
              <p>• Enter your order number (found in your order confirmation)</p>
              <p>• Enter the email address used during checkout</p>
              <p>• Click &quot;Track Order&quot; to view your order status</p>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Don&apos;t have an account?</h3>
              <p className="text-blue-700 text-sm mb-3">
                Create an account to easily track all your orders and enjoy faster checkout!
              </p>
              <button
                onClick={() => router.push('/auth/signup')}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Create Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function TrackOrderPage() {
  return (
    <Suspense fallback={<TrackOrderSkeleton />}>
      <TrackOrderContent />
    </Suspense>
  );
}

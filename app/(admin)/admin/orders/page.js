"use client";
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FiSearch, FiFilter, FiDownload, FiEye, FiEdit, FiClock,
  FiShoppingBag, FiTruck, FiCheckCircle, FiXCircle, FiCalendar,
  FiUser, FiMapPin, FiDollarSign, FiPackage
} from 'react-icons/fi';
import { toast } from 'sonner';
import BulkOperations, { BulkSelectCheckbox, orderBulkOperations } from '../components/BulkOperations';
import { useSupabase } from '../hooks/useSupabase';
import { PremiumCard, Button, GradientText } from '../../../components/ui';

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-primarycolor/20 rounded w-48 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-primarycolor/10 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-32 bg-primarycolor/15 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order, isSelected, onSelect, onStatusUpdate, onViewDetails }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return FiClock;
      case 'confirmed': return FiCheckCircle;
      case 'shipped': return FiTruck;
      case 'delivered': return FiPackage;
      case 'cancelled': return FiXCircle;
      default: return FiShoppingBag;
    }
  };

  const StatusIcon = getStatusIcon(order.status);

  return (
    <PremiumCard
      className="p-3 sm:p-4 hover:shadow-xl transition-all duration-300 group"
      data-id={order.id}
      data-highlight={order.id}
      id={`item-${order.id}`}
    >
      {/* Mobile Layout */}
      <div className="block sm:hidden">
        <div className="flex items-start gap-2 mb-3">
          <BulkSelectCheckbox
            itemId={order.id}
            isSelected={isSelected}
            onSelectionChange={onSelect}
            className="mt-1 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-primarycolor text-sm">
                Order #{order.id}
              </h3>
              <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                <StatusIcon className="w-3 h-3 inline mr-1" />
                {order.status}
              </span>
            </div>

            <div className="text-sm font-bold text-primarycolor mb-2">
              KES {parseFloat(order.total_amount || 0).toLocaleString()}
            </div>

            <div className="text-xs text-primarycolor/70 space-y-1">
              <div className="flex items-center gap-1">
                <FiCalendar className="w-3 h-3" />
                {new Date(order.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <FiUser className="w-3 h-3" />
                <span className="truncate">{order.user?.name || 'Unknown Customer'}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiPackage className="w-3 h-3" />
                {order.cart_items?.length || 0} items
              </div>
              {order.delivery_address && (
                <div className="flex items-center gap-1">
                  <FiMapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{order.delivery_address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-primarycolor/10">
          <button
            onClick={() => onViewDetails(order)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-primarycolor hover:bg-primarycolor/10 rounded-lg transition-colors"
          >
            <FiEye className="w-3 h-3" />
            View Details
          </button>
          <select
            value={order.status}
            onChange={(e) => onStatusUpdate(order.id, e.target.value)}
            className="text-xs px-2 py-1 border border-primarycolor/30 rounded text-primarycolor bg-white hover:bg-primarycolor/5 transition-colors"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex items-start gap-3">
        <BulkSelectCheckbox
          itemId={order.id}
          isSelected={isSelected}
          onSelectionChange={onSelect}
          className="mt-1"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-primarycolor flex items-center gap-2">
                Order #{order.id}
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                  <StatusIcon className="w-3 h-3 inline mr-1" />
                  {order.status}
                </span>
              </h3>
              <div className="flex items-center gap-4 text-sm text-primarycolor/70 mt-1">
                <span className="flex items-center gap-1">
                  <FiCalendar className="w-3 h-3" />
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <FiUser className="w-3 h-3" />
                  {order.user?.name || 'Unknown Customer'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-primarycolor">
                KES {parseFloat(order.total_amount || 0).toLocaleString()}
              </p>
              <p className="text-xs text-primarycolor/60">
                {order.cart_items?.length || 0} items
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-primarycolor/70">
              {order.delivery_address && (
                <span className="flex items-center gap-1 truncate max-w-[200px]">
                  <FiMapPin className="w-3 h-3 flex-shrink-0" />
                  {order.delivery_address}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onViewDetails(order)}
                className="p-1.5 text-primarycolor hover:bg-primarycolor/10 rounded-lg transition-colors"
                title="View details"
              >
                <FiEye className="w-4 h-4" />
              </button>
              <select
                value={order.status}
                onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                className="text-xs px-2 py-1 border border-primarycolor/30 rounded text-primarycolor bg-white hover:bg-primarycolor/5 transition-colors"
                title="Update status"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}

export default function OrderManagement() {
  const { useOrders, useUpdateOrderStatus } = useSupabase();
  const { data: orders, isLoading } = useOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const searchParams = useSearchParams();

  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Handle search highlighting from URL params
  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    const shouldScroll = searchParams.get('scroll');

    if (highlightId && shouldScroll) {
      setTimeout(() => {
        const element = document.querySelector(`[data-id="${highlightId}"]`);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          element.classList.add('highlight-search-result');
          setTimeout(() => {
            element.classList.remove('highlight-search-result');
          }, 3000);
        }
      }, 500);
    }
  }, [searchParams]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filter orders based on search and filters
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter(order => {
      const matchesSearch = order.id?.toString().includes(searchTerm) ||
                           order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status?.toLowerCase() === statusFilter;

      const matchesDate = dateFilter === 'all' || (() => {
        const orderDate = new Date(order.created_at);
        const now = new Date();
        const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case 'today': return daysDiff === 0;
          case 'week': return daysDiff <= 7;
          case 'month': return daysDiff <= 30;
          default: return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, dateFilter]);

  // Order statistics
  const orderStats = useMemo(() => {
    if (!orders) return { total: 0, pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0, totalRevenue: 0 };

    return {
      total: orders.length,
      pending: orders.filter(o => o.status?.toLowerCase() === 'pending').length,
      confirmed: orders.filter(o => o.status?.toLowerCase() === 'confirmed').length,
      shipped: orders.filter(o => o.status?.toLowerCase() === 'shipped').length,
      delivered: orders.filter(o => o.status?.toLowerCase() === 'delivered').length,
      cancelled: orders.filter(o => o.status?.toLowerCase() === 'cancelled').length,
      totalRevenue: orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0)
    };
  }, [orders]);

  // Handle bulk operations
  const handleBulkAction = async (actionId, selectedIds) => {
    switch (actionId) {
      case 'update-status':
        toast.info('Status update modal not implemented yet');
        break;
      case 'export':
        const selectedOrdersData = orders.filter(o => selectedIds.includes(o.id));
        const csvContent = "data:text/csv;charset=utf-8," +
          "Order ID,Customer,Status,Total,Date,Items\n" +
          selectedOrdersData.map(o =>
            `${o.id},"${o.user?.name || 'Unknown'}",${o.status},${o.total_amount},"${new Date(o.created_at).toLocaleDateString()}",${o.cart_items?.length || 0}`
          ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "orders.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Orders exported successfully');
        break;
      default:
        toast.info(`${actionId} action not implemented yet`);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status: newStatus });
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <GradientText className="text-2xl font-bold mb-2">
            Order Management
          </GradientText>
          <p className="text-primarycolor/70">
            Track and manage customer orders, update statuses, and process shipments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleBulkAction('export', filteredOrders.map(o => o.id))}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Total Orders</p>
              <p className="text-2xl font-bold text-primarycolor">{orderStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <FiShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Shipped Orders</p>
              <p className="text-2xl font-bold text-purple-600">{orderStats.shipped}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
              <FiTruck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Total Revenue</p>
              <p className="text-2xl font-bold text-primarycolor">KES {orderStats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-primarycolor/10 to-secondarycolor/10 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-primarycolor" />
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Bulk Operations */}
      <BulkOperations
        items={filteredOrders}
        selectedItems={selectedOrders}
        onSelectionChange={setSelectedOrders}
        operations={orderBulkOperations}
        onBulkAction={handleBulkAction}
        isLoading={updateOrderStatus.isLoading}
        itemType="orders"
      />

      {/* Filters */}
      <PremiumCard className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primarycolor/60 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders by ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/60 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor text-primarycolor placeholder-primarycolor/60"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FiFilter className="text-primarycolor/60" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white/60 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor text-primarycolor"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 bg-white/60 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor text-primarycolor"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </PremiumCard>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <PremiumCard className="p-8 text-center">
            <div className="w-16 h-16 bg-primarycolor/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShoppingBag className="w-8 h-8 text-primarycolor/60" />
            </div>
            <p className="text-primarycolor/70">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'No orders found matching your filters.'
                : 'No orders found.'}
            </p>
          </PremiumCard>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isSelected={selectedOrders.includes(order.id)}
              onSelect={(orderId) => {
                if (selectedOrders.includes(orderId)) {
                  setSelectedOrders(selectedOrders.filter(id => id !== orderId));
                } else {
                  setSelectedOrders([...selectedOrders, orderId]);
                }
              }}
              onStatusUpdate={handleStatusUpdate}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PremiumCard className="overflow-hidden">
              <div className="bg-gradient-to-r from-primarycolor to-primarycolor/90 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <GradientText className="text-lg font-semibold text-white">
                      Order Details #{selectedOrder.id}
                    </GradientText>
                    <p className="text-white/80 text-sm mt-1">
                      Order placed on {new Date(selectedOrder.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <FiXCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-primarycolor/70">Customer</p>
                    <p className="font-semibold text-primarycolor">{selectedOrder.user?.name || 'Unknown'}</p>
                    <p className="text-sm text-primarycolor/70">{selectedOrder.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-primarycolor/70">Total Amount</p>
                    <p className="font-semibold text-primarycolor text-lg">
                      KES {parseFloat(selectedOrder.total_amount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedOrder.delivery_address && (
                  <div>
                    <p className="text-sm text-primarycolor/70">Delivery Address</p>
                    <p className="text-primarycolor">{selectedOrder.delivery_address}</p>
                  </div>
                )}

                {selectedOrder.cart_items && selectedOrder.cart_items.length > 0 && (
                  <div>
                    <p className="text-sm text-primarycolor/70 mb-2">Order Items</p>
                    <div className="space-y-2">
                      {selectedOrder.cart_items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-primarycolor">{item.product?.name || 'Unknown Product'}</span>
                          <span className="text-primarycolor/70">
                            {item.quantity} × KES {parseFloat(item.price || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </PremiumCard>
          </div>
        </div>
      )}
    </div>
  );
}

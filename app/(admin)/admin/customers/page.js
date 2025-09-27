"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSupabase } from '../hooks/useSupabase';
import { FiSearch, FiFilter, FiDownload, FiUser, FiMail, FiPhone, FiCalendar, FiEdit, FiUnlock, FiLock, FiGift, FiX, FiSave, FiTrash2, FiEye } from 'react-icons/fi';
import { PremiumCard, GradientText, Button } from '../../../components/ui';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { toast } from 'sonner';

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
          <div key={i} className="h-16 bg-primarycolor/15 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function CustomerCard({ customer, onEdit, onBlock, onDelete, onView, onAddPoints }) {
  const isBlocked = customer.is_blocked || customer.status === 'blocked';

  return (
    <PremiumCard
      className="p-3 sm:p-4 hover:shadow-xl transition-all duration-300"
      data-id={customer.id}
      data-highlight={customer.id}
      id={`item-${customer.id}`}
    >
      {/* Mobile Layout */}
      <div className="block sm:hidden">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${isBlocked ? 'from-red-500 to-red-600' : 'from-primarycolor to-primarycolor/80'} rounded-full flex items-center justify-center text-white shadow-lg shadow-primarycolor/30 flex-shrink-0`}>
            <FiUser className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-primarycolor text-sm">{customer.name}</h3>
              {isBlocked && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">Blocked</span>
              )}
            </div>
            <div className="text-xs text-primarycolor/70 mb-1">
              <FiMail className="w-3 h-3 inline mr-1" />
              <span className="break-all">{customer.email}</span>
            </div>
            {customer.phone && (
              <div className="text-xs text-primarycolor/70 mb-1">
                <FiPhone className="w-3 h-3 inline mr-1" />
                <span>{customer.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex justify-between items-center mb-3 text-xs">
          <div className="text-primarycolor">
            <span className="font-medium">{customer.order_count || 0}</span> orders
          </div>
          <div className="text-green-600 font-medium">
            KES {(customer.total_spent || 0).toLocaleString()}
          </div>
          <div className="text-primarycolor/60">
            <FiCalendar className="w-3 h-3 inline mr-1" />
            {new Date(customer.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Admin Notes */}
        {customer.admin_notes && (
          <div className="mb-3 p-2 bg-primarycolor/5 rounded text-xs text-primarycolor/70">
            <strong>Note:</strong> {customer.admin_notes}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-1 justify-center">
          <Button
            onClick={() => onView(customer)}
            variant="outline"
            size="sm"
            className="p-1.5 text-xs"
            title="View"
          >
            <FiEye className="w-3 h-3" />
          </Button>
          <Button
            onClick={() => onEdit(customer)}
            variant="outline"
            size="sm"
            className="p-1.5 text-xs"
            title="Edit"
          >
            <FiEdit className="w-3 h-3" />
          </Button>
          <Button
            onClick={() => onAddPoints(customer)}
            variant="outline"
            size="sm"
            className="p-1.5 text-xs"
            title="Points"
          >
            <FiGift className="w-3 h-3" />
          </Button>
          <Button
            onClick={() => onBlock(customer)}
            variant={isBlocked ? "outline" : "destructive"}
            size="sm"
            className="p-1.5 text-xs"
            title={isBlocked ? "Unblock" : "Block"}
          >
            {isBlocked ? <FiUnlock className="w-3 h-3" /> : <FiLock className="w-3 h-3" />}
          </Button>
          <Button
            onClick={() => onDelete(customer)}
            variant="destructive"
            size="sm"
            className="p-1.5 text-xs"
            title="Delete"
          >
            <FiTrash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex items-start gap-3">
        <div className={`w-12 h-12 bg-gradient-to-br ${isBlocked ? 'from-red-500 to-red-600' : 'from-primarycolor to-primarycolor/80'} rounded-full flex items-center justify-center text-white shadow-lg shadow-primarycolor/30 flex-shrink-0`}>
          <FiUser className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-primarycolor">{customer.name}</h3>
            {isBlocked && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Blocked</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-primarycolor/70 mt-1">
            <FiMail className="w-3 h-3" />
            <span className="truncate">{customer.email}</span>
          </div>
          {customer.phone && (
            <div className="flex items-center gap-1 text-sm text-primarycolor/70 mt-1">
              <FiPhone className="w-3 h-3" />
              <span>{customer.phone}</span>
            </div>
          )}
          {customer.admin_notes && (
            <div className="mt-2 p-2 bg-primarycolor/5 rounded text-xs text-primarycolor/70">
              <strong>Note:</strong> {customer.admin_notes}
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-primarycolor/60 mt-2">
            <FiCalendar className="w-3 h-3" />
            <span>Joined {new Date(customer.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-sm font-semibold text-primarycolor">
            {customer.order_count || 0} orders
          </div>
          <div className="text-xs text-primarycolor/60 mb-3">
            KES {(customer.total_spent || 0).toLocaleString()}
          </div>
          <div className="flex gap-1 flex-wrap justify-end">
            <Button
              onClick={() => onView(customer)}
              variant="outline"
              size="sm"
              className="p-1"
              title="View Details"
            >
              <FiEye className="w-3 h-3" />
            </Button>
            <Button
              onClick={() => onEdit(customer)}
              variant="outline"
              size="sm"
              className="p-1"
              title="Edit Customer"
            >
              <FiEdit className="w-3 h-3" />
            </Button>
            <Button
              onClick={() => onAddPoints(customer)}
              variant="outline"
              size="sm"
              className="p-1"
              title="Add Loyalty Points"
            >
              <FiGift className="w-3 h-3" />
            </Button>
            <Button
              onClick={() => onBlock(customer)}
              variant={isBlocked ? "outline" : "destructive"}
              size="sm"
              className="p-1"
              title={isBlocked ? "Unblock Customer" : "Block Customer"}
            >
              {isBlocked ? <FiUnlock className="w-3 h-3" /> : <FiLock className="w-3 h-3" />}
            </Button>
            <Button
              onClick={() => onDelete(customer)}
              variant="destructive"
              size="sm"
              className="p-1"
              title="Delete Customer"
            >
              <FiTrash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}

// Customer Details View Modal
function CustomerDetailsModal({ customer, isOpen, onClose }) {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-primarycolor to-primarycolor/90 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Customer Details</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-primarycolor mb-4 border-b border-primarycolor/20 pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primarycolor/70 mb-1">Name</label>
                  <p className="text-primarycolor font-medium">{customer.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primarycolor/70 mb-1">Email</label>
                  <p className="text-primarycolor">{customer.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primarycolor/70 mb-1">Phone</label>
                  <p className="text-primarycolor">{customer.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primarycolor/70 mb-1">Status</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    customer.status === 'active' ? 'bg-green-100 text-green-800' :
                    customer.status === 'blocked' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.status || 'active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-primarycolor mb-4 border-b border-primarycolor/20 pb-2">
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primarycolor/70 mb-1">Address</label>
                  <p className="text-primarycolor">{customer.address || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primarycolor/70 mb-1">City</label>
                  <p className="text-primarycolor">{customer.city || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primarycolor/70 mb-1">Country</label>
                  <p className="text-primarycolor">{customer.country || 'Kenya'}</p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-primarycolor mb-4 border-b border-primarycolor/20 pb-2">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primarycolor/70 mb-1">Account Type</label>
                  <p className="text-primarycolor capitalize">{customer.account_type || 'regular'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primarycolor/70 mb-1">Loyalty Points</label>
                  <p className="text-primarycolor font-medium">{customer.loyalty_points || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primarycolor/70 mb-1">Member Since</label>
                  <p className="text-primarycolor">{new Date(customer.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Order Statistics */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-primarycolor mb-4 border-b border-primarycolor/20 pb-2">
                Order Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primarycolor/5 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-primarycolor/70 mb-1">Total Orders</label>
                  <p className="text-2xl font-bold text-primarycolor">{customer.order_count || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-green-700 mb-1">Total Spent</label>
                  <p className="text-2xl font-bold text-green-600">KES {(customer.total_spent || 0).toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-blue-700 mb-1">Last Order</label>
                  <p className="text-sm text-blue-600">
                    {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'No orders yet'}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            {customer.admin_notes && (
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-primarycolor mb-4 border-b border-primarycolor/20 pb-2">
                  Admin Notes
                </h3>
                <div className="bg-primarycolor/5 p-4 rounded-lg">
                  <p className="text-primarycolor">{customer.admin_notes}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t border-primarycolor/10">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Customer Edit Modal Component
function CustomerEditModal({ customer, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Kenya',
    date_of_birth: '',
    gender: '',
    account_type: 'regular',
    loyalty_points: 0,
    admin_notes: '',
    status: 'active'
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        country: customer.country || 'Kenya',
        date_of_birth: customer.date_of_birth || '',
        gender: customer.gender || '',
        account_type: customer.account_type || 'regular',
        loyalty_points: customer.loyalty_points || 0,
        admin_notes: customer.admin_notes || '',
        status: customer.status || 'active'
      });
    }
  }, [customer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(customer.id, formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-primarycolor to-primarycolor/90 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Edit Customer</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primarycolor mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-primarycolor/20 rounded-lg focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 placeholder:text-primarycolor/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primarycolor mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-primarycolor/20 rounded-lg focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 placeholder:text-primarycolor/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primarycolor mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-primarycolor/20 rounded-lg focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 placeholder:text-primarycolor/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primarycolor mb-2">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border border-primarycolor/20 rounded-lg focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 placeholder:text-primarycolor/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primarycolor mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-primarycolor/20 rounded-lg focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 placeholder:text-primarycolor/50"
                rows="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primarycolor mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                className="w-full px-3 py-2 border border-primarycolor/20 rounded-lg focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 placeholder:text-primarycolor/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primarycolor mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full px-3 py-2 border border-primarycolor/20 rounded-lg focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 placeholder:text-primarycolor/50"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primarycolor mb-2">Account Type</label>
              <select
                value={formData.account_type}
                onChange={(e) => setFormData(prev => ({ ...prev, account_type: e.target.value }))}
                className="w-full px-3 py-2 border border-primarycolor/20 rounded-lg focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 placeholder:text-primarycolor/50"
              >
                <option value="regular">Regular</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primarycolor mb-2">Loyalty Points</label>
              <input
                type="number"
                value={formData.loyalty_points}
                onChange={(e) => setFormData(prev => ({ ...prev, loyalty_points: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-primarycolor/20 rounded-lg focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 placeholder:text-primarycolor/50"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primarycolor mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-primarycolor/20 rounded-lg focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 placeholder:text-primarycolor/50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primarycolor mb-2">Admin Notes</label>
              <textarea
                value={formData.admin_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                className="w-full px-3 py-2 border border-primarycolor/20 rounded-lg focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 placeholder:text-primarycolor/50"
                rows="3"
                placeholder="Internal notes about this customer..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-primarycolor/10">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex items-center gap-2"
            >
              <FiSave className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CustomerManagementContent() {
  const { useCustomers, useUpdateCustomer, useBlockCustomer } = useSupabase();
  const { data: customers, isLoading } = useCustomers();
  const updateCustomer = useUpdateCustomer();
  const blockCustomer = useBlockCustomer();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const searchParams = useSearchParams();

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [confirmBlockOpen, setConfirmBlockOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingBlockAction, setPendingBlockAction] = useState('block');
  const [confirmDeleteName, setConfirmDeleteName] = useState('');
  const [confirmDeleteInput, setConfirmDeleteInput] = useState('');
  const [addPointsOpen, setAddPointsOpen] = useState(false);
  const [pointsInput, setPointsInput] = useState('0');

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

  // Customer management functions
  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setEditModalOpen(true);
  };

  const handleSaveCustomer = async (customerId, formData) => {
    try {
      await updateCustomer.mutateAsync({
        id: customerId,
        updates: formData
      });
      toast.success('Customer updated successfully');
      setEditModalOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update customer');
    }
  };

  const handleBlockCustomer = (customer) => {
    const isBlocked = customer.is_blocked || customer.status === 'blocked';
    const action = isBlocked ? 'unblock' : 'block';
    setSelectedCustomer(customer);
    setPendingBlockAction(action);
    setConfirmBlockOpen(true);
  };

  const handleDeleteCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setConfirmDeleteName(customer?.name || '');
    setConfirmDeleteInput('');
    setConfirmDeleteOpen(true);
  };

  const handleViewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setDetailsModalOpen(true);
  };

  const handleAddLoyaltyPoints = (customer) => {
    setSelectedCustomer(customer);
    setPointsInput('0');
    setAddPointsOpen(true);
  };

  // Filter customers based on search and status
  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && (customer.order_count || 0) > 0;
    if (filterStatus === 'inactive') return matchesSearch && (customer.order_count || 0) === 0;
    
    return matchesSearch;
  }) || [];

  const customerStats = {
    total: customers?.length || 0,
    active: customers?.filter(c => (c.order_count || 0) > 0).length || 0,
    inactive: customers?.filter(c => (c.order_count || 0) === 0).length || 0,
    totalSpent: customers?.reduce((sum, c) => sum + (c.total_spent || 0), 0) || 0
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <ConfirmModal
        open={confirmBlockOpen && !!selectedCustomer}
        title={`${pendingBlockAction === 'block' ? 'Block' : 'Unblock'} Customer`}
        description={`Are you sure you want to ${pendingBlockAction} ${selectedCustomer?.name || ''}?`}
        onCancel={() => setConfirmBlockOpen(false)}
        onConfirm={() => {
          blockCustomer.mutateAsync({ id: selectedCustomer.id, blocked: pendingBlockAction === 'block' })
            .then(() => toast.success(`Customer ${pendingBlockAction}ed successfully`))
            .catch(() => toast.error(`Failed to ${pendingBlockAction} customer`))
            .finally(() => setConfirmBlockOpen(false));
        }}
        confirmLabel={pendingBlockAction === 'block' ? 'Block' : 'Unblock'}
        variant="danger"
      />

      <ConfirmModal
        open={confirmDeleteOpen && !!selectedCustomer}
        title="Delete Customer"
        description={`Are you sure you want to permanently delete ${confirmDeleteName}? This action cannot be undone.`}
        typeToConfirmText={confirmDeleteName}
        confirmInput={confirmDeleteInput}
        onConfirmInputChange={setConfirmDeleteInput}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={async () => {
          try {
            await updateCustomer.mutateAsync({ id: selectedCustomer.id, updates: { status: 'deleted', admin_notes: `Deleted on ${new Date().toISOString()}` } });
            toast.success('Customer deleted successfully');
          } catch (error) {
            toast.error('Failed to delete customer');
          } finally {
            setConfirmDeleteOpen(false);
          }
        }}
        confirmLabel="Delete"
        variant="danger"
      />

      <ConfirmModal
        open={addPointsOpen && !!selectedCustomer}
        title="Add Loyalty Points"
        description={`Enter points to add for ${selectedCustomer?.name || ''}:`}
        onCancel={() => setAddPointsOpen(false)}
        onConfirm={() => {
          const num = parseInt(pointsInput);
          if (isNaN(num)) { toast.error('Please enter a valid number'); return; }
          const newPoints = (selectedCustomer.loyalty_points || 0) + num;
          updateCustomer.mutateAsync({ id: selectedCustomer.id, updates: { loyalty_points: newPoints } })
            .then(() => toast.success(`Added ${num} loyalty points`))
            .catch(() => toast.error('Failed to add loyalty points'))
            .finally(() => setAddPointsOpen(false));
        }}
        confirmLabel="Add Points"
        variant="primary"
      >
        <input type="number" value={pointsInput} onChange={(e) => setPointsInput(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded" />
      </ConfirmModal>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <GradientText className="text-2xl font-bold mb-2">
            Customer Management
          </GradientText>
          <p className="text-primarycolor/70">
            Manage and view customer information and activity
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primarycolor to-primarycolor/90 text-white rounded-lg hover:shadow-lg hover:shadow-primarycolor/30 transition-all duration-300">
            <FiDownload className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Total Customers</p>
              <p className="text-2xl font-bold text-primarycolor">{customerStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <FiUser className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Active Customers</p>
              <p className="text-2xl font-bold text-green-600">{customerStats.active}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
              <FiUser className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Inactive Customers</p>
              <p className="text-2xl font-bold text-gray-600">{customerStats.inactive}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
              <FiUser className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Total Revenue</p>
              <p className="text-2xl font-bold text-primarycolor">KES {customerStats.totalSpent.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-primarycolor/10 to-secondarycolor/10 rounded-lg flex items-center justify-center">
              <span className="text-primarycolor font-bold">KES</span>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Filters */}
      <PremiumCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primarycolor/60 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/60 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor text-primarycolor placeholder-primarycolor/60"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <FiFilter className="text-primarycolor/60" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white/60 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor text-primarycolor"
            >
              <option value="all">All Customers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </PremiumCard>

      {/* Customer List */}
      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <PremiumCard className="p-8 text-center">
            <div className="w-16 h-16 bg-primarycolor/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser className="w-8 h-8 text-primarycolor/60" />
            </div>
            <p className="text-primarycolor/70">
              {searchTerm ? 'No customers found matching your search.' : 'No customers found.'}
            </p>
          </PremiumCard>
        ) : (
          filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onEdit={handleEditCustomer}
              onBlock={handleBlockCustomer}
              onDelete={handleDeleteCustomer}
              onView={handleViewCustomerDetails}
              onAddPoints={handleAddLoyaltyPoints}
            />
          ))
        )}
      </div>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedCustomer(null);
        }}
      />

      {/* Customer Edit Modal */}
      <CustomerEditModal
        customer={selectedCustomer}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedCustomer(null);
        }}
        onSave={handleSaveCustomer}
      />
    </div>
  );
}

export default function CustomerManagement() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CustomerManagementContent />
    </Suspense>
  );
}

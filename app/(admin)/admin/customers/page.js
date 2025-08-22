"use client";
import { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { FiSearch, FiFilter, FiDownload, FiUser, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';
import { PremiumCard, GradientText } from '../../../components/ui';

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

function CustomerCard({ customer }) {
  return (
    <PremiumCard className="p-4 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primarycolor to-primarycolor/80 rounded-full flex items-center justify-center text-white shadow-lg shadow-primarycolor/30">
          <FiUser className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primarycolor truncate">{customer.name}</h3>
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
          <div className="flex items-center gap-1 text-xs text-primarycolor/60 mt-2">
            <FiCalendar className="w-3 h-3" />
            <span>Joined {new Date(customer.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-primarycolor">
            {customer.order_count || 0} orders
          </div>
          <div className="text-xs text-primarycolor/60">
            KES {(customer.total_spent || 0).toLocaleString()}
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}

export default function CustomerManagement() {
  const { useCustomers } = useSupabase();
  const { data: customers, isLoading } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
            <CustomerCard key={customer.id} customer={customer} />
          ))
        )}
      </div>
    </div>
  );
}

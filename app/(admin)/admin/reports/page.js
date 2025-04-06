"use client";
import { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import SalesGraph from '../components/salesgraph';
import { FiDownload, FiCalendar, FiFilter } from 'react-icons/fi';

export default function SalesReports() {
  const { useSalesData } = useSupabase();
  const { data: salesData, isLoading } = useSalesData();
  const [dateRange, setDateRange] = useState('all'); // 'all', 'week', 'month', 'year'

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Sales Reports</h1>
          <div className="animate-pulse h-10 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="h-5 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales Reports</h1>
        <div className="flex space-x-3">
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-primarycolor focus:border-primarycolor"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FiCalendar className="h-4 w-4" />
            </div>
          </div>
          <button className="flex items-center gap-2 bg-primarycolor hover:bg-primarycolor/90 text-white py-2 px-4 rounded-md transition-colors">
            <FiDownload className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <h3 className="text-gray-700 font-medium text-sm mb-1">Total Sales</h3>
          <p className="text-2xl font-bold text-gray-900">
            Ksh. {salesData?.reduce((sum, day) => sum + day.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <h3 className="text-gray-700 font-medium text-sm mb-1">Average Daily Sales</h3>
          <p className="text-2xl font-bold text-gray-900">
            Ksh. {(salesData?.reduce((sum, day) => sum + day.amount, 0) / (salesData?.length || 1)).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <h3 className="text-gray-700 font-medium text-sm mb-1">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-900">{salesData?.length || 0}</p>
        </div>
      </div>

      {/* Sales Graph */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Sales Trend</h2>
          <button className="text-gray-500 hover:text-primarycolor p-2 rounded-full hover:bg-gray-100">
            <FiFilter className="h-4 w-4" />
          </button>
        </div>
        <SalesGraph data={salesData} />
      </div>
    </div>
  );
}

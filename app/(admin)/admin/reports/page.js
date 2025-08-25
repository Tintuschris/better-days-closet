"use client";
import { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import SalesGraph from '../components/salesgraph';
import { FiDownload, FiCalendar, FiFilter, FiBarChart, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import { PremiumCard, Button, GradientText } from '../../../components/ui';

export default function SalesReports() {
  const { useSalesData } = useSupabase();
  const { data: salesData, isLoading } = useSalesData();
  const [dateRange, setDateRange] = useState('all'); // 'all', 'week', 'month', 'year'

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PremiumCard className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-8 bg-primarycolor/20 rounded w-48 animate-pulse mb-2"></div>
              <div className="h-4 bg-primarycolor/10 rounded w-32 animate-pulse"></div>
            </div>
            <div className="animate-pulse h-10 w-32 bg-primarycolor/20 rounded-lg"></div>
          </div>
        </PremiumCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <PremiumCard key={i} className="p-6">
              <div className="h-5 bg-primarycolor/20 rounded w-24 mb-3 animate-pulse"></div>
              <div className="h-8 bg-primarycolor/20 rounded w-32 animate-pulse"></div>
            </PremiumCard>
          ))}
        </div>

        <PremiumCard className="p-6">
          <div className="h-6 bg-primarycolor/20 rounded w-32 mb-4 animate-pulse"></div>
          <div className="h-64 bg-primarycolor/10 rounded animate-pulse"></div>
        </PremiumCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PremiumCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <GradientText className="text-2xl font-bold flex items-center gap-3">
              <FiBarChart className="w-6 h-6" />
              Sales Reports
            </GradientText>
            <p className="text-primarycolor/70 mt-1">
              Track your business performance and growth
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primarycolor/60 w-4 h-4" />
              <select
                className="appearance-none bg-white/60 border border-primarycolor/30 text-primarycolor py-2 pl-10 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primarycolor/60">
                <FiFilter className="h-4 w-4" />
              </div>
            </div>

            <Button className="flex items-center gap-2">
              <FiDownload className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </PremiumCard>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PremiumCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-primarycolor/70 font-medium text-sm mb-1">Total Sales</h3>
              <p className="text-2xl font-bold text-primarycolor">
                Ksh. {salesData?.reduce((sum, day) => sum + day.amount, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-primarycolor/70 font-medium text-sm mb-1">Average Daily Sales</h3>
              <p className="text-2xl font-bold text-primarycolor">
                Ksh. {(salesData?.reduce((sum, day) => sum + day.amount, 0) / (salesData?.length || 1)).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <FiTrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-primarycolor/70 font-medium text-sm mb-1">Total Orders</h3>
              <p className="text-2xl font-bold text-primarycolor">{salesData?.length || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <FiBarChart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Sales Graph */}
      <PremiumCard className="p-6">
        <div className="flex justify-between items-center mb-6">
          <GradientText className="text-lg font-semibold">Sales Trend</GradientText>
          <Button variant="outline" size="sm">
            <FiFilter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        <SalesGraph data={salesData} />
      </PremiumCard>
    </div>
  );
}

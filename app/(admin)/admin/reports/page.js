"use client";
import { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import SalesGraph from '../components/salesgraph';

export default function SalesReports() {
  const { useSalesData } = useSupabase();
  const { data: salesData, isLoading } = useSalesData();

  if (isLoading) {
    return <div className="p-6">Loading sales data...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-primarycolor">Sales Reports</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-primarycolor text-sm">Total Sales</h3>
          <p className="text-2xl font-bold text-secondarycolor">
            Ksh. {salesData?.reduce((sum, day) => sum + day.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-primarycolor text-sm">Average Daily Sales</h3>
          <p className="text-2xl font-bold text-secondarycolor">
            Ksh. {(salesData?.reduce((sum, day) => sum + day.amount, 0) / (salesData?.length || 1)).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-primarycolor text-sm">Total Orders</h3>
          <p className="text-2xl font-bold text-secondarycolor">{salesData?.length || 0}</p>
        </div>
      </div>

      {/* Sales Graph */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl text-primarycolor font-semibold mb-4">Sales Trend</h2>
        <SalesGraph data={salesData} />
      </div>
    </div>
  );
}

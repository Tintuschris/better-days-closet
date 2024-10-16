"use client";
import SalesGraph from './components/SalesGraph';
import { useSupabase } from './hooks/useSupabase';
import { useEffect, useState, useCallback } from 'react';

export default function AdminDashboard() {
  const { fetchSalesData: originalFetchSalesData } = useSupabase();
  const [salesData, setSalesData] = useState([]);

  // Memoize fetchSalesData using useCallback
  const fetchSalesData = useCallback(() => {
    return originalFetchSalesData();
  }, [originalFetchSalesData]);

  useEffect(() => {
    fetchSalesData().then(setSalesData);
  }, [fetchSalesData]); // Safe to include fetchSalesData as a dependency

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <SalesGraph salesData={salesData} />
    </div>
  );
}

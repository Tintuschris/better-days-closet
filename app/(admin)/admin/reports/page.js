"use client";
import SalesGraph from '../components/salesgraph';
import { useEffect, useState, useCallback } from 'react';
import { useSupabase } from '../hooks/useSupabase';

export default function SalesReports() {
  const { fetchSalesData: originalFetchSalesData } = useSupabase();
  const [salesData, setSalesData] = useState([]);

  // Memoize fetchSalesData using useCallback
  const fetchSalesData = useCallback(() => {
    return originalFetchSalesData();
  }, [originalFetchSalesData]);

  useEffect(() => {
    fetchSalesData().then(setSalesData);
  }, [fetchSalesData]); // Include fetchSalesData in the dependency array

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sales Reports</h1>
      <SalesGraph salesData={salesData} />
    </div>
  );
}

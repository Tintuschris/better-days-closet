"use client"
import SalesGraph from './components/SalesGraph';
import { useSupabase } from './hooks/useSupabase';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const { fetchSalesData } = useSupabase();
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetchSalesData().then(setSalesData);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <SalesGraph salesData={salesData} />
    </div>
  );
}

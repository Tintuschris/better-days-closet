"use client"
import SalesGraph from '../components/SalesGraph';
import { useEffect, useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';

export default function SalesReports() {
  const { fetchSalesData } = useSupabase();
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetchSalesData().then(setSalesData);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sales Reports</h1>
      <SalesGraph salesData={salesData} />
    </div>
  );
}

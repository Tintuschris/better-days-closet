"use client";
import { useSupabase } from "./hooks/useSupabase";
import SalesGraph from "./components/salesgraph";
import RealTimeDebugger from "./components/RealTimeDebugger";
import {
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiClock,
} from "react-icons/fi";

function DashboardCard({ title, value, icon: Icon, trend, color = "primary" }) {
  const colors = {
    primary: "bg-primarycolor/10 text-primarycolor",
    yellow: "bg-yellow-100 text-yellow-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-700 font-medium text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
          {trend && (
            <p
              className={`text-sm font-medium ${
                trend > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend > 0 ? "+" : ""}
              {trend}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { useOrders, useProducts, useSalesData } = useSupabase();
  const { data: orders } = useOrders();
  const { data: products } = useProducts();
  const { data: salesData, isLoading: salesLoading } = useSalesData();

  const stats = {
    totalOrders: orders?.length || 0,
    totalProducts: products?.length || 0,
    totalRevenue:
      orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
    pendingOrders:
      orders?.filter((order) => order.status.toLowerCase() === "pending")
        .length || 0,
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={FiShoppingBag}
        />
        <DashboardCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={FiClock}
          color="yellow"
        />
        <DashboardCard
          title="Total Products"
          value={stats.totalProducts}
          icon={FiPackage}
          color="green"
        />
        <DashboardCard
          title="Total Revenue"
          value={`KES ${stats.totalRevenue.toLocaleString()}`}
          icon={FiDollarSign}
          color="primary"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Sales Overview
        </h2>
        <SalesGraph data={salesData} isLoading={salesLoading} />
      </div>

      {/* Add System Testing Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">System Status</h2>
        </div>
        <RealTimeDebugger />
      </div>
    </div>
  );
}

"use client";
import { useMemo } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import SalesGraph from './salesgraph';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiUsers,
  FiBarChart,
  FiPieChart
} from 'react-icons/fi';
import { PremiumCard, GradientText } from '../../../components/ui';

function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'primary', className = '' }) {
  const colorClasses = {
    primary: 'from-purple-100 to-purple-200 text-purple-600',
    green: 'from-green-100 to-green-200 text-green-600',
    blue: 'from-blue-100 to-blue-200 text-blue-600',
    orange: 'from-orange-100 to-orange-200 text-orange-600',
    red: 'from-red-100 to-red-200 text-red-600'
  };

  return (
    <PremiumCard className={`p-6 hover:shadow-xl hover:shadow-primarycolor/20 transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-primarycolor/70 mb-1">{title}</p>
          <p className="text-2xl font-bold text-primarycolor mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-primarycolor/60">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center mt-2 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <FiTrendingUp className="w-3 h-3 mr-1" /> : <FiTrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(trend)}% from last month
            </div>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </PremiumCard>
  );
}

function CategoryAnalytics({ categories, products }) {
  const categoryData = useMemo(() => {
    if (!categories || !products) return [];
    
    return categories.map(category => {
      const categoryProducts = products.filter(p => p.category_id === category.id);
      const totalValue = categoryProducts.reduce((sum, p) => sum + (Number(p.price) * (p.quantity || 1)), 0);
      
      return {
        id: category.id,
        name: category.name,
        productCount: categoryProducts.length,
        totalValue,
        averagePrice: categoryProducts.length > 0 ? totalValue / categoryProducts.length : 0
      };
    }).sort((a, b) => b.productCount - a.productCount);
  }, [categories, products]);

  const chartData = {
    labels: categoryData.slice(0, 6).map(cat => cat.name),
    datasets: [{
      data: categoryData.slice(0, 6).map(cat => cat.productCount),
      backgroundColor: [
        '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE', '#F5F3FF'
      ],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      <PremiumCard className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <GradientText className="text-base lg:text-lg font-semibold flex items-center gap-2">
            <FiPieChart className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline">Category Distribution</span>
            <span className="sm:hidden">Categories</span>
          </GradientText>
        </div>
        <SalesGraph data={chartData.labels.map((label, index) => ({
          date: label,
          amount: chartData.datasets[0].data[index]
        }))} type="doughnut" className="h-[250px] lg:h-[300px]" />
      </PremiumCard>

      <PremiumCard className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <GradientText className="text-base lg:text-lg font-semibold flex items-center gap-2">
            <FiBarChart className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline">Top Categories</span>
            <span className="sm:hidden">Top 5</span>
          </GradientText>
        </div>
        <div className="space-y-3 lg:space-y-4 max-h-[250px] lg:max-h-[300px] overflow-y-auto">
          {categoryData.slice(0, 5).map((category, index) => (
            <div key={category.id} className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
                <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-white text-xs lg:text-sm font-semibold flex-shrink-0`}
                     style={{ backgroundColor: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'][index] }}>
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-primarycolor text-sm lg:text-base truncate">{category.name}</p>
                  <p className="text-xs text-primarycolor/60">
                    Avg: Ksh. {Math.round(category.averagePrice).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-primarycolor text-sm lg:text-base">{category.productCount}</p>
                <p className="text-xs text-primarycolor/60">products</p>
              </div>
            </div>
          ))}
          {categoryData.length === 0 && (
            <div className="text-center py-8 text-primarycolor/60">
              <FiPackage className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No categories with products yet</p>
            </div>
          )}
        </div>
      </PremiumCard>
    </div>
  );
}

export default function EnhancedDashboard() {
  const { useOrders, useProducts, useCategories, useSalesData, useCustomers } = useSupabase();
  const { data: orders } = useOrders();
  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const { data: customers } = useCustomers();
  const { data: salesData, isLoading: salesLoading } = useSalesData();

  const stats = useMemo(() => {
    const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
    const pendingOrders = orders?.filter((order) => order.status?.toLowerCase() === "pending").length || 0;
    const activeCustomers = customers?.filter(c => (c.order_count || 0) > 0).length || 0;
    const lowStockProducts = products?.filter(p => (p.quantity || 0) < 10).length || 0;

    return {
      totalOrders: orders?.length || 0,
      totalProducts: products?.length || 0,
      totalCustomers: customers?.length || 0,
      totalRevenue,
      pendingOrders,
      activeCustomers,
      lowStockProducts,
      totalCategories: categories?.length || 0,
    };
  }, [orders, products, customers, categories]);

  // Mock trends - you can implement real trend calculation
  const trends = {
    orders: 12.5,
    revenue: 8.3,
    customers: 15.2,
    products: -2.1
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCard
          title="Orders"
          value={stats.totalOrders}
          subtitle={`${stats.pendingOrders} pending`}
          icon={FiShoppingBag}
          trend={trends.orders}
          color="primary"
          className="col-span-1"
        />
        <StatCard
          title="Revenue"
          value={`${(stats.totalRevenue / 1000).toFixed(0)}K`}
          subtitle="Gross revenue"
          icon={FiDollarSign}
          trend={trends.revenue}
          color="green"
          className="col-span-1"
        />
        <StatCard
          title="Customers"
          value={stats.totalCustomers}
          subtitle={`${stats.activeCustomers} active`}
          icon={FiUsers}
          trend={trends.customers}
          color="blue"
          className="col-span-1"
        />
        <StatCard
          title="Products"
          value={stats.totalProducts}
          subtitle={`${stats.lowStockProducts} low stock`}
          icon={FiPackage}
          trend={trends.products}
          color="orange"
          className="col-span-1"
        />
      </div>

      {/* Sales Graph */}
      <PremiumCard className="p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-3 lg:gap-4">
          <GradientText className="text-lg lg:text-xl font-semibold flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />
            <span className="hidden sm:inline">Sales Overview</span>
            <span className="sm:hidden">Sales</span>
          </GradientText>
          <div className="flex gap-1 lg:gap-2 overflow-x-auto">
            <button className="px-2 lg:px-3 py-1 text-xs bg-primarycolor text-white rounded-full whitespace-nowrap">
              7 Days
            </button>
            <button className="px-2 lg:px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded-full hover:bg-primarycolor hover:text-white transition-colors whitespace-nowrap">
              30 Days
            </button>
            <button className="px-2 lg:px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded-full hover:bg-primarycolor hover:text-white transition-colors whitespace-nowrap">
              90 Days
            </button>
          </div>
        </div>
        {salesLoading ? (
          <div className="h-[300px] lg:h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-primarycolor"></div>
          </div>
        ) : (
          <SalesGraph data={salesData} type="line" className="h-[300px] lg:h-[400px]" />
        )}
      </PremiumCard>

      {/* Category Analytics */}
      <CategoryAnalytics categories={categories} products={products} />
    </div>
  );
}

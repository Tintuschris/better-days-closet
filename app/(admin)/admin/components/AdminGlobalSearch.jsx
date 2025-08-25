"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabase } from "../hooks/useSupabase";
import {
  FiSearch, FiX, FiPackage, FiUsers, FiMapPin, FiSettings,
  FiGrid, FiBarChart, FiImage, FiShoppingBag
} from "react-icons/fi";

const SEARCH_CATEGORIES = {
  products: {
    icon: FiPackage,
    label: "Products",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    route: "/admin/products"
  },
  categories: {
    icon: FiGrid,
    label: "Categories", 
    color: "text-green-600",
    bgColor: "bg-green-50",
    route: "/admin/categories"
  },
  orders: {
    icon: FiShoppingBag,
    label: "Orders",
    color: "text-purple-600", 
    bgColor: "bg-purple-50",
    route: "/admin/orders"
  },
  customers: {
    icon: FiUsers,
    label: "Customers",
    color: "text-orange-600",
    bgColor: "bg-orange-50", 
    route: "/admin/customers"
  },
  delivery: {
    icon: FiMapPin,
    label: "Delivery Addresses",
    color: "text-red-600",
    bgColor: "bg-red-50",
    route: "/admin/delivery-addresses"
  },
  banners: {
    icon: FiImage,
    label: "Banners",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    route: "/admin/banners"
  },
  reports: {
    icon: FiBarChart,
    label: "Reports",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    route: "/admin/reports"
  },
  settings: {
    icon: FiSettings,
    label: "Settings",
    color: "text-primarycolor",
    bgColor: "bg-primarycolor/10",
    route: "/admin/settings"
  }
};

export default function AdminGlobalSearch({ isOpen, onClose, className = "" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const {
    useProducts,
    useCategories, 
    useOrders,
    useCustomers,
    useDeliveryAddresses,
    useBanners
  } = useSupabase();

  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const { data: orders } = useOrders();
  const { data: customers } = useCustomers();
  const { data: deliveryAddresses } = useDeliveryAddresses();
  const { data: banners } = useBanners();

  // Comprehensive search function
  const searchData = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    const searchResults = [];

    // Search Products
    if (products) {
      products
        .filter(item => 
          item.name?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.category_name?.toLowerCase().includes(term)
        )
        .slice(0, 5)
        .forEach(item => {
          searchResults.push({
            id: item.id,
            type: 'products',
            title: item.name,
            subtitle: `${item.category_name} • KSh ${item.min_price || item.price}`,
            description: item.description,
            route: `/admin/products?highlight=${item.id}`,
            ...SEARCH_CATEGORIES.products
          });
        });
    }

    // Search Categories
    if (categories) {
      categories
        .filter(item => 
          item.name?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term)
        )
        .slice(0, 3)
        .forEach(item => {
          searchResults.push({
            id: item.id,
            type: 'categories',
            title: item.name,
            subtitle: item.description || 'Category',
            route: `/admin/categories?highlight=${item.id}`,
            ...SEARCH_CATEGORIES.categories
          });
        });
    }

    // Search Orders
    if (orders) {
      orders
        .filter(item => 
          item.id?.toLowerCase().includes(term) ||
          item.customer_name?.toLowerCase().includes(term) ||
          item.status?.toLowerCase().includes(term)
        )
        .slice(0, 5)
        .forEach(item => {
          searchResults.push({
            id: item.id,
            type: 'orders',
            title: `Order #${item.id.slice(0, 8)}`,
            subtitle: `${item.customer_name} • ${item.status}`,
            description: `KSh ${item.total_amount}`,
            route: `/admin/orders?highlight=${item.id}`,
            ...SEARCH_CATEGORIES.orders
          });
        });
    }

    // Search Customers
    if (customers) {
      customers
        .filter(item => 
          item.name?.toLowerCase().includes(term) ||
          item.email?.toLowerCase().includes(term) ||
          item.phone?.toLowerCase().includes(term)
        )
        .slice(0, 5)
        .forEach(item => {
          searchResults.push({
            id: item.id,
            type: 'customers',
            title: item.name,
            subtitle: item.email,
            description: item.phone,
            route: `/admin/customers?highlight=${item.id}`,
            ...SEARCH_CATEGORIES.customers
          });
        });
    }

    // Search Delivery Addresses
    if (deliveryAddresses) {
      deliveryAddresses
        .filter(item => 
          item.address?.toLowerCase().includes(term) ||
          item.city?.toLowerCase().includes(term) ||
          item.customer_name?.toLowerCase().includes(term)
        )
        .slice(0, 3)
        .forEach(item => {
          searchResults.push({
            id: item.id,
            type: 'delivery',
            title: item.address,
            subtitle: `${item.city} • ${item.customer_name}`,
            route: `/admin/delivery-addresses?highlight=${item.id}`,
            ...SEARCH_CATEGORIES.delivery
          });
        });
    }

    // Search Banners
    if (banners) {
      banners
        .filter(item => 
          item.title?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term)
        )
        .slice(0, 3)
        .forEach(item => {
          searchResults.push({
            id: item.id,
            type: 'banners',
            title: item.title,
            subtitle: item.description,
            route: `/admin/banners?highlight=${item.id}`,
            ...SEARCH_CATEGORIES.banners
          });
        });
    }

    // Add navigation shortcuts
    Object.entries(SEARCH_CATEGORIES).forEach(([key, category]) => {
      if (category.label.toLowerCase().includes(term)) {
        searchResults.push({
          id: `nav-${key}`,
          type: 'navigation',
          title: `Go to ${category.label}`,
          subtitle: 'Navigation',
          route: category.route,
          ...category
        });
      }
    });

    // Add specific settings sections
    const settingsSections = [
      { id: 'site-settings', name: 'Site Settings', description: 'Site name, description, contact info' },
      { id: 'business-settings', name: 'Business Settings', description: 'Currency, tax, shipping settings' },
      { id: 'email-settings', name: 'Email Settings', description: 'SMTP configuration and email setup' },
      { id: 'security-settings', name: 'Security Settings', description: 'Two-factor auth, session timeout' },
      { id: 'feature-settings', name: 'Feature Settings', description: 'Reviews, wishlist, notifications' }
    ];

    settingsSections.forEach(section => {
      if (section.name.toLowerCase().includes(term) ||
          section.description.toLowerCase().includes(term) ||
          term.includes('setting')) {
        searchResults.push({
          id: section.id,
          type: 'settings',
          title: section.name,
          subtitle: section.description,
          route: `/admin/settings?highlight=${section.id}&scroll=true`,
          ...SEARCH_CATEGORIES.settings
        });
      }
    });

    return searchResults.slice(0, 20); // Limit total results
  }, [searchTerm, products, categories, orders, customers, deliveryAddresses, banners]);

  // Handle search input
  useEffect(() => {
    if (searchTerm.trim()) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setResults(searchData);
        setIsLoading(false);
        setSelectedIndex(-1);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [searchData, searchTerm]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // Auto-focus when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  const handleResultClick = (result) => {
    // Update URL with search params for highlighting and scrolling
    const url = new URL(result.route, window.location.origin);
    if (searchTerm) {
      url.searchParams.set('q', searchTerm);
    }
    if (result.id && result.type !== 'navigation') {
      url.searchParams.set('highlight', result.id);
      url.searchParams.set('scroll', 'true');
    }

    router.push(url.pathname + url.search);
    onClose();

    // Add a small delay to ensure page loads before scrolling
    setTimeout(() => {
      if (result.id && result.type !== 'navigation') {
        // Try to scroll to the highlighted item
        const element = document.querySelector(`[data-id="${result.id}"]`) ||
                       document.querySelector(`[data-highlight="${result.id}"]`) ||
                       document.querySelector(`#item-${result.id}`);

        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });

          // Add highlight effect
          element.classList.add('highlight-search-result');
          setTimeout(() => {
            element.classList.remove('highlight-search-result');
          }, 3000);
        }
      }
    }, 500);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setResults([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 ${className}`}
      onMouseDown={(e) => {
        // Close when clicking outside the modal
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-10 p-2 rounded-lg hover:bg-primarycolor/10 transition-colors text-primarycolor/60 hover:text-primarycolor"
          title="Close search (Esc)"
        >
          <FiX className="w-6 h-6" />
        </button>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-primarycolor/60 w-5 h-5" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products, orders, customers, settings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-16 py-4 text-lg border-2 border-primarycolor/20 rounded-xl focus:outline-none focus:border-primarycolor focus:ring-4 focus:ring-primarycolor/10 transition-all placeholder:text-primarycolor/50"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primarycolor/60 hover:text-primarycolor transition-colors"
                title="Clear search"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto" ref={resultsRef}>
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primarycolor border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-primarycolor/70">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((result, index) => {
                const Icon = result.icon;
                const isSelected = index === selectedIndex;
                
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center space-x-4 ${
                      isSelected
                        ? 'bg-primarycolor/10 border-2 border-primarycolor/20'
                        : 'hover:bg-primarycolor/5 border-2 border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${result.bgColor}`}>
                      <Icon className={`w-5 h-5 ${result.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-primarycolor truncate">
                        {result.title}
                      </h3>
                      <p className="text-sm text-primarycolor/70 truncate">
                        {result.subtitle}
                      </p>
                      {result.description && (
                        <p className="text-xs text-primarycolor/60 truncate mt-1">
                          {result.description}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-primarycolor/60 uppercase tracking-wide">
                      {result.label}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : searchTerm ? (
            <div className="p-8 text-center">
              <FiSearch className="w-12 h-12 text-primarycolor/30 mx-auto mb-4" />
              <p className="text-primarycolor/70 mb-2">No results found</p>
              <p className="text-sm text-primarycolor/60">
                Try searching for products, orders, customers, or settings
              </p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <FiSearch className="w-12 h-12 text-primarycolor/30 mx-auto mb-4" />
              <p className="text-primarycolor/70 mb-4">Start typing to search...</p>
              <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                {Object.entries(SEARCH_CATEGORIES).slice(0, 6).map(([key, category]) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => router.push(category.route)}
                      className="p-3 rounded-lg hover:bg-primarycolor/5 transition-colors flex items-center space-x-2 text-sm"
                    >
                      <Icon className={`w-4 h-4 ${category.color}`} />
                      <span className="text-primarycolor/70">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-primarycolor/10 bg-primarycolor/5 text-center">
          <p className="text-xs text-primarycolor/60">
            Use ↑↓ to navigate • Enter to select • Esc to close
          </p>
        </div>
      </div>
    </div>
  );
}

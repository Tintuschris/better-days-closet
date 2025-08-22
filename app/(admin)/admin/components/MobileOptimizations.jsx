"use client";
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';

// Mobile-responsive table component
export const ResponsiveTable = ({ 
  data = [], 
  columns = [], 
  onRowClick,
  mobileCardRenderer,
  className = "" 
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile && mobileCardRenderer) {
    return (
      <div className={`space-y-3 ${className}`}>
        {data.map((item, index) => (
          <div key={index} onClick={() => onRowClick?.(item)}>
            {mobileCardRenderer(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-primarycolor/20">
            {columns.map((column, index) => (
              <th 
                key={index} 
                className={`text-left p-3 font-medium text-primarycolor ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={index}
              className="border-b border-primarycolor/10 hover:bg-primarycolor/5 transition-colors cursor-pointer"
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={`p-3 text-primarycolor/80 ${column.cellClassName || ''}`}>
                  {column.render ? column.render(item, index) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Mobile-responsive form component
export const ResponsiveForm = ({ children, className = "" }) => {
  return (
    <div className={`space-y-4 md:space-y-6 ${className}`}>
      {children}
    </div>
  );
};

// Mobile-responsive grid component
export const ResponsiveGrid = ({ 
  children, 
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  className = "" 
}) => {
  const gridClasses = `grid gap-${gap} grid-cols-${cols.sm} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg} xl:grid-cols-${cols.xl} ${className}`;
  
  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

// Mobile-responsive stats cards
export const ResponsiveStatsGrid = ({ stats = [], className = "" }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-primarycolor/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">{stat.label}</p>
              <p className={`text-xl md:text-2xl font-bold ${stat.color || 'text-primarycolor'}`}>
                {stat.value}
              </p>
              {stat.subtitle && (
                <p className="text-xs text-primarycolor/60 mt-1">{stat.subtitle}</p>
              )}
            </div>
            {stat.icon && (
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center ${stat.iconBg || 'bg-primarycolor/10'}`}>
                <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.iconColor || 'text-primarycolor'}`} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Mobile-responsive action bar
export const ResponsiveActionBar = ({ 
  title, 
  subtitle, 
  actions = [], 
  searchProps,
  filterProps,
  className = "" 
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-primarycolor">{title}</h1>
          {subtitle && (
            <p className="text-primarycolor/70 text-sm md:text-base">{subtitle}</p>
          )}
        </div>
        
        {actions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`px-3 py-2 md:px-4 md:py-2 text-sm font-medium rounded-lg transition-colors ${
                  action.variant === 'primary' 
                    ? 'bg-primarycolor text-white hover:bg-primarycolor/90' 
                    : 'border border-primarycolor/30 text-primarycolor hover:bg-primarycolor/5'
                } ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {action.icon && <action.icon className="w-4 h-4 mr-2 inline" />}
                <span className="hidden sm:inline">{action.label}</span>
                <span className="sm:hidden">{action.shortLabel || action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search and Filters */}
      {(searchProps || filterProps) && (
        <div className="space-y-3">
          {/* Search Bar */}
          {searchProps && (
            <div className="relative">
              {searchProps.icon && (
                <searchProps.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primarycolor/60 w-4 h-4" />
              )}
              <input
                type="text"
                placeholder={searchProps.placeholder}
                value={searchProps.value}
                onChange={searchProps.onChange}
                className={`w-full ${searchProps.icon ? 'pl-10' : 'pl-4'} pr-4 py-2 md:py-3 bg-white border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor text-primarycolor placeholder-primarycolor/60`}
              />
            </div>
          )}

          {/* Filters */}
          {filterProps && (
            <div className="space-y-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-primarycolor hover:text-primarycolor/80 transition-colors md:hidden"
              >
                <span className="text-sm font-medium">Filters</span>
                {showFilters ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              </button>
              
              <div className={`flex flex-col md:flex-row gap-3 ${showFilters ? 'block' : 'hidden md:flex'}`}>
                {filterProps.filters.map((filter, index) => (
                  <div key={index} className="flex-shrink-0">
                    {filter.label && (
                      <label className="block text-xs font-medium text-primarycolor/70 mb-1 md:hidden">
                        {filter.label}
                      </label>
                    )}
                    <select
                      value={filter.value}
                      onChange={filter.onChange}
                      className="w-full md:w-auto px-3 py-2 bg-white border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor text-primarycolor text-sm"
                    >
                      {filter.options.map((option, optIndex) => (
                        <option key={optIndex} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Mobile-responsive modal
export const ResponsiveModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className = "" 
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto ${className}`}>
        <div className="bg-white rounded-lg shadow-xl">
          {title && (
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-primarycolor/10">
              <h2 className="text-lg md:text-xl font-semibold text-primarycolor">{title}</h2>
              <button
                onClick={onClose}
                className="text-primarycolor/60 hover:text-primarycolor transition-colors"
              >
                <FiX className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          )}
          <div className="p-4 md:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile-responsive pagination
export const ResponsivePagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = "" 
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-1 md:gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 py-1 md:px-3 md:py-2 text-sm border border-primarycolor/30 rounded text-primarycolor hover:bg-primarycolor/5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <div className="hidden sm:flex items-center gap-1">
        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-3 py-2 text-sm rounded transition-colors ${
              page === currentPage
                ? 'bg-primarycolor text-white'
                : page === '...'
                ? 'text-primarycolor/60 cursor-default'
                : 'text-primarycolor hover:bg-primarycolor/5'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <div className="sm:hidden flex items-center gap-2 text-sm text-primarycolor">
        <span>{currentPage} of {totalPages}</span>
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 py-1 md:px-3 md:py-2 text-sm border border-primarycolor/30 rounded text-primarycolor hover:bg-primarycolor/5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

// Hook for mobile detection
export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

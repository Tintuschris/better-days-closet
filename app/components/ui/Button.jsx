"use client";
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

// Unified button sizes based on mobile-first design
const buttonSizes = {
  xs: 'px-3 py-2 text-xs', // Very small buttons (quantity controls, icons)
  sm: 'px-4 py-2.5 text-sm', // Small buttons (secondary actions)
  md: 'px-5 py-3 text-base', // Default buttons (most common)
  lg: 'px-6 py-3.5 text-lg', // Large buttons (primary CTAs)
  xl: 'px-8 py-4 text-xl', // Extra large (hero buttons)
};

// Consistent border radius options
const borderRadius = {
  sm: 'rounded-lg', // 6px - subtle rounding
  md: 'rounded-xl', // 8px - standard rounding  
  lg: 'rounded-2xl', // 12px - prominent rounding
  full: 'rounded-full', // Fully rounded
};

// Color variants with consistent gradients
const variants = {
  primary: `
    bg-gradient-to-r from-primarycolor to-primarycolor/90 text-white
    hover:from-primarycolor/90 hover:to-primarycolor 
    focus:ring-2 focus:ring-primarycolor/20
    disabled:from-primarycolor/20 disabled:to-primarycolor/20 disabled:text-primarycolor/40
    shadow-lg shadow-primarycolor/20 hover:shadow-xl hover:shadow-primarycolor/30
  `,
  secondary: `
    border-2 border-primarycolor text-primarycolor bg-white
    hover:bg-primarycolor hover:text-white
    focus:ring-2 focus:ring-primarycolor/20
    disabled:border-primarycolor/20 disabled:text-primarycolor/40 disabled:bg-primarycolor/5
  `,
  outline: `
    border border-primarycolor/30 text-primarycolor bg-transparent
    hover:bg-primarycolor/5 hover:border-primarycolor
    focus:ring-2 focus:ring-primarycolor/20
    disabled:border-primarycolor/20 disabled:text-primarycolor/40
  `,
  ghost: `
    text-primarycolor bg-transparent
    hover:bg-primarycolor/10 hover:text-primarycolor
    focus:ring-2 focus:ring-primarycolor/20
    disabled:text-primarycolor/40
    [&>*]:text-primarycolor hover:[&>*]:text-primarycolor
  `,
  danger: `
    bg-gradient-to-r from-red-500 to-red-600 text-white
    hover:from-red-600 hover:to-red-700
    focus:ring-2 focus:ring-red-500/20
    disabled:from-primarycolor/20 disabled:to-primarycolor/20 disabled:text-primarycolor/40
    shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30
  `,
};

const Button = forwardRef(({ 
  children, 
  size = 'md', 
  variant = 'primary', 
  radius = 'md',
  loading = false, 
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props 
}, ref) => {
  const isDisabled = disabled || loading;

  const baseClasses = `
    inline-flex items-center justify-center font-medium
    transition-all duration-300 transform
    hover:scale-[1.02] active:scale-[0.98]
    focus:outline-none focus:ring-offset-2
    disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none
    backdrop-blur-sm
    ${fullWidth ? 'w-full' : ''}
    ${buttonSizes[size]}
    ${borderRadius[radius]}
    ${variants[variant]}
    ${className}
  `;

  return (
    <button
      ref={ref}
      type={type}
      className={baseClasses}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

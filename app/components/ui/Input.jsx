"use client";
import { forwardRef } from 'react';

// Unified input sizes
const inputSizes = {
  sm: 'px-3 py-2 text-sm', // Small inputs
  md: 'px-4 py-3 text-base', // Default inputs
  lg: 'px-5 py-4 text-lg', // Large inputs
};

// Consistent border radius options
const borderRadius = {
  sm: 'rounded-lg', // 6px
  md: 'rounded-xl', // 8px
  lg: 'rounded-2xl', // 12px
};

// Input variants
const variants = {
  default: `
    bg-white/80 border-2 border-primarycolor/30 text-primarycolor
    focus:border-primarycolor focus:bg-white focus:ring-2 focus:ring-primarycolor/20
    disabled:bg-primarycolor/5 disabled:border-primarycolor/20 disabled:text-primarycolor/40
    placeholder:text-primarycolor/60
  `,
  ghost: `
    bg-primarycolor/5 border-2 border-primarycolor/20 text-primarycolor
    focus:border-primarycolor focus:bg-white focus:ring-2 focus:ring-primarycolor/20
    disabled:bg-primarycolor/5 disabled:border-primarycolor/20 disabled:text-primarycolor/40
    placeholder:text-primarycolor/50
  `,
  premium: `
    backdrop-blur-lg bg-white/60 border border-white/30 text-primarycolor
    focus:border-primarycolor focus:bg-white/80 focus:ring-2 focus:ring-primarycolor/20
    disabled:bg-gray-50/50 disabled:border-gray-200/50 disabled:text-gray-400
    placeholder:text-primarycolor/60 shadow-lg shadow-primarycolor/5
  `,
};

const Input = forwardRef(({ 
  size = 'md', 
  variant = 'default', 
  radius = 'md',
  fullWidth = true,
  className = '',
  type = 'text',
  ...props 
}, ref) => {
  const baseClasses = `
    outline-none transition-all duration-300
    ${fullWidth ? 'w-full' : ''}
    ${inputSizes[size]}
    ${borderRadius[radius]}
    ${variants[variant]}
    ${className}
  `;

  return (
    <input
      ref={ref}
      type={type}
      className={baseClasses}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;

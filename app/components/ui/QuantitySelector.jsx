"use client";
import { forwardRef } from 'react';
import { Plus, Minus } from 'lucide-react';

// Quantity selector with consistent styling
const QuantitySelector = forwardRef(({ 
  value = 1, 
  onChange,
  min = 1,
  max = 100,
  size = 'md',
  variant = 'default',
  disabled = false,
  className = '',
  ...props 
}, ref) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const variantClasses = {
    default: `
      backdrop-blur-lg bg-white/60 border border-white/30 
      shadow-lg shadow-primarycolor/10
    `,
    minimal: `
      border border-primarycolor/30
    `,
    premium: `
      backdrop-blur-xl bg-white/80 border border-white/40 
      shadow-xl shadow-primarycolor/20
    `,
  };

  const handleDecrease = () => {
    if (value > min && !disabled) {
      onChange?.(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max && !disabled) {
      onChange?.(value + 1);
    }
  };

  return (
    <div
      ref={ref}
      className={`
        flex items-center rounded-full overflow-hidden
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Decrease Button */}
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        className={`
          flex items-center justify-center text-primarycolor 
          hover:bg-gradient-to-r hover:from-primarycolor/10 hover:to-secondarycolor/10 
          rounded-l-full transition-all duration-300
          disabled:cursor-not-allowed disabled:opacity-50
          ${sizeClasses[size]} w-10
        `}
      >
        <Minus size={iconSizes[size]} />
      </button>

      {/* Value Display */}
      <div className={`
        px-3 text-primarycolor font-medium text-center min-w-[2.5rem]
        flex items-center justify-center ${sizeClasses[size]}
      `}>
        {value}
      </div>

      {/* Increase Button */}
      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        className={`
          flex items-center justify-center text-primarycolor 
          hover:bg-gradient-to-r hover:from-primarycolor/10 hover:to-secondarycolor/10 
          rounded-r-full transition-all duration-300
          disabled:cursor-not-allowed disabled:opacity-50
          ${sizeClasses[size]} w-10
        `}
      >
        <Plus size={iconSizes[size]} />
      </button>
    </div>
  );
});

QuantitySelector.displayName = 'QuantitySelector';

export default QuantitySelector;

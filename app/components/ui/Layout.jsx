"use client";

// Container with glass morphism effects
export const GlassContainer = ({ 
  children, 
  className = '', 
  blur = 'md',
  opacity = 70,
  ...props 
}) => {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-lg',
    lg: 'backdrop-blur-xl',
  };

  return (
    <div
      className={`
        ${blurClasses[blur]} bg-white/${opacity} 
        border border-white/30 rounded-2xl 
        shadow-lg shadow-primarycolor/5
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Premium card with hover effects
export const PremiumCard = ({ 
  children, 
  className = '', 
  hoverable = true,
  ...props 
}) => {
  return (
    <div
      className={`
        backdrop-blur-lg bg-white/80 border border-white/20 rounded-2xl
        shadow-lg shadow-primarycolor/10
        ${hoverable ? 'hover:shadow-xl hover:shadow-primarycolor/20 transition-all duration-300' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Gradient text utility
export const GradientText = ({ 
  children, 
  className = '', 
  from = 'primarycolor',
  to = 'primarycolor/80',
  ...props 
}) => {
  return (
    <span
      className={`
        bg-gradient-to-r from-${from} to-${to} 
        bg-clip-text text-transparent
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};

// Consistent spacing utilities
export const spacing = {
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

// Consistent shadow utilities
export const shadows = {
  sm: 'shadow-sm shadow-primarycolor/5',
  md: 'shadow-lg shadow-primarycolor/10',
  lg: 'shadow-xl shadow-primarycolor/20',
  xl: 'shadow-2xl shadow-primarycolor/30',
};

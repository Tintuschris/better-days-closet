"use client";
import { forwardRef } from 'react';

// Unified form group styling
const FormGroup = forwardRef(({ 
  children, 
  className = '',
  spacing = 'default',
  ...props 
}, ref) => {
  const spacingClasses = {
    tight: 'space-y-1',
    default: 'space-y-2',
    loose: 'space-y-3',
  };

  return (
    <div
      ref={ref}
      className={`${spacingClasses[spacing]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

FormGroup.displayName = 'FormGroup';

// Label component with consistent styling
const Label = forwardRef(({ 
  children, 
  className = '',
  size = 'default',
  required = false,
  ...props 
}, ref) => {
  const sizeClasses = {
    sm: 'text-xs',
    default: 'text-sm',
    lg: 'text-base',
  };

  return (
    <label
      ref={ref}
      className={`block text-primarycolor font-medium tracking-wide mb-2 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
});

Label.displayName = 'Label';

// Error message component
const ErrorMessage = ({ children, className = '' }) => {
  if (!children) return null;

  return (
    <div className={`mt-2 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-xl ${className}`}>
      <div className="flex items-center">
        <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center mr-2">
          <span className="text-red-600 text-xs">!</span>
        </div>
        <p className="text-red-700 text-sm font-medium">{children}</p>
      </div>
    </div>
  );
};

// Success message component
const SuccessMessage = ({ children, className = '' }) => {
  if (!children) return null;

  return (
    <div className={`mt-2 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-xl ${className}`}>
      <div className="flex items-center">
        <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
          <span className="text-green-600 text-xs">✓</span>
        </div>
        <p className="text-green-700 text-sm font-medium">{children}</p>
      </div>
    </div>
  );
};

// Help text component
const HelpText = ({ children, className = '' }) => {
  if (!children) return null;

  return (
    <p className={`mt-1 text-xs text-primarycolor/60 ${className}`}>
      {children}
    </p>
  );
};

export { FormGroup, Label, ErrorMessage, SuccessMessage, HelpText };

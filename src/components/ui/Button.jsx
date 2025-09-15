import React from 'react';

const variants = {
  primary: 'bg-red-600 hover:bg-red-700 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
  danger: 'bg-red-100 hover:bg-red-200 text-red-800',
  success: 'bg-green-100 hover:bg-green-200 text-green-800',
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  isLoading = false, // Manejar explícitamente isLoading
  ...props 
}) => {
  // No pasar isLoading al elemento button
  const { isLoading: _, ...buttonProps } = props;
  
  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-lg
        font-medium
        transition-colors
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-red-500
        ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={isLoading}
      {...buttonProps}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Procesando...
        </span>
      ) : children}
    </button>
  );
};

export default Button;

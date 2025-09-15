import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ message = "Cargando..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="relative">
        {/* Spinner principal */}
        <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
        
        {/* Spinner interno */}
        <div className="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-primary-400 rounded-full animate-spin animate-reverse"></div>
      </div>
      
      {/* Mensaje */}
      <p className="mt-6 text-lg font-semibold text-gray-600 animate-pulse">{message}</p>
      
      {/* Puntos animados */}
      <div className="flex gap-1 mt-2">
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
};

export default LoadingSpinner;

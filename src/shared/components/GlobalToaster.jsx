import React from 'react';
import { Toaster } from 'react-hot-toast';

const GlobalToaster = () => {
  return (
    <Toaster
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        // Estilos por defecto para todos los toasts
        className: '',
        duration: 3000,
        style: {
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      }}
    />
  );
};

export default GlobalToaster;

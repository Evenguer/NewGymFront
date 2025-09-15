import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';

const NotFoundPage = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // Información de depuración
  const debugInfo = {
    path: location.pathname,
    authenticated: isAuthenticated,
    userRole: user?.role || 'No autenticado',
    fromState: location.state?.from?.pathname || 'Navegación directa'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-2xl text-gray-600 mb-8">Página no encontrada</p>
      <p className="text-gray-500 mb-8 text-center">
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
      </p>
      
      {/* Links según el rol del usuario */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
        {!isAuthenticated && (
          <Link
            to="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir al login
          </Link>
        )}
        
        {user?.role === 'ADMIN' && (
          <Link
            to="/admin/dashboard"
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Dashboard Admin
          </Link>
        )}
        
        {(user?.role === 'RECEPCIONISTA' || user?.role === 'ENTRENADOR') && (
          <Link
            to="/staff/dashboard"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Dashboard Staff
          </Link>
        )}
        
        {user?.role === 'CLIENTE' && (
          <Link
            to="/client/dashboard"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Dashboard Cliente
          </Link>
        )}
      </div>
      
      {/* Información de depuración */}
      <div className="mt-8 p-4 border rounded bg-white w-full max-w-lg">
        <h3 className="font-bold text-gray-700 mb-2">Información de depuración:</h3>
        <pre className="text-xs overflow-auto bg-gray-100 p-3 rounded">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default NotFoundPage;
import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">403</h1>
      <p className="text-2xl text-gray-600 mb-8">Acceso no autorizado</p>
      <p className="text-gray-500 mb-8 text-center">
        No tienes permisos para acceder a esta página.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
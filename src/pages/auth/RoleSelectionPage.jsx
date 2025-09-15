import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Users, User, Shield, Award } from 'react-feather';
import Logo from '../../assets/LOGO BUSSTER GYM.png';
import { useAuth } from '../../shared/hooks/useAuth';

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState('');
  const { user, isAuthenticated } = useAuth();
  
  // Verificar si hay información en el estado de la ubicación
  const { email, password } = location.state || {};

  // Obtener la función para cambiar el rol activo
  const { cambiarRolActivo } = useAuth();
  
  // Función para manejar la selección de rol y redirigir
  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    
    // Si el usuario ya está autenticado, cambiamos su rol activo y redirigimos directamente al dashboard
    if (isAuthenticated && user) {
      // Actualizar el rol activo en el contexto de autenticación
      cambiarRolActivo(role);
      
      // Redirigir según el rol seleccionado
      if (role === 'cliente') {
        navigate('/client/dashboard');
      } else if (role === 'empleado') {
        // Redirigir según el rol de empleado específico
        switch(user.role) {
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'RECEPCIONISTA':
          case 'ENTRENADOR':
            navigate('/staff/dashboard');
            break;
          default:
            navigate('/staff/dashboard');
        }
      }
    } 
    // Si no está autenticado pero tenemos credenciales, enviamos al login con los datos
    else if (email && password) {
      navigate('/login', { state: { selectedRole: role, email, password } });
    } 
    // Si no hay nada, redirigimos al login con la selección
    else {
      navigate('/login', { state: { selectedRole: role } });
    }
  };
  
  // Función para volver a la página anterior
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#090909' }}>
      <div className="max-w-md w-full bg-[#18191A] p-8 rounded-2xl shadow-xl flex flex-col items-center" style={{ boxShadow: '0 4px 32px 0 rgba(0,0,0,0.25)' }}>
        {/* Logo y título */}
        <img className="h-20 w-auto mb-4" src={Logo} alt="GymBuster Logo" />
        <h1 className="text-center text-3xl font-extrabold mb-2">
          <span className="text-red-600">BUSTER</span>
          <span className="text-white ml-1">GYM</span>
        </h1>

        {/* Botones de selección de rol */}
        <div className="w-full space-y-4">
          <button
            type="button"
            onClick={() => handleRoleSelection('empleado')}
            className={`w-full flex items-center px-4 py-4 border ${
              selectedRole === 'empleado'
                ? 'border-red-600 bg-[#232325]'
                : 'border-gray-700 bg-[#18191A] hover:bg-[#232325]'
            } rounded-lg shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-150`}
          >
            <Shield className="h-6 w-6 text-red-600 mr-3" />
            <span className="flex flex-col items-start">
              <span className="font-bold text-lg">Acceder como Empleado</span>
              <span className="text-gray-400 text-sm">Para Recepcionistas, Entrenadores y Administradores</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelection('cliente')}
            className={`w-full flex items-center px-4 py-4 border ${
              selectedRole === 'cliente'
                ? 'border-red-600 bg-[#232325]'
                : 'border-gray-700 bg-[#18191A] hover:bg-[#232325]'
            } rounded-lg shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-150`}
          >
            <User className="h-6 w-6 text-red-600 mr-3" />
            <span className="flex flex-col items-start">
              <span className="font-bold text-lg">Acceder como Cliente</span>
              <span className="text-gray-400 text-sm">Para acceder a servicios y planes del gimnasio</span>
            </span>
          </button>
        </div>

        {/* Botón volver */}
        <div className="w-full mt-6">
          <button
            type="button"
            onClick={goBack}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-[#18191A] hover:bg-[#232325] focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-150"
          >
            <ArrowLeft className="h-4 w-4 mr-2 text-gray-400" />
            Volver
          </button>
        </div>

        {/* Pie de página */}
        <div className="w-full mt-8">
          <p className="text-center text-xs text-gray-400">© 2025 Buster GYM. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;

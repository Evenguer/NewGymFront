import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';

const ProtectedRoute = ({ 
  allowedRoles = [], 
  redirectPath = '/login' 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Si está cargando, muestra un spinner o loading
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
    </div>;
  }
  
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Si se especifican roles permitidos, verificar que el usuario tenga al menos uno de esos roles
  if (allowedRoles.length > 0) {
    // Comprobar acceso basado en:
    // 1. El rol activo seleccionado explícitamente (nueva propiedad)
    // 2. El campo role (compatibilidad con código existente) 
    // 3. El array de roles completo
    
    // Primero verificamos si hay un rol activo seleccionado
    const rolActivo = user.rolActivo;
    
    const tieneAcceso = 
      // Verificar si el rol activo (cliente/empleado) tiene acceso
      (rolActivo === 'cliente' && allowedRoles.includes('CLIENTE')) ||
      (rolActivo === 'empleado' && 
        (allowedRoles.includes('ADMIN') || 
         allowedRoles.includes('RECEPCIONISTA') || 
         allowedRoles.includes('ENTRENADOR'))) ||
      
      // Verificar por el rol principal (para compatibilidad)
      allowedRoles.includes(user.role) || 
      
      // Verificar en el array de roles completo
      (user.roles && user.roles.some(rol => {
        // Normalizar el rol para comparación (puede tener prefijo ROLE_)
        const rolNormalizado = typeof rol === 'string' ? 
          rol.toUpperCase().replace('ROLE_', '') : 
          (rol.authority ? rol.authority.toUpperCase().replace('ROLE_', '') : '');
        
        return allowedRoles.some(rolPermitido => 
          rolNormalizado.includes(rolPermitido.toUpperCase())
        );
      }));
    
    if (!tieneAcceso) {
      // Si el usuario tiene múltiples roles pero no tiene acceso con el rol actualmente seleccionado,
      // redirigimos a la página de selección de rol en lugar de mostrar un mensaje de no autorizado
      if (user.tieneMultiplesRoles) {
        return <Navigate to="/role-selection" replace />;
      }
      
      // Si no tiene múltiples roles, entonces no tiene permisos para esta sección
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Si todo está bien, renderiza los componentes hijos
  return <Outlet />;
};

export default ProtectedRoute;
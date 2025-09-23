import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';

const ProtectedRoute = ({ 
  allowedRoles = [], 
  redirectPath = '/login' 
}) => {
  const { user, loading, isAuthenticated, logout } = useAuth();
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

  // Verificar que el usuario tenga acceso a la plataforma
  // Solo ADMIN y RECEPCIONISTA pueden acceder
  const tieneAccesoPlataforma = user?.roles?.some(rol => {
    const rolNormalizado = typeof rol === 'string' ? 
      rol.toUpperCase().replace('ROLE_', '') : 
      (rol?.authority ? rol.authority.toUpperCase().replace('ROLE_', '') : '');
    
    return rolNormalizado === 'ADMIN' || rolNormalizado === 'RECEPCIONISTA';
  });

  if (!tieneAccesoPlataforma) {
    // Cerrar sesión automáticamente si el usuario no tiene acceso
    logout();
    return <Navigate to="/login" replace />;
  }

  // Si se especifican roles permitidos, verificar que el usuario tenga al menos uno de esos roles
  if (allowedRoles.length > 0) {
    const tieneAcceso = user.roles && user.roles.some(rol => {
      // Normalizar el rol para comparación (puede tener prefijo ROLE_)
      const rolNormalizado = typeof rol === 'string' ? 
        rol.toUpperCase().replace('ROLE_', '') : 
        (rol?.authority ? rol.authority.toUpperCase().replace('ROLE_', '') : '');
      
      return allowedRoles.some(rolPermitido => 
        rolNormalizado === rolPermitido.toUpperCase()
      );
    });
    
    if (!tieneAcceso) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Si todo está bien, renderiza los componentes hijos
  return <Outlet />;
};

export default ProtectedRoute;
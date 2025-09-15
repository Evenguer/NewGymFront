import { useState } from 'react';
import { Eye, EyeOff } from 'react-feather';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { User, Lock } from "react-feather";

const LoginForm = () => {
  const location = useLocation();
  const { selectedRole, email, password } = location.state || {};
  
  const [formData, setFormData] = useState({
    nombreUsuario: email || '',
    contrasena: password || '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
    if (error) {
      clearError();
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.nombreUsuario) {
      errors.nombreUsuario = 'El nombre de usuario es requerido';
    }
    if (!formData.contrasena) {
      errors.contrasena = 'La contraseña es requerida';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const user = await login(formData);
      console.log('Usuario autenticado:', user);
      
      // Si el usuario tiene múltiples roles (cliente y algún rol de empleado) y no ha seleccionado uno
      if (user.tieneMultiplesRoles && !selectedRole) {
        console.log('Usuario con múltiples roles, redirigiendo a selección de rol');
        // Guardar las credenciales en el estado para no pedirlas de nuevo después de seleccionar rol
        navigate('/role-selection', { 
          state: { email: formData.nombreUsuario, password: formData.contrasena } 
        });
        return;
      }
      
      // Si ya seleccionó rol cliente o solo tiene rol cliente
      if (selectedRole === 'cliente' || (!selectedRole && user.role === 'CLIENTE' && !user.tieneRolEmpleado)) {
        console.log('Redirigiendo a dashboard de cliente');
        navigate('/client/dashboard');
        return;
      }
      
      // Para roles de empleado (seleccionado o único)
      if (selectedRole === 'empleado' || (!selectedRole && user.tieneRolEmpleado)) {
        console.log('Redirigiendo según rol de empleado:', user.role);
        
        switch(user.role) {
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'RECEPCIONISTA':
          case 'ENTRENADOR':
            navigate('/staff/dashboard');
            break;
          default:
            // Si el rol no es reconocido pero seleccionó empleado, ir al dashboard de staff
            navigate('/staff/dashboard');
        }
        return;
      }
      
      // Caso de fallback si algo no se maneja correctamente
      console.warn('No se pudo determinar la redirección adecuada');
      navigate('/login');
    } catch (error) {
      console.error('Error de login:', error);
      // El error ya se maneja en el AuthContext y se muestra en la UI
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full">
      {/* Usuario */}
      <div className="mb-6 relative">
            <input
              type="text"
              id="nombreUsuario"
              name="nombreUsuario"
              value={formData.nombreUsuario}
              onChange={handleChange}
          placeholder="Usuario"
          autoComplete="username"
          className={`w-full pl-12 pr-4 py-3 rounded-lg bg-neutral-700/70 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 transition text-base ${formErrors.nombreUsuario ? "ring-2 ring-red-500" : ""}`}
        />
        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-red-700" size={20} />
          {formErrors.nombreUsuario && (
          <span className="text-xs text-red-500 absolute left-0 -bottom-5">{formErrors.nombreUsuario}</span>
          )}
        </div>
      {/* Contraseña */}
      <div className="mb-8 relative">
        <input
          type={showPassword ? "text" : "password"}
          id="contrasena"
          name="contrasena"
          value={formData.contrasena}
          onChange={handleChange}
          placeholder="Contraseña"
          autoComplete="current-password"
          className={`w-full pl-12 pr-12 py-3 rounded-lg bg-neutral-700/70 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 transition text-base ${formErrors.nombreUsuario ? "ring-2 ring-red-500" : ""}`}
        />
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-red-700" size={20} />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-red-700 focus:outline-none"
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        {formErrors.contrasena && (
          <span className="text-xs text-red-500 absolute left-0 -bottom-5">{formErrors.contrasena}</span>
        )}
      </div>
      {/* Error de login */}
      {error && (
        <div className="text-center text-sm text-red-500 mb-2">
          {error.toLowerCase().includes('usuario') || error.toLowerCase().includes('credencial')
            ? 'Usuario incorrecto'
            : error}
        </div>
      )}
      {/* Botón */}
        <button
          type="submit"
        className="w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-semibold py-3 rounded-lg text-base shadow-md transition tracking-wide"
      >
        Entrar
      </button>
      {/* Olvidaste tu contraseña */}
      <div className="mt-6 text-center">
    </div>
    </form>
  );
};

export default LoginForm;

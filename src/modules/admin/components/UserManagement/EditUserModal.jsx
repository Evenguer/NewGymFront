import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff } from 'react-feather';
import {
  isStrongPassword,
  ERROR_MESSAGES
} from '../../../../shared/utils/validations';
import { Dialog } from '@headlessui/react';
import { Button } from '../../../../components/ui';
import { updateUserCredentials, updateUserRole } from '../../../../shared/services/authAPI';
import { useAuth } from '../../../../shared/hooks/useAuth';
import './modal-styles.css';

const EditUserModal = ({ user, isOpen, onClose, onSave }) => {
  const { user: currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    contrasena: '',
    confirmarContrasena: '',
    rol: ''
  });
    const [rolesDisponibles] = useState([
    { id: 'RECEPCIONISTA', nombre: 'Recepcionista' },
    { id: 'ENTRENADOR', nombre: 'Entrenador' },
    { id: 'CLIENTE', nombre: 'Cliente' }
  ]);
  
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // Cuando se recibe el usuario, inicializar el formulario  // Función para verificar si el usuario tiene rol de administrador
  const checkIfAdmin = useCallback((user) => {
    if (!user) return false;
    
    // Verificar en roles (array completo)
    if (user.roles) {
      if (Array.isArray(user.roles)) {
        const hasAdminRole = user.roles.some(role => {
          if (typeof role === 'string') {
            return role === 'ROLE_ADMIN' || role === 'ADMIN';
          } else if (typeof role === 'object' && role !== null) {
            // Si es un objeto, verificar sus propiedades
            const roleId = role.id || role.nombre || '';
            return roleId === 'ROLE_ADMIN' || roleId === 'ADMIN';
          }
          return false;
        });
        
        if (hasAdminRole) return true;
      } else if (typeof user.roles === 'string') {
        // Si roles es un string directamente
        return user.roles === 'ROLE_ADMIN' || user.roles === 'ADMIN';
      } else if (typeof user.roles === 'object' && user.roles !== null) {
        // Si roles es un objeto
        const roleId = user.roles.id || user.roles.nombre || '';
        return roleId === 'ROLE_ADMIN' || roleId === 'ADMIN';
      }
    }
    
    // Verificar en role (string de rol principal)
    if (user.role) {
      return user.role === 'ADMIN' || user.role === 'ROLE_ADMIN';
    }
    
    // Verificar en authorities (formato Spring Security)
    if (user.authorities && Array.isArray(user.authorities)) {
      return user.authorities.some(auth => 
        (typeof auth === 'string' && (auth === 'ROLE_ADMIN' || auth === 'ADMIN')) || 
        (auth && auth.authority && (auth.authority === 'ROLE_ADMIN' || auth.authority === 'ADMIN'))
      );
    }
    
    return false;
  }, []);
  // Función para normalizar el rol a un formato estándar usando useCallback para evitar recreación
  const normalizeRole = useCallback((roleData) => {
    if (!roleData) return '';
    
    // Función para normalizar un solo valor de rol
    const normalizeRoleValue = (value) => {
      if (!value) return '';
      
      // Si es un string, normalizarlo
      if (typeof value === 'string') {
        // Eliminar el prefijo ROLE_ si existe
        let normalizedRole = value;
        if (normalizedRole.startsWith('ROLE_')) {
          normalizedRole = normalizedRole.replace('ROLE_', '');
        }
        
        // Asegurar que sea un valor válido
        if (['ADMIN', 'CLIENTE', 'ENTRENADOR', 'RECEPCIONISTA'].includes(normalizedRole)) {
          return normalizedRole;
        }
      }
      
      // Si es un objeto, buscar propiedades comunes
      if (typeof value === 'object' && value !== null) {
        if (value.id) return normalizeRoleValue(value.id);
        if (value.nombre) return normalizeRoleValue(value.nombre);
      }
      
      return '';
    };
    
    // Si es un array, manejar posibles duplicados
    if (Array.isArray(roleData)) {
      // Si está vacío, devolver string vacío
      if (roleData.length === 0) return '';
      
      // Eliminar roles duplicados utilizando un Set
      const rolesSet = new Set();
      for (let role of roleData) {
        const normalizedRole = normalizeRoleValue(role);
        if (normalizedRole) rolesSet.add(normalizedRole);
      }
      
      // Priorizar roles de mayor privilegio
      if (rolesSet.has('ADMIN')) return 'ADMIN';
      if (rolesSet.has('ENTRENADOR')) return 'ENTRENADOR';
      if (rolesSet.has('RECEPCIONISTA')) return 'RECEPCIONISTA';
      if (rolesSet.has('CLIENTE')) return 'CLIENTE';
      
      // Si llegamos aquí y hay roles, devolver el primero
      if (rolesSet.size > 0) return Array.from(rolesSet)[0];
      
      return '';
    }
    
    // Para un valor único, usar la función normalizeRoleValue
    return normalizeRoleValue(roleData);
  }, []);

  useEffect(() => {
    if (user) {
      console.log('Usuario recibido en modal:', user);
      
      // Detectar y normalizar el rol
      const userRole = user.roles ? normalizeRole(user.roles) : (user.role ? normalizeRole(user.role) : '');
      
      console.log('Rol detectado y normalizado:', userRole);
        console.log('Inicializando formulario con rol normalizado:', userRole);
      
      setFormData({
        nombreUsuario: user.nombreUsuario || '',
        contrasena: '',
        confirmarContrasena: '',
        rol: userRole
      });
      
      console.log('Usuario actual (sesión):', currentUser);
      
      // Verificar si el usuario actual tiene rol de administrador
      const isAdmin = checkIfAdmin(currentUser);
      console.log('¿Es administrador?', isAdmin);
      
      if (!isAdmin) {
        setFormErrors(prev => ({
          ...prev,
          general: "No tienes permisos de administrador para editar usuarios. Solo los administradores pueden realizar esta acción."
        }));
      }
    }
  }, [user, currentUser, normalizeRole, checkIfAdmin]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores al editar
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
    // Ya no necesitamos handleSelectChange porque usamos handleInputChange para el select nativo
    const validateForm = () => {
    const errors = {};
    
    if (!formData.nombreUsuario || formData.nombreUsuario.trim() === '') {
      errors.nombreUsuario = 'El nombre de usuario es obligatorio';
    }
    
    if (changePassword) {
      if (!formData.contrasena) {
        errors.contrasena = 'La contraseña es obligatoria';
      } else if (!isStrongPassword(formData.contrasena)) {
        errors.contrasena = ERROR_MESSAGES.password;
      }
      if (formData.contrasena !== formData.confirmarContrasena) {
        errors.confirmarContrasena = 'Las contraseñas no coinciden';
      }
    }
    
    // Validar las reglas de negocio para cambios de rol
    if (formData.rol) {
      // Determinar el rol actual y el nuevo rol
      const rolActual = normalizeRole(user.roles || user.role || '');
      const nuevoRol = formData.rol;
      // Ya no se restringe el cambio de empleado a cliente
      // Solo validar que el rol seleccionado sea válido
      const rolesValidos = ['ADMIN', 'ENTRENADOR', 'RECEPCIONISTA', 'CLIENTE'];
      if (!rolesValidos.includes(nuevoRol)) {
        errors.rol = 'Rol seleccionado no es válido.';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
    const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
      // Verificar si el usuario actual es administrador
    const isAdmin = checkIfAdmin(currentUser);
    console.log('¿Es administrador al guardar?', isAdmin);
                   
    if (!isAdmin) {
      setFormErrors(prev => ({
        ...prev,
        general: "Solo los administradores pueden modificar usuarios. No tienes permisos suficientes."
      }));
      return;
    }
    
    setLoading(true);
    try {
      // Preparar datos para actualizar
      const credentialsData = {
        nombreUsuario: formData.nombreUsuario
      };
      
      // Si se ha marcado cambiar contraseña, añadirla
      if (changePassword && formData.contrasena) {
        credentialsData.contrasena = formData.contrasena;
      }
      
      // 1. Actualizar credenciales (nombre de usuario y contraseña)
      try {
        await updateUserCredentials(user.id, credentialsData, currentUser.token);
      } catch (credentialsError) {
        // Manejo específico para errores de credenciales
        const errorMessage = credentialsError.message.includes('403') 
          ? 'No tienes permisos para actualizar las credenciales del usuario.'
          : credentialsError.message;
          
        throw new Error(errorMessage);
      }      // 2. Si el rol ha cambiado, actualizarlo también
      // Obtener el rol actual usando la función de normalización
      const userCurrentRole = normalizeRole(user.roles || user.role || '');
      
      console.log('Rol actual normalizado:', userCurrentRole);
      console.log('Nuevo rol:', formData.rol);      if (formData.rol && formData.rol !== userCurrentRole) {
        // Asegurar que el rol esté en el formato esperado por el backend
        const formattedRol = formData.rol.replace('ROLE_', ''); // Eliminar prefijo si existe
        
        console.log('Rol actual:', userCurrentRole);
        console.log('Nuevo rol seleccionado:', formData.rol);
        console.log('Rol formateado para enviar al backend:', formattedRol);
        
        // Ya no se restringe el cambio de empleado a cliente. El backend lo permite y el frontend también debe permitirlo.
        
        try {
          await updateUserRole(user.id, formattedRol, currentUser.token);
          console.log('Rol actualizado exitosamente');
          // Si necesitas lógica especial para cambios de rol, agrégala aquí, pero ya no se requiere para cliente/empleado.
        } catch (roleError) {
          console.error('Error detallado al actualizar rol:', roleError);
          // Manejo específico para errores de rol
          const errorMessage = roleError.message.includes('403')
            ? 'No tienes permisos para cambiar el rol del usuario.'
            : roleError.message;
            
          throw new Error(errorMessage);
        }
      }      // Crear un objeto actualizado con los cambios
      const updatedUser = {
        ...user,
        nombreUsuario: formData.nombreUsuario,
        // Usar el rol normalizado sin prefijo ROLE_
        roles: formData.rol ? [formData.rol] : (user.roles || []), // Asegurar que roles sea un array
        role: formData.rol, // También actualizar la propiedad role por compatibilidad
        // Preservar la bandera de cambio cliente a empleado y detalles si existen
        clienteAEmpleado: user.clienteAEmpleado || false,
        detallesCambioRol: user.detallesCambioRol || null,
        // Información adicional para facilitar el manejo en la UI
        _esPromocion: user.clienteAEmpleado || false,
        _rolAnterior: normalizeRole(user.roles || user.role),
        _fechaActualizacion: new Date().toISOString()
      };
      
      console.log('Usuario actualizado:', updatedUser);
      
      // Notificar que se guardó correctamente
      onSave(updatedUser);
      
      // Cerrar modal
      onClose();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setFormErrors(prev => ({
        ...prev,
        general: error.message || 'Error al actualizar el usuario. Intente nuevamente.'
      }));
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog as="div" className="modal-container relative z-50" open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black bg-opacity-25" />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="modal-content w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 mb-4">
              Editar Usuario
            </Dialog.Title>
            
            <form onSubmit={handleSubmit}>
        {formErrors.general && (
                <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                  <p className="font-medium mb-1">Error:</p>
                  <p>{formErrors.general}</p>
                  {formErrors.general.includes('No tienes permisos') && (
                    <p className="mt-2 text-sm">
                      Contacta al administrador del sistema si necesitas modificar esta información.
                    </p>
                  )}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de Usuario*
                </label>
                <input
                  type="text"
                  name="nombreUsuario"
                  value={formData.nombreUsuario}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${formErrors.nombreUsuario ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.nombreUsuario && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.nombreUsuario}</p>
                )}
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="changePassword"
                    checked={changePassword}
                    onChange={(e) => setChangePassword(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="changePassword" className="text-sm font-medium text-gray-700">
                    Cambiar contraseña
                  </label>
                </div>
                
                {changePassword && (
                  <>
                    <div className="mb-3 relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña*
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="contrasena"
                        value={formData.contrasena}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded ${formErrors.contrasena ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                        tabIndex={-1}
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <p className="text-gray-500 text-xs mt-1">La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.</p>
                      {formErrors.contrasena && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.contrasena}</p>
                      )}
                    </div>
                    <div className="mb-3 relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Contraseña*
                      </label>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmarContrasena"
                        value={formData.confirmarContrasena}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded ${formErrors.confirmarContrasena ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                        tabIndex={-1}
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      {formErrors.confirmarContrasena && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.confirmarContrasena}</p>
                      )}
                    </div>
                  </>
                )}
              </div>                <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <div className="select-wrapper relative">
                  {/* Agregar información sobre reglas de cambio de rol */}
                  {user && normalizeRole(user.roles || user.role) === "CLIENTE" && (
                    <div className="mb-2 p-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-xs">
                      <strong>Nota:</strong> Un cliente puede ser promovido a roles de empleado (Administrador, Recepcionista o Entrenador).
                      Sus datos como cliente se mantendrán intactos.
                    </div>
                  )}
                  
                  {user && ['ADMIN', 'ENTRENADOR', 'RECEPCIONISTA'].includes(normalizeRole(user.roles || user.role)) && (
                    <div className="mb-2 p-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-xs">
                      <strong>Importante:</strong> Un empleado puede volver a tener el rol de Cliente si es necesario. 
                      Puedes cambiar el rol de empleado a cliente sin restricciones.
                    </div>
                  )}
                  
                  <select
                    name="rol"
                    value={formData.rol || ''}
                    onChange={handleInputChange}
                    className={`w-full p-2 pr-8 border rounded appearance-none bg-white ${formErrors.rol ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="" disabled>Seleccione un rol</option>
                    {rolesDisponibles.map((rol) => (
                      <option 
                        key={rol.id} 
                        value={rol.id}
                      >
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {formErrors.rol && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.rol}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button type="button" onClick={onClose} variant="secondary" disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default EditUserModal;

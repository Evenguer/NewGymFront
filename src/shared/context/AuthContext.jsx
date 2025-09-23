import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// URL base de la API
const API_URL = 'http://localhost:8080/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para normalizar roles (pueden venir en diferentes formatos)
  const normalizarRoles = (roles) => {
    if (!Array.isArray(roles)) {
      if (typeof roles === 'string') {
        roles = [roles]; // Si es string, lo convertimos a array
      } else {
        console.warn('Roles no es un array ni string:', roles);
        return []; // Array vacío si roles no es válido
      }
    }
    
    return roles.map(rol => {
      if (typeof rol === 'string') {
        return rol.toUpperCase();
      } else if (rol && rol.authority) {
        return rol.authority.toUpperCase();
      } else if (rol && rol.nombre) {
        return rol.nombre.toUpperCase();
      }
      return '';
    });
  };
  
  // Función para verificar si un usuario tiene un rol específico
  const verificarRol = useCallback((roles, rolBuscado) => {
    const rolesNormalizados = normalizarRoles(roles);
    return rolesNormalizados.some(rol => 
      rol === rolBuscado || 
      rol === `ROLE_${rolBuscado}` || 
      rol.includes(rolBuscado)
    );
  }, []);
  
  // Función para verificar si el usuario tiene algún rol de empleado
  const verificarRolEmpleado = (roles) => {
    return verificarRol(roles, 'ADMIN') || 
           verificarRol(roles, 'RECEPCIONISTA') || 
           verificarRol(roles, 'ENTRENADOR');
  };

  // Función para verificar si el usuario tiene acceso permitido a la plataforma
  // Solo ADMIN y RECEPCIONISTA pueden acceder
  const tieneAccesoPermitido = useCallback((roles) => {
    return verificarRol(roles, 'ADMIN') || verificarRol(roles, 'RECEPCIONISTA');
  }, [verificarRol]);

  // Función auxiliar para obtener el rol principal del usuario
  const obtenerRolPrincipal = (roles) => {
    console.log('Obteniendo rol principal de:', roles);
    const rolesNormalizados = normalizarRoles(roles);
    console.log('Roles normalizados:', rolesNormalizados);
    
    // Buscar roles en orden de prioridad, ahora considerando el prefijo ROLE_
    if (rolesNormalizados.some(r => r.includes('ADMIN') || r === 'ROLE_ADMIN')) return 'ADMIN';
    if (rolesNormalizados.some(r => r.includes('RECEP') || r === 'ROLE_RECEPCIONISTA')) return 'RECEPCIONISTA';
    if (rolesNormalizados.some(r => r.includes('ENTRENADOR') || r.includes('TRAINER') || r === 'ROLE_ENTRENADOR')) return 'ENTRENADOR';
    return 'CLIENTE';
  };

  // Configurar interceptor para incluir el token en todas las solicitudes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Opcional: interceptor para manejar errores de autorización globalmente
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    
    return () => axios.interceptors.response.eject(interceptor);
  }, [token]);

  useEffect(() => {
    // Verificar si hay token al cargar la aplicación
    const checkAuth = async () => {
      if (token) {
        try {
          // Si tenemos información del usuario en localStorage, la usamos
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              
              // Verificar que el usuario tenga acceso permitido
              if (!tieneAccesoPermitido(parsedUser.roles || [])) {
                console.log('Usuario sin acceso permitido, cerrando sesión');
                logout();
                setLoading(false);
                return;
              }
              
              setUser(parsedUser);
              setIsAuthenticated(true);
            } catch (e) {
              console.error('Error al parsear la información del usuario almacenada', e);
              logout();
            }
          } else {
            // Si no hay información almacenada pero hay token, validar contra el servidor
            try {
              const response = await axios.get(`${API_URL}/auth/me`);
              const userData = response.data;
              
              // Verificar que el usuario tenga acceso permitido
              if (!tieneAccesoPermitido(userData.roles || [])) {
                console.log('Usuario sin acceso permitido según servidor, cerrando sesión');
                logout();
                setLoading(false);
                return;
              }
              
              setUser(userData);
              setIsAuthenticated(true);
              localStorage.setItem('user', JSON.stringify(userData));
            } catch (err) {
              console.error('Error al verificar con el servidor', err);
              logout();
            }
          }
        } catch (err) {
          console.error('Error al verificar la autenticación', err);
          logout();
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, [token, tieneAccesoPermitido]);

  const login = async (credentials) => {
    try {
      setError(null);
      
      // Realizar petición al backend real
      const response = await axios.post(`${API_URL}/auth/login`, credentials);

      // Imprimir la respuesta completa para depuración
      console.log('Respuesta de login:', response.data);

      // Verificar la estructura de la respuesta
      if (!response.data) {
        throw new Error('Respuesta del servidor vacía');

      }      // La respuesta debería ser un objeto JwtResponse según tu backend
      // {id: number, token: string, tipo: string, nombreUsuario: string, roles: string[]}
      const { id, token, nombreUsuario, roles } = response.data;
      

      if (!token) {
        throw new Error('No se recibió el token de autenticación');
      }

      // Guardar token en localStorage
      localStorage.setItem('token', token);
      setToken(token);

      
      // Verificar si el usuario tiene algún rol con acceso a la plataforma
      // Solo ADMIN y RECEPCIONISTA pueden acceder
      const rolPrincipal = obtenerRolPrincipal(roles);
      
      if (!tieneAccesoPermitido(roles)) {
        logout(); // Limpiar cualquier token almacenado
        throw new Error('Tu cuenta no tiene acceso a la plataforma');
      }

      // Crear objeto de usuario a partir de los datos obtenidos
      const userFromResponse = {
        id: id || 0,
        username: nombreUsuario,
        name: nombreUsuario,
        roles: roles || [],
        role: rolPrincipal,
        token: token
      };

      console.log('Usuario procesado:', userFromResponse);
      console.log('Roles recibidos:', roles);

      // Guardar información básica del usuario en localStorage
      localStorage.setItem('user', JSON.stringify(userFromResponse));

      setUser(userFromResponse);
      setIsAuthenticated(true);

      // Configurar token en cabeceras por defecto
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return userFromResponse;
    } catch (err) {
      // Capturar específicamente el mensaje de error del servidor si existe
      let mensaje;
      
      console.error('Error completo:', err);
      
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          mensaje = err.response.data;
        } else {
          mensaje = err.response.data.message || err.response.data.error || JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        mensaje = err.message;
      } else {
        mensaje = 'Error al iniciar sesión';
      }
      
      setError(mensaje);
      throw new Error(mensaje);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  const clearError = () => {
    setError(null);
  };
  
  // Nueva función para cambiar el rol activo del usuario sin tener que hacer login de nuevo
  const cambiarRolActivo = (rolSeleccionado) => {
    if (!user) return false;
    
    // Actualiza el objeto de usuario con el rol seleccionado como principal
    // pero mantiene todos los roles disponibles
    const usuarioActualizado = {
      ...user,
      rolActivo: rolSeleccionado, // Nuevo campo para indicar qué rol está usando actualmente
      // Si el rol seleccionado es 'cliente', actualizamos el rol principal para compatibilidad
      role: rolSeleccionado === 'cliente' ? 'CLIENTE' : user.role
    };
    
    // Guardar la información actualizada del usuario
    setUser(usuarioActualizado);
    localStorage.setItem('user', JSON.stringify(usuarioActualizado));
    
    return true;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        loading, 
        error, 
        login, 
        logout, 
        clearError,
        verificarRol, // Exponemos funciones útiles para verificar roles
        verificarRolEmpleado,
        cambiarRolActivo // Exponemos la función para cambiar el rol activo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
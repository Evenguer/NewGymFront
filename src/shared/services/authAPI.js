import axios from 'axios';
import { ENDPOINTS, BASE_URL } from './endpoints';

// URL base para todas las peticiones
const API_URL = 'http://localhost:8080'; // Definimos la URL base completa sin /api
// BASE_URL contiene '/api' pero necesitamos la base sin /api para algunas llamadas directas

export const login = async (credentials) => {
  try {
    // Usar directamente los campos tal como vienen del formulario
    // Sin cambiar los nombres
    console.log("Intentando login con:", JSON.stringify(credentials));
    
    const response = await axios.post(ENDPOINTS.LOGIN, credentials, {
      headers: {
        'Content-Type': 'application/json'
      }
      // Quita withCredentials si no es necesario
    });
    
    console.log("Respuesta:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error completo:", error);
    if (error.response) {
      console.error("Detalles del error:", error.response.data);
    }
    throw new Error(error.response?.data?.message || 'Error en el servidor');
  }
};

// Función para verificar si un DNI o correo ya existe
export const checkExistingUser = async (dni, correo) => {
  try {
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
      console.error('Token no válido o no encontrado');
      throw new Error('Sesión no válida. Por favor, inicia sesión nuevamente.');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Verificar DNI
    try {
      const dniResponse = await axios.get(`${API_URL}/api/personas/buscar/dni/${dni}`, { headers });
      if (dniResponse.data && dniResponse.data.idPersona) {
        return { exists: true, field: 'dni', message: 'El DNI ya está registrado' };
      }
    } catch (error) {
      // Solo manejamos errores que no sean 404
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else if (error.response.status !== 404) {
          console.error('Error al verificar DNI:', error.response.data);
          throw new Error('Error al verificar el DNI');
        }
      }
    }

    // Verificar correo
    try {
      const correoResponse = await axios.get(`${API_URL}/api/personas/buscar/correo/${correo}`, { headers });
      if (correoResponse.data && correoResponse.data.idPersona) {
        return { exists: true, field: 'correo', message: 'El correo ya está registrado' };
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else if (error.response.status !== 404) {
          console.error('Error al verificar correo:', error.response.data);
          throw new Error('Error al verificar el correo electrónico');
        }
      }
    }

    return { exists: false };
  } catch (error) {
    console.error('Error en verificación de usuario:', error);
    throw error instanceof Error ? error : new Error('Error al verificar los datos del usuario');
  }
};

export const register = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
      console.error('Token no válido o no encontrado');
      throw new Error('Sesión no válida. Por favor, inicia sesión nuevamente.');
    }


    console.log('Iniciando registro de usuario:', {
      rol: userData.rol,
      nombreUsuario: userData.nombreUsuario
    });

    // Verificar si el usuario ya existe antes de intentar registrarlo
    const userExists = await checkExistingUser(userData.dni, userData.correo);
    if (userExists.exists) {
      throw new Error(userExists.message);
    }

    // Configurar los headers con el token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Intentar el registro
    const response = await axios.post(
      `${API_URL}/api/auth/register`,
      userData,
      { headers }
    );

    console.log('Usuario registrado exitosamente:', response.data);
    return response.data;

  } catch (error) {
    console.error('Error en registro:', error);
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(error.response.data.message || 'Error al registrar el usuario');
    }
    throw error instanceof Error ? error : new Error('Error al registrar el usuario');
  }
};

export const getUsers = async (token) => {
  try {
    if (!token) {
      throw new Error('Se requiere token para obtener usuarios');
    }

    console.log('Obteniendo lista de usuarios...');
    
    const response = await axios.get(ENDPOINTS.GET_USERS, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Usuarios obtenidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
    }
    throw new Error(error.response?.data?.message || 'Error al obtener la lista de usuarios');
  }
};

// Alias de getUsers para mantener consistencia con otros métodos list*
export const listUsers = getUsers;

export const listClients = async (token) => {
  try {
    const response = await axios.get(ENDPOINTS.LIST_CLIENTS, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error al listar clientes:", error);
    throw new Error(error.response?.data?.message || 'Error al obtener la lista de clientes');
  }
};

export const toggleUserStatus = async (userId, newStatus, token) => {
  try {
    // Asegurarse de que el token esté presente
    if (!token) {
      throw new Error('Token no encontrado');
    }
    
    console.log(`Cambiando estado de usuario ID ${userId} a: ${newStatus ? 'Activo' : 'Inactivo'}`);
    
    // Utilizamos el endpoint correcto para usuarios de autenticación
    const response = await axios.put(
      ENDPOINTS.TOGGLE_USER_STATUS(userId),
      { estado: newStatus },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data) {
      throw new Error('Respuesta vacía del servidor');
    }
    
    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error al cambiar estado del usuario:", error);
    if (error.response) {
      console.error('Detalles del error:', error.response.status, error.response.data);
    }
    throw error;
  }
};

export const toggleClientStatus = async (clientId, newStatus, token) => {
  try {
    // Asegurarse de que el token esté presente
    if (!token) {
      throw new Error('Token no encontrado');
    }
    
    console.log(`Cambiando estado de cliente ID ${clientId} a: ${newStatus ? 'Activo' : 'Inactivo'}`);
    
    // Utilizamos el endpoint específico para clientes
    const response = await axios.put(
      ENDPOINTS.TOGGLE_CLIENT_STATUS(clientId),
      { estado: newStatus },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data) {
      throw new Error('Respuesta vacía del servidor');
    }
    
    console.log('Respuesta del servidor para cliente:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error al cambiar estado del cliente:", error);
    if (error.response) {
      console.error('Detalles del error:', error.response.status, error.response.data);
    }
    throw error;
  }
};

export const updateClient = async (clientId, data, token) => {
  try {
    if (!token) {
      throw new Error('Token no encontrado');
    }
    
    // Comprobación adicional para depurar problemas
    if (!clientId) {
      console.error('ID de cliente no válido:', clientId);
      throw new Error('ID de cliente no válido');
    }
      console.log(`Actualizando cliente ${clientId} con datos:`, JSON.stringify(data, null, 2));
    console.log('Endpoint usado:', ENDPOINTS.UPDATE_CLIENT(clientId));
    
    // Verificar específicamente si hay un cambio en el género
    if (data.genero !== undefined) {
      console.log('Detectado cambio en el campo "genero":', data.genero);
    }
    
    // Asegurarse de que el formato de fecha es el correcto
    if (data.fechaNacimiento === '') {
      data.fechaNacimiento = null;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('Headers de la petición:', headers);

    const response = await axios.put(
      ENDPOINTS.UPDATE_CLIENT(clientId),
      data,
      { headers }
    );

    if (!response.data) {
      throw new Error('Respuesta vacía del servidor');
    }

    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    if (error.response) {
      console.error('Detalles de respuesta:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    throw error;
  }
};

export const listEmployees = async (token) => {
  try {
    if (!token) {
      throw new Error('Se requiere token para listar empleados');
    }

    console.log('Obteniendo lista de empleados...');
    
    const response = await axios.get(ENDPOINTS.LIST_EMPLOYEES, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Empleados obtenidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al listar empleados:', error);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
    }
    throw new Error(error.response?.data?.message || 'Error al obtener la lista de empleados');
  }
};

export const getUsersSecurityDetails = async (token) => {
  try {
    if (!token) {
      console.error('Token no proporcionado al obtener detalles de seguridad');
      throw new Error('Se requiere token para obtener detalles de seguridad');
    }
    
    console.log('Obteniendo información de último acceso...');
    
    const response = await axios.get(ENDPOINTS.GET_USERS_SECURITY, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Información de último acceso obtenida:', response.data.length, 'registros');
    return response.data;
  } catch (error) {
    console.error('Error al obtener información de último acceso:', error);
    if (error.response) {
      console.error('Detalles del error:', error.response.status, error.response.data);
      
      // Si el error es 403, puede ser un problema de permisos o token expirado
      if (error.response.status === 403) {
        console.error('Error 403: No tienes permisos o el token ha expirado');
        localStorage.removeItem('token'); // Forzar nueva autenticación
        throw new Error('Sesión caducada o sin permisos. Por favor, vuelve a iniciar sesión');
      }
    }
    throw new Error(error.response?.data?.message || 'Error al obtener información de último acceso');
  }
};

export const updateUserCredentials = async (userId, credentials, token) => {
  try {
    // Usar la URL directamente con la ruta correcta
    const response = await fetch(`${API_URL}/api/auth/usuarios/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Error actualizando credenciales de usuario:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, roleName, token) => {
  try {
    // Normalizar el rol para asegurar que está en formato correcto (sin prefijo ROLE_)
    let normalizedRole = roleName;
    if (normalizedRole.startsWith('ROLE_')) {
      normalizedRole = normalizedRole.replace('ROLE_', '');
    }
    
    console.log(`Enviando actualización de rol para usuario ${userId}: ${normalizedRole}`);
    
    // Usar la URL directamente con la ruta correcta
    const response = await fetch(`${API_URL}/api/auth/usuarios/${userId}/rol`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rol: normalizedRole })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error actualizando rol de usuario:', error);
    throw error;
  }
};
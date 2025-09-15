import axios from 'axios';
import { ENDPOINTS } from '../../../shared/services/endpoints';
import { listEmployees, listClients } from '../../../shared/services/authAPI';

// Función de utilidad para verificar roles
const checkRole = (requiredRoles) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    throw new Error('No hay usuario autenticado');
  }
  
  const userRole = user.role;
  if (!requiredRoles.includes(userRole)) {
    throw new Error('No tienes permisos para realizar esta acción');
  }
};

// Función auxiliar para obtener el token
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token disponible');
  }
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const alquilerAPI = {
  listarAlquileres: async () => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const config = getAuthConfig();
      const response = await axios.get(ENDPOINTS.ALQUILER.LISTAR, config);
      console.log('Respuesta del servidor (alquileres):', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al listar alquileres:', error);
      throw error;
    }
  },

  // Servicios para obtener empleados y clientes
  obtenerEmpleados: async () => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token disponible');
      }
      return await listEmployees(token);
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      throw error;
    }
  },

  obtenerClientes: async () => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token disponible');
      }
      return await listClients(token);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  },

  cambiarEstadoAlquiler: async (id, estado) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      const response = await axios.put(
        ENDPOINTS.ALQUILER.CAMBIAR_ESTADO(id),
        null,
        {
          ...getAuthConfig(),
          params: { estado }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado del alquiler:', error);
      throw error;
    }
  },
  
  finalizarAlquiler: async (id) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      const response = await axios.put(
        ENDPOINTS.ALQUILER.FINALIZAR(id),
        null,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error al finalizar el alquiler:', error);
      throw error;
    }
  },
  
  cancelarAlquiler: async (id) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      const response = await axios.put(
        ENDPOINTS.ALQUILER.CANCELAR(id),
        null,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error al cancelar el alquiler:', error);
      throw error;
    }
  },
  
  marcarVencido: async (id) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      const response = await axios.put(
        ENDPOINTS.ALQUILER.VENCIDO(id),
        null,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error al marcar como vencido el alquiler:', error);
      throw error;
    }
  },

  eliminarDetalleAlquiler: async (detalleId) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const response = await axios.delete(
        ENDPOINTS.ALQUILER.DETALLE.ELIMINAR(detalleId),
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error al eliminar detalle de alquiler:', error);
      throw error;
    }
  },

  listarPiezas: async () => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      console.log('Usando endpoint de piezas:', ENDPOINTS.PIEZA.LISTAR);
      
      const response = await axios.get(
        ENDPOINTS.PIEZA.LISTAR,
        getAuthConfig()
      );
      
      // Asegurar que response.data es un array
      console.log('Respuesta original de piezas:', response.data);
      
      // Si response.data no es un array, intenta convertirlo o devuelve un array vacío
      if (!Array.isArray(response.data)) {
        if (response.data && typeof response.data === 'object') {
          // Si es un objeto, podría ser que la API esté devolviendo un wrapper con la lista dentro
          // Buscar alguna propiedad que pueda contener el array
          const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            console.log('Se encontró un array dentro del objeto:', possibleArrays[0]);
            return possibleArrays[0];
          }
          
          // Si no hay arrays dentro, pero puede ser iterable, convertimos a array
          console.log('Convirtiendo objeto a array de piezas');
          return Object.values(response.data);
        }
        
        // Si no podemos convertirlo, devolvemos array vacío para evitar errores
        console.error('La respuesta no es un array ni se puede convertir:', response.data);
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al listar piezas:', error);
      // Devolvemos array vacío en caso de error
      return [];
    }
  },

  obtenerAlquilerConDetalle: (idAlquiler) => {
    const alquileres = JSON.parse(localStorage.getItem('alquileres') || '[]');
    const alquiler = alquileres.find(a => a.idAlquiler === idAlquiler);
    if (!alquiler) {
      throw new Error('Alquiler no encontrado');
    }
    return alquiler;
  },

  registrarDevolucion: async (id) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      const response = await axios.put(
        ENDPOINTS.ALQUILER.REGISTRAR_DEVOLUCION(id),
        null,
        getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al registrar devolución del alquiler:', error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  crearAlquilerCompleto: async (alquilerCompleto) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      console.log('Datos de alquiler completo a enviar:', alquilerCompleto);
      
      const response = await axios.post(
        ENDPOINTS.ALQUILER.CREAR_COMPLETO,
        alquilerCompleto,
        getAuthConfig()
      );
      
      console.log('Respuesta completa del servidor al crear alquiler completo:', response);
      return response.data;
    } catch (error) {
      console.error('Error detallado al crear el alquiler completo:', error);
      throw new Error(error.response?.data || error.message || 'Error al crear el alquiler completo');
    }
  },

  verificarVencidos: async () => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      const response = await axios.get(
        ENDPOINTS.ALQUILER.VERIFICAR_VENCIDOS,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error al verificar alquileres vencidos:', error);
      throw error;
    }
  },

  calcularPrecio: async (fechaInicio, fechaFin, detalles) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      const response = await axios.post(
        ENDPOINTS.ALQUILER.CALCULAR_PRECIO,
        {
          fechaInicio,
          fechaFin,
          detalles
        },
        getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al calcular precio del alquiler:', error);
      throw error;
    }
  },
};

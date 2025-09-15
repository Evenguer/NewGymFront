import axios from 'axios';
import { ENDPOINTS } from '../../../shared/services/endpoints';

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

export const asistenciaClienteAPI = {
  /**
   * Registra la asistencia de un cliente mediante QR
   * @param {number} idInscripcion - ID de la inscripción
   * @returns {Promise<Object>} Respuesta del servidor
   */
  registrarAsistenciaPorQR: async (idInscripcion) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      console.log('Registrando asistencia para inscripción:', idInscripcion);
      
      const config = getAuthConfig();
      const response = await axios.post(
        `${ENDPOINTS.REGISTER_ATTENDANCE_QR}?idInscripcion=${idInscripcion}`,
        {},
        config
      );
      
      console.log('Respuesta del servidor (asistencia):', response.data);
      return {
        success: true,
        message: response.data
      };
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      
      // Manejar errores de axios
      if (error.response) {
        const errorMessage = error.response.data || 'Error al registrar asistencia';
        throw new Error(errorMessage);
      }
      
      throw error;
    }
  },

  /**
   * Lista todas las asistencias de clientes
   * @returns {Promise<Array>} Lista de asistencias con datos del cliente
   */
  listarAsistenciasClientes: async () => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      console.log('Obteniendo lista de asistencias de clientes...');
      
      const config = getAuthConfig();
      const response = await axios.get(ENDPOINTS.LIST_CLIENT_ATTENDANCE, config);
      
      console.log('Lista de asistencias obtenida:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener asistencias:', error);
      
      // Manejar errores de axios
      if (error.response) {
        const errorMessage = error.response.data?.message || 'Error al obtener las asistencias';
        throw new Error(errorMessage);
      }
      
      throw error;
    }
  }
};
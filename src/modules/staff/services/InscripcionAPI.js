import axios from 'axios';
import { ENDPOINTS } from '../../../shared/services/endpoints';
import { listEmployees, listClients } from '../../../shared/services/authAPI';
import { listPlanes } from '../../../shared/services/planAPI';

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

export const inscripcionAPI = {
  // Registrar nueva inscripción
  registrarInscripcion: async (inscripcionData) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      console.log('Datos de inscripción a enviar:', inscripcionData);
      
      const response = await axios.post(
        ENDPOINTS.REGISTER_INSCRIPTION,
        inscripcionData,
        getAuthConfig()
      );
      
      console.log('Respuesta del servidor (inscripción):', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al registrar inscripción:', error);
      if (error.response?.status === 400) {
        throw new Error(error.response.data || 'Datos de inscripción inválidos');
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permiso para registrar inscripciones');
      }
      throw new Error(error.response?.data?.message || error.message || 'Error al registrar la inscripción');
    }
  },

  // Obtener instructores disponibles por plan
  obtenerInstructoresDisponibles: async (idPlan) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      if (!idPlan) {
        throw new Error('ID del plan es requerido');
      }
      
      const response = await axios.get(
        ENDPOINTS.LIST_AVAILABLE_INSTRUCTORS(idPlan),
        getAuthConfig()
      );
      
      console.log('Instructores disponibles para plan', idPlan, ':', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener instructores disponibles:', error);
      if (error.response?.status === 404) {
        throw new Error('Plan no encontrado');
      }
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener instructores disponibles');
    }
  },

  // Obtener horarios de un instructor
  obtenerHorariosInstructor: async (idEmpleado) => {
    try {
      // Permitir a ADMIN, RECEPCIONISTA y ENTRENADOR
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('No hay usuario autenticado');
      if (!['ADMIN', 'RECEPCIONISTA', 'ENTRENADOR'].includes(user.role)) {
        throw new Error('No tienes permisos para realizar esta acción');
      }
      if (!idEmpleado) {
        throw new Error('ID del empleado es requerido');
      }
      const response = await axios.get(
        ENDPOINTS.LIST_INSTRUCTOR_SCHEDULES(idEmpleado),
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener horarios del instructor:', error);
      if (error.response?.status === 404) {
        throw new Error('Instructor no encontrado');
      }
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener horarios del instructor');
    }
  },

  // Registrar pago de inscripción
  registrarPagoInscripcion: async (pagoData) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      if (!pagoData.inscripcion?.idInscripcion) {
        throw new Error('ID de inscripción es requerido');
      }
      
      if (!pagoData.montoPagado || pagoData.montoPagado <= 0) {
        throw new Error('Monto pagado debe ser mayor a 0');
      }
      
      if (!pagoData.metodoPago) {
        throw new Error('Método de pago es requerido');
      }
      
      console.log('Datos de pago a enviar:', pagoData);
      
      const response = await axios.post(
        ENDPOINTS.REGISTER_INSCRIPTION_PAYMENT,
        pagoData,
        getAuthConfig()
      );
      
      console.log('Respuesta del servidor (pago inscripción):', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al registrar pago de inscripción:', error);
      if (error.response?.status === 400) {
        throw new Error(error.response.data || 'Datos de pago inválidos');
      }
      throw new Error(error.response?.data?.message || error.message || 'Error al registrar el pago');
    }
  },

  // Servicios auxiliares para obtener datos necesarios
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

  obtenerPlanes: async () => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token disponible');
      }
      return await listPlanes(token);
    } catch (error) {
      console.error('Error al obtener planes:', error);
      throw error;
    }
  },

  /**
   * Crea una inscripción completa: inscripción y pago en orden.
   * @param {Object} inscripcionCompleta - { idCliente, idPlan, idInstructor?, fechaInicio, monto, montoPagado, metodoPago }
   */
  crearInscripcionCompleta: async function(inscripcionCompleta) {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      // 1. Registrar la inscripción
      const inscripcionData = {
        idCliente: inscripcionCompleta.idCliente,
        idPlan: inscripcionCompleta.idPlan,
        idInstructor: inscripcionCompleta.idInstructor || null,
        fechaInicio: inscripcionCompleta.fechaInicio,
        monto: inscripcionCompleta.monto
      };
      
      const inscripcion = await this.registrarInscripcion(inscripcionData);
      
      if (!inscripcion || !inscripcion.idInscripcion) {
        throw new Error('No se pudo crear la inscripción');
      }

      // 2. Registrar el pago si se proporciona
      if (inscripcionCompleta.montoPagado && inscripcionCompleta.metodoPago) {
        const pagoData = {
          inscripcion: { idInscripcion: inscripcion.idInscripcion },
          montoPagado: inscripcionCompleta.montoPagado,
          metodoPago: inscripcionCompleta.metodoPago
        };
        
        await this.registrarPagoInscripcion(pagoData);
      }

      return { 
        success: true, 
        idInscripcion: inscripcion.idInscripcion,
        inscripcion: inscripcion
      };
    } catch (error) {
      console.error('Error en crearInscripcionCompleta:', error);
      throw new Error(error.message || 'Error al registrar la inscripción completa');
    }
  },

  // Obtener detalle completo de una inscripción
  obtenerDetalleInscripcion: async (idInscripcion) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      if (!idInscripcion) {
        throw new Error('ID de inscripción es requerido');
      }
      
      const url = ENDPOINTS.GET_INSCRIPTION_DETAIL(idInscripcion);
      console.log('URL de detalle de inscripción:', url);
      console.log('ID de inscripción:', idInscripcion);
      
      const response = await axios.get(url, getAuthConfig());
      
      console.log('Detalle de inscripción', idInscripcion, ':', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalle de inscripción:', error);
      console.error('URL utilizada:', ENDPOINTS.GET_INSCRIPTION_DETAIL(idInscripcion));
      console.error('Status code:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      if (error.response?.status === 404) {
        throw new Error('Inscripción no encontrada');
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permiso para ver el detalle de esta inscripción');
      }
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener el detalle de la inscripción');
    }
  },

  // Listar todas las inscripciones con detalles
  listarTodasLasInscripciones: async () => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      const response = await axios.get(
        ENDPOINTS.LIST_ALL_INSCRIPTIONS,
        getAuthConfig()
      );
      
      console.log('Lista de todas las inscripciones:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al listar inscripciones:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener la lista de inscripciones');
    }
  },

  // Cancelar una inscripción
  cancelarInscripcion: async (idInscripcion) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      if (!idInscripcion) {
        throw new Error('ID de inscripción es requerido');
      }
      
      console.log('Cancelando inscripción:', idInscripcion);
      
      const response = await axios.put(
        ENDPOINTS.CANCEL_INSCRIPTION(idInscripcion),
        {},
        getAuthConfig()
      );
      
      console.log('Inscripción cancelada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al cancelar inscripción:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Inscripción no encontrada');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data || 'La inscripción ya está cancelada o no puede ser cancelada');
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permiso para cancelar inscripciones');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Error al cancelar la inscripción');
    }
  }
};

export default inscripcionAPI;

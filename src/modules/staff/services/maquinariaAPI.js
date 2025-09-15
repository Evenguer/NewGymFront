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

export const maquinariaAPI = {
  listarPiezas: async () => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const response = await axios.get(ENDPOINTS.PIEZA.LISTAR);
      return response.data;
    } catch (error) {
      console.error('Error al listar piezas:', error);
      throw error;
    }
  },
  guardarPieza: async (pieza) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const response = await axios.post(ENDPOINTS.PIEZA.GUARDAR, pieza);
      return response.data;
    } catch (error) {
      console.error('Error al guardar pieza:', error);
      throw error;
    }
  },
  actualizarPieza: async (pieza) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const response = await axios.put(ENDPOINTS.PIEZA.ACTUALIZAR, pieza);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar pieza:', error);
      throw error;
    }
  },
  cambiarEstadoPieza: async (id, estado) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const response = await axios.put(ENDPOINTS.PIEZA.CAMBIAR_ESTADO(id), estado);
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado de la pieza:', error);
      throw error;
    }
  },
  eliminarPieza: async (id) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      await axios.delete(ENDPOINTS.PIEZA.ELIMINAR(id));
      return true;
    } catch (error) {
      console.error('Error al eliminar pieza:', error);
      throw error;
    }
  }
};
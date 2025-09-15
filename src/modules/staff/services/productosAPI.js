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

export const productosAPI = {  listarProductos: async () => {
    try {
      // Verificar que el usuario tenga rol ADMIN o RECEPCIONISTA
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      const response = await axios.get(ENDPOINTS.LIST_PRODUCTS);
      return response.data;
    } catch (error) {
      console.error('Error al listar productos:', error);
      throw error;
    }
  },
  guardarProducto: async (producto) => {
    try {
      // Verificar que el usuario tenga rol ADMIN o RECEPCIONISTA
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      const response = await axios.post(ENDPOINTS.SAVE_PRODUCT, producto);
      return response.data;
    } catch (error) {
      console.error('Error al guardar producto:', error);
      throw error;
    }
  },
  actualizarProducto: async (producto) => {
    try {
      // Verificar que el usuario tenga rol ADMIN o RECEPCIONISTA
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      const response = await axios.put(ENDPOINTS.UPDATE_PRODUCT, producto);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  },
  cambiarEstadoProducto: async (id, estado) => {
    try {
      // Verificar que el usuario tenga rol ADMIN o RECEPCIONISTA
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      const response = await axios.put(ENDPOINTS.TOGGLE_PRODUCT_STATUS(id), estado);
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado del producto:', error);
      throw error;
    }
  },
  eliminarProducto: async (id) => {
    try {
      // Verificar que el usuario tenga rol ADMIN o RECEPCIONISTA
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      await axios.delete(ENDPOINTS.DELETE_PRODUCT(id));
      return true;
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  }
};

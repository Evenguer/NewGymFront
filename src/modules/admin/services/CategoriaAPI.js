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

// El header Content-Type: application/json se configura globalmente en axios

export const categoriaAPI = {
  // Método para listar todas las categorías
  listarCategorias: async () => {
    try {
      // Verificar que el usuario tenga rol ADMIN o RECEPCIONISTA
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      const response = await axios.get(ENDPOINTS.LIST_CATEGORIES);
      return response.data;
    } catch (error) {
      console.error('Error al listar categorías:', error);
      throw error;
    }
  },

  // Método para guardar una nueva categoría
  guardarCategoria: async (categoria) => {
    try {
      // Verificar que el usuario tenga rol ADMIN
      checkRole(['ADMIN']);
      
      const response = await axios.post(ENDPOINTS.SAVE_CATEGORY, categoria);
      return response.data;
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      throw error;
    }
  },

  // Método para actualizar una categoría existente
  actualizarCategoria: async (categoria) => {
    try {
      // Verificar que el usuario tenga rol ADMIN
      checkRole(['ADMIN']);
      
      const response = await axios.put(ENDPOINTS.UPDATE_CATEGORY, categoria);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      throw error;
    }
  },

  // Método para cambiar el estado de una categoría
  cambiarEstadoCategoria: async (idCategoria, estado) => {
    try {
      // Verificar que el usuario tenga rol ADMIN
      checkRole(['ADMIN']);
      
      const response = await axios.put(
        ENDPOINTS.TOGGLE_CATEGORY_STATUS(idCategoria),
        estado
      );
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado de categoría:', error);
      throw error;
    }
  },

  // Método para eliminar una categoría
  eliminarCategoria: async (idCategoria) => {
    try {
      // Verificar que el usuario tenga rol ADMIN
      checkRole(['ADMIN']);
      
      const response = await axios.delete(
        ENDPOINTS.DELETE_CATEGORY(idCategoria)
      );
      return response.data;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  }
};

export default categoriaAPI;
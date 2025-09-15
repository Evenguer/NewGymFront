import axios from 'axios';
import { ENDPOINTS } from '../../../shared/services/endpoints';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    headers: {
      Authorization: `Bearer ${user?.token}`
    }
  };
};

// Productos
export const getProducts = async () => {
  try {
    const response = await axios.get(ENDPOINTS.LIST_PRODUCTS, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al obtener productos');
  }
};

export const saveProduct = async (productData) => {
  try {
    const response = await axios.post(ENDPOINTS.SAVE_PRODUCT, productData, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al guardar producto');
  }
};

export const updateProduct = async (productData) => {
  try {
    const response = await axios.put(ENDPOINTS.UPDATE_PRODUCT, productData, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al actualizar producto');
  }
};

export const toggleProductStatus = async (productId, status) => {
  try {
    const response = await axios.put(
      ENDPOINTS.TOGGLE_PRODUCT_STATUS(productId), 
      status, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al cambiar estado del producto');
  }
};

// Categorías
export const getCategories = async () => {
  try {
    const response = await axios.get(ENDPOINTS.LIST_CATEGORIES, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al obtener categorías');
  }
};

export const saveCategory = async (categoryData) => {
  try {
    const response = await axios.post(ENDPOINTS.SAVE_CATEGORY, categoryData, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al guardar categoría');
  }
};

export const updateCategory = async (categoryData) => {
  try {
    const response = await axios.put(ENDPOINTS.UPDATE_CATEGORY, categoryData, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al actualizar categoría');
  }
};

export const toggleCategoryStatus = async (categoryId, status) => {
  try {
    const response = await axios.put(
      ENDPOINTS.TOGGLE_CATEGORY_STATUS(categoryId), 
      status, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al cambiar estado de la categoría');
  }
};
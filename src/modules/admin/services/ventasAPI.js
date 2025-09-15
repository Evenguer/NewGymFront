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

export const getSales = async () => {
  try {
    const response = await axios.get(ENDPOINTS.LIST_SALES, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al obtener ventas');
  }
};

export const saveSale = async (saleData) => {
  try {
    const response = await axios.post(ENDPOINTS.SAVE_SALE, saleData, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al guardar venta');
  }
};

export const toggleSaleStatus = async (saleId, status) => {
  try {
    const response = await axios.put(
      `${ENDPOINTS.TOGGLE_SALE_STATUS(saleId)}?estado=${status}`, 
      {}, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al cambiar estado de la venta');
  }
};

export const addSaleDetails = async (detailsData) => {
  try {
    const response = await axios.post(ENDPOINTS.ADD_SALE_DETAILS, detailsData, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al agregar detalles de venta');
  }
};

export const getSaleDetails = async (saleId) => {
  try {
    const response = await axios.get(ENDPOINTS.LIST_SALE_DETAILS(saleId), getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al obtener detalles de venta');
  }
};

export const deleteSaleDetail = async (detailId) => {
  try {
    const response = await axios.delete(ENDPOINTS.DELETE_SALE_DETAIL(detailId), getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al eliminar detalle de venta');
  }
};

export const registerPayment = async (paymentData) => {
  try {
    const response = await axios.post(ENDPOINTS.REGISTER_PAYMENT, paymentData, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al registrar pago');
  }
};
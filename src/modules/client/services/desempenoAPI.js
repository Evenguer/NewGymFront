import axios from 'axios';
import { ENDPOINTS } from '../../../shared/services/endpoints';

export const getDesempenoActual = async (idCliente) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay token de autenticación');
  try {
    const response = await axios.get(ENDPOINTS.GET_CLIENT_DESEMPENO(idCliente), {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Error al obtener el desempeño actual';
  }
};

export const getHistorialDesempeno = async (idCliente) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay token de autenticación');
  try {
    const response = await axios.get(ENDPOINTS.GET_CLIENT_DESEMPENO_HISTORY(idCliente), {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Error al obtener el historial de desempeño';
  }
};

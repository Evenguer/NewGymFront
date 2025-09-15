import axios from 'axios';
import { ENDPOINTS } from '../../../shared/services/endpoints';

export const getClientProfile = async (token) => {
  if (!token) throw new Error('No hay token de autenticación');
  try {
    const response = await axios.get(ENDPOINTS.CLIENT_PROFILE, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al obtener el perfil';
  }
};

export const updateClientPassword = async (data, token) => {
  if (!token) throw new Error('No hay token de autenticación');
  try {
    const response = await axios.post(ENDPOINTS.CLIENT_CHANGE_PASSWORD, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al cambiar la contraseña';
  }
};

export const getInscribedPlans = async (idCliente) => {
  const token = localStorage.getItem('token');
  const res = await axios.get(ENDPOINTS.GET_CLIENT_PLANS(idCliente), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Nuevo: Obtener historial de planes (cancelados y finalizados)
export const getHistorialPlanes = async (idCliente) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay token de autenticación');
  try {
    const response = await axios.get(ENDPOINTS.GET_CLIENT_PLANS_HISTORY(idCliente), {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al obtener el historial de planes';
  }
};
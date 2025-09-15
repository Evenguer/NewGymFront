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

export const registerClient = async (clientData, userId) => {
  try {
    const response = await axios.post(
      `${ENDPOINTS.REGISTER_CLIENT}?usuarioId=${userId}`, 
      clientData, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al registrar cliente');
  }
};

export const registerEmployee = async (employeeData, userId) => {
  try {
    const response = await axios.post(
      `${ENDPOINTS.REGISTER_EMPLOYEE}?usuarioId=${userId}`, 
      employeeData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al registrar empleado');
  }
};

export const getClients = async () => {
  try {
    const response = await axios.get(ENDPOINTS.LIST_CLIENTS, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al obtener clientes');
  }
};

export const getEmployees = async () => {
  try {
    const response = await axios.get(ENDPOINTS.LIST_EMPLOYEES, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al obtener empleados');
  }
};
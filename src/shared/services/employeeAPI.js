import axios from 'axios';
import { ENDPOINTS } from './endpoints';

// Función para actualizar un empleado
export const updateEmployee = async (employeeId, employeeData, token) => {
  try {
    const response = await axios.put(
      ENDPOINTS.UPDATE_EMPLOYEE(employeeId),
      employeeData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      throw new Error('No tienes permisos para realizar esta acción. Contacta al administrador.');
    }
    throw error.response?.data?.message || 'Error al actualizar el empleado';
  }
};

// Función para obtener un empleado por ID
export const getEmployeeById = async (employeeId, token) => {
  try {
    const response = await axios.get(
      ENDPOINTS.GET_EMPLOYEE(employeeId),
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al obtener el empleado';
  }
};

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

// Horarios
export const getSchedules = async () => {
  try {
    const response = await axios.get(ENDPOINTS.LIST_SCHEDULES, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al obtener horarios');
  }
};

export const addSchedule = async (employeeId, scheduleData) => {
  try {
    const response = await axios.post(
      ENDPOINTS.ADD_SCHEDULE(employeeId), 
      scheduleData, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al agregar horario');
  }
};

// Planes
export const getPlans = async () => {
  try {
    const response = await axios.get(ENDPOINTS.LIST_PLANS, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al obtener planes');
  }
};

export const savePlan = async (planData) => {
  try {
    const response = await axios.post(ENDPOINTS.SAVE_PLAN, planData, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error al guardar plan');
  }
};
import axios from 'axios';
import { ENDPOINTS } from '../../../shared/services/endpoints';

export const getPremiumPlansWithClients = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay token de autenticación');
  const response = await axios.get(ENDPOINTS.TRAINER_PREMIUM_PLANS_CLIENTS, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getStandardPlansWithClients = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay token de autenticación');
  const response = await axios.get(ENDPOINTS.TRAINER_STANDARD_PLANS_CLIENTS, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

import axios from 'axios';
import { ENDPOINTS } from '../../../shared/services/endpoints';

// Registrar desempeño de un cliente (entrenador)
export const registrarDesempeno = async (payload) => {
  const { idCliente, ...rest } = payload;
  const response = await axios.post(ENDPOINTS.TRAINER_REGISTER_DESEMPENO, {
    idCliente,
    ...rest
  });
  return response.data;
};

// Actualizar desempeño de un cliente (entrenador)
export const actualizarDesempeno = async (idDesempeno, payload) => {
  const response = await axios.put(ENDPOINTS.TRAINER_UPDATE_DESEMPENO(idDesempeno), payload);
  return response.data;
};

// Eliminar desempeño de un cliente (entrenador)
export const eliminarDesempeno = async (idDesempeno) => {
  const response = await axios.delete(ENDPOINTS.TRAINER_DELETE_DESEMPENO(idDesempeno));
  return response.data;
};

// Obtener desempeño de un cliente (entrenador)
export const obtenerDesempenoCliente = async (idCliente) => {
  const response = await axios.get(ENDPOINTS.TRAINER_GET_CLIENT_DESEMPENO(idCliente));
  return response.data;
};

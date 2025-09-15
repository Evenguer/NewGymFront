

import axios from 'axios';
import { ENDPOINTS } from '../../../../shared/services/endpoints';

/**
 * Obtiene el estado de alquileres del mes actual
 * @returns {Promise<Array>} Lista de estados de alquileres
 */
export const getEstadoAlquileresMesActual = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(ENDPOINTS.REPORTES_ALQUILERES.ESTADOS_MES_ACTUAL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener estado de alquileres mes actual:', error);
    throw error;
  }
};

/**
 * Obtiene el estado de alquileres del trimestre actual
 * @returns {Promise<Array>} Lista de estados de alquileres
 */
export const getEstadoAlquileresTrimestreActual = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(ENDPOINTS.REPORTES_ALQUILERES.ESTADOS_TRIMESTRE_ACTUAL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener estado de alquileres trimestre actual:', error);
    throw error;
  }
};

/**
 * Obtiene el estado de alquileres del año actual
 * @returns {Promise<Array>} Lista de estados de alquileres
 */
export const getEstadoAlquileresAnioActual = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(ENDPOINTS.REPORTES_ALQUILERES.ESTADOS_ANIO_ACTUAL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener estado de alquileres año actual:', error);
    throw error;
  }
};

/**
 * Obtiene el top 10 de piezas más alquiladas del mes actual
 * @returns {Promise<Array>} Lista de piezas
 */
export const getTop10PiezasMasAlquiladasMesActual = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(ENDPOINTS.REPORTES_ALQUILERES.TOP10_PIEZAS_MES_ACTUAL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener top 10 piezas mes actual:', error);
    throw error;
  }
};

/**
 * Obtiene el top 10 de piezas más alquiladas del trimestre actual
 * @returns {Promise<Array>} Lista de piezas
 */
export const getTop10PiezasMasAlquiladasTrimestreActual = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(ENDPOINTS.REPORTES_ALQUILERES.TOP10_PIEZAS_TRIMESTRE_ACTUAL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener top 10 piezas trimestre actual:', error);
    throw error;
  }
};

/**
 * Obtiene el top 10 de piezas más alquiladas del año actual
 * @returns {Promise<Array>} Lista de piezas
 */
export const getTop10PiezasMasAlquiladasAnioActual = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(ENDPOINTS.REPORTES_ALQUILERES.TOP10_PIEZAS_ANIO_ACTUAL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener top 10 piezas año actual:', error);
    throw error;
  }
};

/**
 * Obtiene la lista de alquileres con pagos pendientes o mora
 * @returns {Promise<Array>} Lista de alquileres con mora
 */
export const getAlquileresConPagosPendientesOMora = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(ENDPOINTS.REPORTES_ALQUILERES.PENDIENTES_MORA, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener alquileres con mora:', error);
    throw error;
  }
};

/**
 * Obtiene los ingresos por alquileres del mes actual
 * @returns {Promise<Number>} Ingresos del mes actual
 */
export const getIngresosMesActual = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(ENDPOINTS.REPORTES_ALQUILERES.INGRESOS_MES_ACTUAL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener ingresos mes actual:', error);
    throw error;
  }
};

/**
 * Obtiene los ingresos por alquileres del trimestre actual
 * @returns {Promise<Number>} Ingresos del trimestre actual
 */
export const getIngresosTrimestreActual = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(ENDPOINTS.REPORTES_ALQUILERES.INGRESOS_TRIMESTRE_ACTUAL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener ingresos trimestre actual:', error);
    throw error;
  }
};

/**
 * Obtiene los ingresos por alquileres del año actual
 * @returns {Promise<Number>} Ingresos del año actual
 */
export const getIngresosAnioActual = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(ENDPOINTS.REPORTES_ALQUILERES.INGRESOS_ANIO_ACTUAL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener ingresos año actual:', error);
    throw error;
  }
};

/**
 * Obtiene la tendencia de alquileres de los últimos N meses
 * @param {number} meses - Cantidad de meses a consultar (por defecto 6)
 * @returns {Promise<Array>} Lista de tendencias
 */
export const getTendenciaAlquileresUltimosMeses = async (meses = 6) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(ENDPOINTS.REPORTES_ALQUILERES.TENDENCIA(meses), {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener tendencia de alquileres:', error);
    throw error;
  }
};

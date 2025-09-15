import axios from 'axios';
import { ENDPOINTS } from './endpoints';

export const listEspecialidades = async (token) => {
    try {
        const response = await axios.get(ENDPOINTS.LIST_SPECIALTIES, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error.response?.data?.message || 'Error al obtener las especialidades';
    }
};

export const crearEspecialidad = async (especialidadData, token) => {
    try {
        const response = await axios.post(ENDPOINTS.SAVE_SPECIALTY, especialidadData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error.response?.data?.message || 'Error al crear la especialidad';
    }
};

export const actualizarEspecialidad = async (especialidadData, token) => {
    try {
        const response = await axios.put(ENDPOINTS.UPDATE_SPECIALTY, especialidadData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error.response?.data?.message || 'Error al actualizar la especialidad';
    }
};

export const cambiarEstadoEspecialidad = async (id, estado, token) => {
    try {
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const response = await axios({
            method: 'PUT',
            url: ENDPOINTS.TOGGLE_SPECIALTY_STATUS(id),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params: { estado }  // Enviar estado como query parameter
        });

        return response.data;
    } catch (error) {
        console.error('Error detallado:', {
            status: error.response?.status,
            data: error.response?.data,
            config: error.config
        });
        
        if (error.response?.status === 403) {
            throw new Error('No tienes permisos para cambiar el estado de la especialidad');
        }
        
        throw error.response?.data?.message || 
              error.message || 
              'Error al cambiar el estado de la especialidad';
    }
};

export const eliminarEspecialidad = async (id, token) => {
    try {
        const response = await axios.delete(ENDPOINTS.DELETE_SPECIALTY(id), {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error.response?.data?.message || error.response?.data || 'Error al eliminar la especialidad';
    }
};

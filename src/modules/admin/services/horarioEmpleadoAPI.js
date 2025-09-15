import axios from 'axios';
import { ENDPOINTS } from '../../../shared/services/endpoints';

function checkRole(requiredRoles) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        throw new Error('No hay usuario autenticado');
    }
    if (!requiredRoles.includes(user.role)) {
        throw new Error('No tienes permisos para realizar esta acción');
    }
}

function formatHorario(horario) {
    return {
        dia: horario.dia || '',
        horaInicio: horario.horaInicio || '',
        horaFin: horario.horaFin || '',
        turno: horario.turno || '',
        estado: typeof horario.estado === 'boolean' ? horario.estado : true
    };
}

export const horarioEmpleadoAPI = {
    listarHorarios: async function () {
        try {
            // Obtener el token
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // Configurar headers
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            console.log('Obteniendo lista de horarios...');
            const response = await axios.get(ENDPOINTS.LIST_SCHEDULES, config);

            return response.data.map(horario => ({
                idHorarioEmpleado: horario.idHorarioEmpleado,
                empleado: {
                    nombre: horario.nombre || '',
                    apellidos: horario.apellidos || '',
                    rol: horario.rol || 'EMPLEADO'
                },
                dia: horario.dia || '',
                horaInicio: horario.horaInicio || '',
                horaFin: horario.horaFin || '',
                turno: horario.turno || '',
                estado: horario.estado
            }));
        } catch (error) {
            console.error('Error al listar horarios:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw new Error(error.response?.data?.message || 'Error al obtener los horarios');
        }
    },

    agregarHorario: async function (empleadoId, horario) {
        try {
            checkRole(['ADMIN']);
            
            // Obtener el token
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            if (!empleadoId) {
                throw new Error('Se requiere ID del empleado');
            }

            const horarioFormateado = formatHorario(horario);
            console.log('Agregando horario:', { empleadoId, horario: horarioFormateado });

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            const response = await axios.post(
                ENDPOINTS.ADD_SCHEDULE(empleadoId),
                horarioFormateado,
                config
            );

            return response.data;
        } catch (error) {
            console.error('Error al agregar horario:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw new Error(error.response?.data?.message || 'Error al agregar el horario');
        }
    },

    actualizarHorario: async function (id, horario) {
        try {
            checkRole(['ADMIN']);
            
            // Obtener el token
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            if (!id) {
                throw new Error('Se requiere ID del horario');
            }

            const horarioFormateado = formatHorario(horario);
            console.log('Actualizando horario:', { id, horario: horarioFormateado });

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            const response = await axios.put(
                ENDPOINTS.UPDATE_SCHEDULE(id),
                horarioFormateado,
                config
            );

            return response.data;
        } catch (error) {
            console.error('Error al actualizar horario:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw new Error(error.response?.data?.message || 'Error al actualizar el horario');
        }
    },

    eliminarHorario: async function (id) {
        try {
            checkRole(['ADMIN']);
            
            // Obtener el token
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            if (!id) {
                throw new Error('Se requiere ID del horario');
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            const response = await axios.delete(ENDPOINTS.DELETE_SCHEDULE(id), config);
            return response.status === 200;
        } catch (error) {
            console.error('Error al eliminar horario:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw new Error(error.response?.data?.message || 'Error al eliminar el horario');
        }
    },

    cambiarEstadoHorario: async function (id, estado) {
        try {
            checkRole(['ADMIN']);
            
            // Obtener el token
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            if (!id) {
                throw new Error('Se requiere ID del horario');
            }

            const nuevoEstado = typeof estado === 'boolean' ? estado : false;
            console.log('Cambiando estado de horario:', { id, nuevoEstado });

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            const response = await axios.put(
                ENDPOINTS.TOGGLE_SCHEDULE_STATUS(id),
                nuevoEstado,
                config
            );

            return response.data;
        } catch (error) {
            console.error('Error al cambiar estado del horario:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw new Error(error.response?.data?.message || 'Error al cambiar el estado del horario');
        }
    }
};

export default horarioEmpleadoAPI;

import axios from 'axios';
import { ENDPOINTS } from '../../../shared/services/endpoints';

class AsistenciaEmpleadoAPI {
    async marcarAsistencia(idEmpleado) {
        try {
            // Obtener el token
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            console.log('Marcando asistencia para empleado:', idEmpleado);
            const response = await axios.post(
                `${ENDPOINTS.MARK_ATTENDANCE}?idEmpleado=${idEmpleado}`,
                null,
                config
            );

            return {
                success: true,
                message: response.data,
                data: response.data
            };
        } catch (error) {
            console.error('Error en marcarAsistencia:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            return {
                success: false,
                message: error.response?.data || error.message,
                error: error
            };
        }
    }

    async obtenerHorariosPorEmpleadoYDia(idEmpleado, dia) {
        try {
            // Obtener el token
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            if (!idEmpleado || !dia) {
                throw new Error('Se requiere ID del empleado y día');
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            console.log('Consultando horarios:', { idEmpleado, dia });
            const response = await axios.get(
                ENDPOINTS.LIST_SCHEDULES_BY_EMPLOYEE_AND_DAY(idEmpleado, dia),
                config
            );

            console.log('Horarios obtenidos:', response.data);
            return {
                success: true,
                message: 'Horarios obtenidos correctamente',
                data: response.data
            };
        } catch (error) {
            console.error('Error al obtener horarios:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener los horarios',
                error: error
            };
        }
    }

    async listarAsistencias() {
        try {
            // Obtener el token
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            console.log('Listando asistencias...');
            const response = await axios.get(ENDPOINTS.LIST_ATTENDANCE, config);

            return {
                success: true,
                message: 'Asistencias obtenidas exitosamente',
                data: response.data
            };
        } catch (error) {
            console.error('Error en listarAsistencias:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            return {
                success: false,
                message: error.response?.data || error.message,
                error: error
            };
        }
    }    // Funciones auxiliares para el manejo de estados de puntualidad
    getEstadoPuntualidad(estado) {
        const estados = {
            'PUNTUAL': {
                label: 'Puntual',
                color: 'green',
                icon: 'check-circle'
            },
            'TARDANZA': {
                label: 'Tardanza',
                color: 'yellow',
                icon: 'warning'
            },
            'TARDANZA_GRAVE': {
                label: 'Tardanza Grave',
                color: 'red',
                icon: 'error'
            },
            'FALTO': {
                label: 'No Asistió',
                color: 'slate',
                icon: 'x-circle'
            }
        };
        return estados[estado] || { label: estado, color: 'tfft', icon: 'question' };
    }

    // Función para normalizar el día (similar a la del backend)
    normalizarDia(dia) {
        return dia.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase();
    }

    // Función para formatear la hora para mostrar en la UI
    formatearHora(hora) {
        return new Date(`2000-01-01T${hora}`).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Exportamos una instancia única del servicio
export const asistenciaEmpleadoAPI = new AsistenciaEmpleadoAPI();

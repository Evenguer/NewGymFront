import { ENDPOINTS } from '../../../shared/services/endpoints';

class DashboardRecepcionistaAPI {
  
  /**
   * Obtener datos del dashboard de recepcionista
   * Incluye ganancias diarias, clientes activos, últimas inscripciones, ventas y asistencias del día actual
   * @returns {Promise<Object>} Datos del dashboard filtrados por el día actual
   */
  async obtenerDatosDashboard() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      console.log('Obteniendo datos del dashboard de recepcionista...');
      
      const response = await fetch(ENDPOINTS.DASHBOARD_RECEPCIONISTA, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Verifique sus credenciales.');
        }
        if (response.status === 403) {
          throw new Error('No tiene permisos para acceder a esta información.');
        }
        if (response.status === 404) {
          throw new Error('Endpoint no encontrado.');
        }
        throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('Datos del dashboard obtenidos exitosamente:', data);
      
      // Validar estructura de datos esperada
      if (!data || typeof data !== 'object') {
        throw new Error('Formato de respuesta inválido');
      }

      // Asegurar que los campos numéricos tengan valores por defecto
      const dashboardData = {
        gananciaDiariaVentasProductos: data.gananciaDiariaVentasProductos || 0,
        gananciaDiariaAlquileres: data.gananciaDiariaAlquileres || 0,
        gananciaDiariaInscripciones: data.gananciaDiariaInscripciones || 0,
        clientesActivos: data.clientesActivos || 0,
        ultimasInscripciones: Array.isArray(data.ultimasInscripciones) ? data.ultimasInscripciones : [],
        ultimasVentas: Array.isArray(data.ultimasVentas) ? data.ultimasVentas : [],
        clientesAsistieronHoy: Array.isArray(data.clientesAsistieronHoy) ? data.clientesAsistieronHoy : []
      };

      console.log('Datos del dashboard procesados:', dashboardData);
      return dashboardData;

    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      
      // Devolver estructura por defecto en caso de error
      const defaultDashboard = {
        gananciaDiariaVentasProductos: 0,
        gananciaDiariaAlquileres: 0,
        gananciaDiariaInscripciones: 0,
        clientesActivos: 0,
        ultimasInscripciones: [],
        ultimasVentas: [],
        clientesAsistieronHoy: []
      };

      throw error;
    }
  }

  /**
   * Obtener resumen de ganancias del día actual
   * @returns {Promise<Object>} Resumen de ganancias por tipo
   */
  async obtenerResumenGanancias() {
    try {
      const datos = await this.obtenerDatosDashboard();
      
      const totalGanancias = parseFloat(datos.gananciaDiariaVentasProductos || 0) + 
                           parseFloat(datos.gananciaDiariaAlquileres || 0) + 
                           parseFloat(datos.gananciaDiariaInscripciones || 0);

      return {
        ventasProductos: parseFloat(datos.gananciaDiariaVentasProductos || 0),
        alquileres: parseFloat(datos.gananciaDiariaAlquileres || 0),
        inscripciones: parseFloat(datos.gananciaDiariaInscripciones || 0),
        total: totalGanancias
      };
      
    } catch (error) {
      console.error('Error al obtener resumen de ganancias:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de actividad del día
   * @returns {Promise<Object>} Estadísticas de actividad
   */
  async obtenerEstadisticasActividad() {
    try {
      const datos = await this.obtenerDatosDashboard();
      
      return {
        clientesActivos: datos.clientesActivos || 0,
        clientesAsistieronHoy: datos.clientesAsistieronHoy?.length || 0,
        ventasRealizadas: datos.ultimasVentas?.length || 0,
        inscripcionesRecientes: datos.ultimasInscripciones?.length || 0
      };
      
    } catch (error) {
      console.error('Error al obtener estadísticas de actividad:', error);
      throw error;
    }
  }

  /**
   * Verificar si hay actividad reciente (útil para notificaciones o alertas)
   * @returns {Promise<Boolean>} True si hay actividad reciente
   */
  async verificarActividadReciente() {
    try {
      const datos = await this.obtenerDatosDashboard();
      
      // Considerar que hay actividad reciente si:
      // - Hay clientes que asistieron hoy
      // - Hay ventas del día
      // - Hay alquileres con ganancia del día
      const hayActividad = (datos.clientesAsistieronHoy?.length > 0) ||
                          (datos.gananciaDiariaVentasProductos > 0) ||
                          (datos.gananciaDiariaAlquileres > 0);
      
      return hayActividad;
      
    } catch (error) {
      console.error('Error al verificar actividad reciente:', error);
      return false;
    }
  }
}

// Crear una instancia única para exportar
export const dashboardRecepcionistaAPI = new DashboardRecepcionistaAPI();
export default dashboardRecepcionistaAPI;

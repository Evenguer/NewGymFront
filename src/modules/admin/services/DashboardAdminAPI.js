
import { ENDPOINTS } from '../../../shared/services/endpoints';

class DashboardAdminAPI {
  /**
   * Obtener datos del dashboard de administrador
   * Incluye estadísticas generales como empleados, clientes, ventas, etc.
   * @returns {Promise<Object>} Datos del dashboard de administrador
   */
  async obtenerDatosDashboard() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      const response = await fetch(ENDPOINTS.DASHBOARD_ADMIN, {
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
      // Validar estructura de datos esperada
      if (!data || typeof data !== 'object') {
        throw new Error('Formato de respuesta inválido');
      }
      // Asegurar que los campos numéricos tengan valores por defecto
      return {
        empleados: data.empleados || 0,
        clientes: data.clientes || 0,
        ventasHoy: data.ventasHoy || 0,
        ventasTotales: data.ventasTotales || 0,
        productosAgotados: data.productosAgotados || 0,
        nuevasInscripciones: data.nuevasInscripciones || 0
      };
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      throw error;
    }
  }
  /**
   * Obtener piezas con bajo stock y resumen de inventario
   * @returns {Promise<Object>} Piezas bajo stock y resumen de inventario
   */
  async obtenerPiezasBajoStock() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      const response = await fetch(ENDPOINTS.DASHBOARD_ADMIN_PIEZAS_BAJO_STOCK, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`Error al obtener piezas bajo stock: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener piezas bajo stock:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de ventas para gráficos
   * @returns {Promise<Object>} Estadísticas de ventas
   */
  async obtenerEstadisticasVentas() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(ENDPOINTS.DASHBOARD_ADMIN_ESTADISTICAS_VENTAS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener estadísticas de ventas: ${response.status}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error al obtener estadísticas de ventas:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de clientes para gráficos
   * @returns {Promise<Object>} Estadísticas de clientes
   */
  async obtenerEstadisticasClientes() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(ENDPOINTS.DASHBOARD_ADMIN_ESTADISTICAS_CLIENTES, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener estadísticas de clientes: ${response.status}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error al obtener estadísticas de clientes:', error);
      throw error;
    }
  }

  /**
   * Obtener productos con bajo stock
   * @returns {Promise<Object>} Productos con bajo stock
   */
  async obtenerProductosBajoStock() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(ENDPOINTS.DASHBOARD_ADMIN_PRODUCTOS_BAJO_STOCK, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener productos bajo stock: ${response.status}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error al obtener productos bajo stock:', error);
      throw error;
    }
  }

  /**
   * Obtener actividades recientes
   * @returns {Promise<Object>} Actividades recientes
   */
  async obtenerActividadesRecientes() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(ENDPOINTS.DASHBOARD_ADMIN_ACTIVIDADES_RECIENTES, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener actividades recientes: ${response.status}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error al obtener actividades recientes:', error);
      throw error;
    }
  }

  /**
   * Obtener horarios de empleados para hoy
   * @returns {Promise<Object>} Horarios de empleados hoy
   */
  async obtenerHorariosHoy() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(ENDPOINTS.DASHBOARD_ADMIN_HORARIOS_HOY, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener horarios de hoy: ${response.status}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error al obtener horarios de hoy:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de ventas con período específico
   * @param {string} periodo - 'mensual', 'trimestral' o 'anual'
   * @returns {Promise<Object>} Estadísticas de ventas
   */
  async obtenerEstadisticasVentasConPeriodo(periodo = 'mensual') {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${ENDPOINTS.DASHBOARD_ADMIN_ESTADISTICAS_VENTAS}?periodo=${periodo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener estadísticas de ventas: ${response.status}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error al obtener estadísticas de ventas con período:', error);
      throw error;
    }
  }
}

// Exportar una instancia única (singleton)
const dashboardAdminAPI = new DashboardAdminAPI();
export default dashboardAdminAPI;

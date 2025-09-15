// src/shared/services/reporteVentasAPI.js
import { BASE_URL } from './endpoints';

class ReporteVentasAPI {
  
  /**
   * Obtener ingresos totales por período
   * @param {string} periodo - 'semanal', 'mensual', 'trimestral', 'semestral', 'anual'
   * @returns {Promise<Object>} Datos de ingresos totales
   */
  async obtenerIngresosTotales(periodo = 'mensual') {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      console.log(`Obteniendo ingresos totales para período: ${periodo}...`);
      
      const response = await fetch(`${BASE_URL}/reportes-ventas/ingresos-totales?periodo=${periodo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Ingresos totales obtenidos exitosamente:', data);
      return data;
      
    } catch (error) {
      console.error('Error al obtener ingresos totales:', error);
      throw error;
    }
  }

  /**
   * Obtener datos de crecimiento vs período anterior
   * @param {string} periodo - 'semanal', 'mensual', 'trimestral', 'semestral', 'anual'
   * @returns {Promise<Object>} Datos de crecimiento
   */
  async obtenerCrecimiento(periodo = 'mensual') {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      console.log(`Obteniendo datos de crecimiento para período: ${periodo}...`);
      
      const response = await fetch(`${BASE_URL}/reportes-ventas/crecimiento?periodo=${periodo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Datos de crecimiento obtenidos exitosamente:', data);
      return data;
      
    } catch (error) {
      console.error('Error al obtener datos de crecimiento:', error);
      throw error;
    }
  }

  /**
   * Obtener total de transacciones
   * @param {string} periodo - 'semanal', 'mensual', 'trimestral', 'semestral', 'anual'
   * @returns {Promise<Object>} Datos de transacciones
   */
  async obtenerTotalTransacciones(periodo = 'mensual') {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      console.log(`Obteniendo total de transacciones para período: ${periodo}...`);
      
      const response = await fetch(`${BASE_URL}/reportes-ventas/total-transacciones?periodo=${periodo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Total de transacciones obtenido exitosamente:', data);
      return data;
      
    } catch (error) {
      console.error('Error al obtener total de transacciones:', error);
      throw error;
    }
  }

  /**
   * Obtener análisis por categoría
   * @param {string} periodo - 'semanal', 'mensual', 'trimestral', 'semestral', 'anual'
   * @returns {Promise<Object>} Análisis por categoría
   */
  async obtenerAnalisisCategoria(periodo = 'mensual') {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      console.log(`Obteniendo análisis por categoría para período: ${periodo}...`);
      
      const response = await fetch(`${BASE_URL}/reportes-ventas/analisis-categoria?periodo=${periodo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Análisis por categoría obtenido exitosamente:', data);
      return data;
      
    } catch (error) {
      console.error('Error al obtener análisis por categoría:', error);
      throw error;
    }
  }

  /**
   * Obtener productos más vendidos
   * @param {string} periodo - 'semanal', 'mensual', 'trimestral', 'semestral', 'anual'
   * @returns {Promise<Object>} Productos más vendidos
   */
  async obtenerProductosMasVendidos(periodo = 'mensual') {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      console.log(`Obteniendo productos más vendidos para período: ${periodo}...`);
      
      const response = await fetch(`${BASE_URL}/reportes-ventas/productos-mas-vendidos?periodo=${periodo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Productos más vendidos obtenidos exitosamente:', data);
      return data;
      
    } catch (error) {
      console.error('Error al obtener productos más vendidos:', error);
      throw error;
    }
  }

  /**
   * Obtener tendencias de ventas
   * @param {string} periodo - 'semanal', 'mensual', 'trimestral', 'semestral', 'anual'
   * @returns {Promise<Object>} Tendencias de ventas
   */
  async obtenerTendencias(periodo = 'mensual') {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      console.log(`Obteniendo tendencias para período: ${periodo}...`);
      
      const response = await fetch(`${BASE_URL}/reportes-ventas/tendencias?periodo=${periodo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Tendencias obtenidas exitosamente:', data);
      return data;
      
    } catch (error) {
      console.error('Error al obtener tendencias:', error);
      throw error;
    }
  }

  /**
   * Obtener análisis de rentabilidad
   * @param {string} periodo - 'semanal', 'mensual', 'trimestral', 'semestral', 'anual'
   * @returns {Promise<Object>} Análisis de rentabilidad
   */
  async obtenerRentabilidad(periodo = 'mensual') {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      console.log(`Obteniendo análisis de rentabilidad para período: ${periodo}...`);
      
      const response = await fetch(`${BASE_URL}/reportes-ventas/rentabilidad?periodo=${periodo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Análisis de rentabilidad obtenido exitosamente:', data);
      return data;
      
    } catch (error) {
      console.error('Error al obtener análisis de rentabilidad:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los datos del reporte de ventas y finanzas
   * @param {string} periodo - 'semanal', 'mensual', 'trimestral', 'semestral', 'anual'
   * @returns {Promise<Object>} Todos los datos consolidados del reporte
   */
  async obtenerDatosCompletos(periodo = 'mensual') {
    try {
      console.log(`Obteniendo datos completos del reporte para período: ${periodo}...`);
      
      // Ejecutar las consultas con manejo individual de errores
      const resultados = await Promise.allSettled([
        this.obtenerIngresosTotales(periodo),
        this.obtenerCrecimiento(periodo),
        this.obtenerTotalTransacciones(periodo),
        this.obtenerAnalisisCategoria(periodo),
        this.obtenerProductosMasVendidos(periodo),
        this.obtenerTendencias(periodo),
        this.obtenerRentabilidad(periodo)
      ]);

      // Extraer los datos exitosos y manejar errores
      const [
        ingresosTotalesResult,
        crecimientoResult,
        totalTransaccionesResult,
        analisisCategoriaResult,
        productosMasVendidosResult,
        tendenciasResult,
        rentabilidadResult
      ] = resultados;

      const datosCompletos = {
        periodo,
        ingresosTotales: ingresosTotalesResult.status === 'fulfilled' ? ingresosTotalesResult.value : { ingresosTotales: 0, ingresosEsteMes: 0 },
        crecimiento: crecimientoResult.status === 'fulfilled' ? crecimientoResult.value : { porcentajeCrecimiento: 0, tendencia: 'neutral' },
        totalTransacciones: totalTransaccionesResult.status === 'fulfilled' ? totalTransaccionesResult.value : { totalTransacciones: 0, ticketPromedio: 0 },
        analisisCategoria: analisisCategoriaResult.status === 'fulfilled' ? analisisCategoriaResult.value : { ventasPorCategoria: [] },
        productosMasVendidos: productosMasVendidosResult.status === 'fulfilled' ? productosMasVendidosResult.value : { top10Productos: [] },
        tendencias: tendenciasResult.status === 'fulfilled' ? tendenciasResult.value : { evolucionVentas: [], prediccion: { prediccionProximoMes: 0 } },
        rentabilidad: rentabilidadResult.status === 'fulfilled' ? rentabilidadResult.value : { rentabilidadProductos: [], resumenRentabilidad: { margenBruto: 0, utilidadBruta: 0 } },
        fechaActualizacion: new Date().toISOString()
      };

      // Log de errores si los hay
      resultados.forEach((resultado, index) => {
        if (resultado.status === 'rejected') {
          const endpoints = ['ingresos-totales', 'crecimiento', 'total-transacciones', 'analisis-categoria', 'productos-mas-vendidos', 'tendencias', 'rentabilidad'];
          console.warn(`Error en endpoint ${endpoints[index]}:`, resultado.reason);
        }
      });

      console.log('Datos completos del reporte obtenidos (con manejo de errores):', datosCompletos);
      return datosCompletos;
      
    } catch (error) {
      console.error('Error al obtener datos completos del reporte:', error);
      
      // Devolver datos por defecto en caso de fallo completo
      return {
        periodo,
        ingresosTotales: { ingresosTotales: 0, ingresosEsteMes: 0 },
        crecimiento: { porcentajeCrecimiento: 0, tendencia: 'neutral' },
        totalTransacciones: { totalTransacciones: 0, ticketPromedio: 0 },
        analisisCategoria: { ventasPorCategoria: [] },
        productosMasVendidos: { top10Productos: [] },
        tendencias: { evolucionVentas: [], prediccion: { prediccionProximoMes: 0 } },
        rentabilidad: { rentabilidadProductos: [], resumenRentabilidad: { margenBruto: 0, utilidadBruta: 0 } },
        fechaActualizacion: new Date().toISOString()
      };
    }
  }
}

// Exportar una instancia única (singleton)
const reporteVentasAPI = new ReporteVentasAPI();
export default reporteVentasAPI;

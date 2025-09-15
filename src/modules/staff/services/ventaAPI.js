import axios from 'axios';
import { ENDPOINTS } from '../../../shared/services/endpoints';
import { listEmployees, listClients } from '../../../shared/services/authAPI';

// Función de utilidad para verificar roles
const checkRole = (requiredRoles) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    throw new Error('No hay usuario autenticado');
  }
  
  const userRole = user.role;
  if (!requiredRoles.includes(userRole)) {
    throw new Error('No tienes permisos para realizar esta acción');
  }
};

// Función auxiliar para obtener el token
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token disponible');
  }
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const ventasAPI = {
  cancelarVenta: async (id) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const response = await axios.put(
        ENDPOINTS.VENTAS.CANCELAR(id),
        null,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error al cancelar venta:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al cancelar la venta');
    }
  },
  listarVentas: async () => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const config = getAuthConfig();
      const response = await axios.get(ENDPOINTS.VENTAS.LISTAR, config);
      console.log('Respuesta del servidor (ventas):', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al listar ventas:', error);
      throw error;
    }
  },

  // Servicios para obtener empleados y clientes
  obtenerEmpleados: async () => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token disponible');
      }
      return await listEmployees(token);
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      throw error;
    }
  },

  obtenerClientes: async () => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token disponible');
      }
      return await listClients(token);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  },


  guardarVenta: async (venta) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      // Intentar con formato cliente/empleado como objeto
      let body = {};
      if (venta.clienteId && venta.empleadoId) {
        body = {
          cliente: { idCliente: venta.clienteId },
          empleado: { idEmpleado: venta.empleadoId }
        };
      } else {
        body = venta;
      }
      console.log('Datos de venta a enviar (ajustado):', body);
      const response = await axios.post(
        ENDPOINTS.SAVE_SALE,
        body,
        getAuthConfig()
      );
      console.log('Respuesta completa del servidor:', response);
      let ventaData = response.data;
      if (typeof ventaData === 'string') {
        const idMatch = ventaData.match(/"idVenta":(\d+)/);
        if (idMatch && idMatch[1]) {
          ventaData = {
            idVenta: parseInt(idMatch[1]),
            estado: true,
            fecha: new Date().toISOString().split('T')[0]
          };
          console.log('ID de venta extraído correctamente:', ventaData.idVenta);
        } else {
          console.error('No se pudo extraer el ID de venta de la respuesta');
          throw new Error('No se pudo procesar la respuesta del servidor');
        }
      }
      if (!ventaData || typeof ventaData.idVenta !== 'number') {
        console.error('Datos de venta inválidos:', ventaData);
        throw new Error('La respuesta del servidor no tiene el formato esperado');
      }
      const ventaFormateada = {
        idVenta: ventaData.idVenta,
        estado: ventaData.estado || true,
        fecha: ventaData.fecha || new Date().toISOString().split('T')[0]
      };
      console.log('Venta formateada:', ventaFormateada);
      return ventaFormateada;
    } catch (error) {
      console.error('Error detallado al guardar la venta:', error);
      throw new Error(error.message || 'Error al guardar la venta');
    }
  },

  cambiarEstadoVenta: async (id, estado) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const response = await axios.put(
        ENDPOINTS.TOGGLE_SALE_STATUS(id),
        null,
        {
          ...getAuthConfig(),
          params: { estado }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado de la venta:', error);
      throw error;
    }
  },

  // Servicios de Detalle de Venta
  agregarDetallesVenta: async (ventaId, detalles) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      if (!ventaId) {
        throw new Error('ID de venta no proporcionado');
      }

      if (!Array.isArray(detalles)) {
        throw new Error('Los detalles deben ser un array');
      }

      const requestBody = {
        ventaId: parseInt(ventaId),
        detalles: detalles.map(detalle => ({
          productoId: parseInt(detalle.productoId),
          cantidad: parseInt(detalle.cantidad)
        }))
      };

      console.log('Enviando detalles al servidor:', requestBody);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token disponible');
      }

      
      const response = await axios.post(
        ENDPOINTS.ADD_SALE_DETAILS_BATCH,
        requestBody,
        getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al agregar detalles de venta:', error.response?.data || error);
      if (error.response?.status === 403) {
        throw new Error('No tienes permiso para agregar detalles a la venta');
      }
      throw new Error(error.response?.data?.message || error.message);
    }
  },


  eliminarDetalleVenta: async (detalleId) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const response = await axios.delete(
        ENDPOINTS.DELETE_SALE_DETAIL(detalleId),
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error al eliminar detalle de venta:', error);
      throw error;
    }
  },

  // Servicios de Pago
  registrarPago: async (ventaId, montoPagado, metodoPago) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const response = await axios.post(
        ENDPOINTS.REGISTER_PAYMENT,
        {
          venta: { idVenta: ventaId },
          montoPagado,
          metodoPago
        },
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error al registrar pago:', error);
      throw error;
    }
  },

  listarVentasConDetalle: async () => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);      const response = await axios.get(
        ENDPOINTS.LIST_SALES_WITH_DETAILS,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error al listar ventas con detalle:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener las ventas con detalle');
    }
  },

  obtenerVentaConDetalle: (idVenta) => {
    const ventas = JSON.parse(localStorage.getItem('ventas') || '[]');
    const venta = ventas.find(v => v.idVenta === idVenta);
    if (!venta) {
      throw new Error('Venta no encontrada');
    }
    return venta;
  },

  /**
   * Crea una venta completa: venta, detalles y pago en orden.
   * @param {Object} ventaCompleta - { clienteId, empleadoId, detalles, montoPagado, metodoPago }
   */
  crearVentaCompleta: async function(ventaCompleta) {
    try {
      // 1. Crear la venta principal
      const venta = await this.guardarVenta({
        clienteId: ventaCompleta.clienteId,
        empleadoId: ventaCompleta.empleadoId
      });
      if (!venta || !venta.idVenta) throw new Error('No se pudo crear la venta');

      // 2. Agregar los detalles de la venta
      await this.agregarDetallesVenta(venta.idVenta, ventaCompleta.detalles);

      // 3. Registrar el pago
      await this.registrarPago(
        venta.idVenta,
        ventaCompleta.montoPagado,
        ventaCompleta.metodoPago
      );

      return { success: true, idVenta: venta.idVenta };
    } catch (error) {
      console.error('Error en crearVentaCompleta:', error);
      throw new Error(error.message || 'Error al registrar la venta completa');
    }
  }
};
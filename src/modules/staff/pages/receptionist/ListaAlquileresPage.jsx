import { showConfirmDeleteToast } from '../../../../shared/components/ConfirmDeleteToast';
import React, { useState, useEffect } from 'react';
import { alquilerAPI } from '../../services/alquilerAPI';
import { ESTADO_ALQUILER, ESTADO_ALQUILER_INFO } from '../../constants/alquilerEstados';
import { DatePicker, TextInput } from '@tremor/react';
import {
  Card,
  Title,
  Text,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  Button,
  Dialog,
  DialogPanel,
  Flex,
  Select,
  SelectItem
} from '@tremor/react';
import { 
  Eye, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Printer, 
  FileText, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  RefreshCw,
  Ban,
  ArrowDownCircle,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Estilos para impresión
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .dialog-print-content, .dialog-print-content * {
      visibility: visible;
    }
    .dialog-print-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: auto;
      padding: 20px;
    }
    .no-print {
      display: none !important;
    }
    .print-break-after {
      page-break-after: always;
    }
  }
`;

const ListaAlquileresPage = () => {
  const [alquileres, setAlquileres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detalleAlquiler, setDetalleAlquiler] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);

  // Filtros
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroFecha, setFiltroFecha] = useState(() => {
    // Por defecto, la fecha actual (Lima, Perú)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return hoy;
  });

  const cargarAlquileres = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Iniciando carga de alquileres...');
      
      const response = await alquilerAPI.listarAlquileres();
      console.log('Datos crudos del servidor:', response);
      
      if (!Array.isArray(response)) {
        console.error('La respuesta no es un array:', response);
        throw new Error('Formato de respuesta inválido');
      }
      
      // Mostrar cada alquiler en detalle para debugging
      response.forEach((alquiler, index) => {
        console.log(`Alquiler ${index + 1}:`, {
          ID: alquiler.idAlquiler,
          Cliente: `${alquiler.clienteNombre} ${alquiler.clienteApellido}`,
          FechaInicio: alquiler.fechaInicio,
          FechaFin: alquiler.fechaFin,
          Total: alquiler.total,
          Estado: alquiler.estado || ESTADO_ALQUILER.ACTIVO,
          MetodoPago: alquiler.metodoPago,
          Detalles: alquiler.detalles
        });
      });
      
      // Formatear los datos para mostrarlos en la tabla
      const alquileresFormateados = response.map(alquiler => {
        // Normalizar las fechas a medianoche local y sumar +1 día para corregir desfase
        let fechaInicio = alquiler.fechaInicio ? new Date(alquiler.fechaInicio) : null;
        let fechaFin = alquiler.fechaFin ? new Date(alquiler.fechaFin) : null;
        if (fechaInicio) {
          fechaInicio.setHours(0, 0, 0, 0);
          fechaInicio.setDate(fechaInicio.getDate() + 1);
        }
        if (fechaFin) {
          fechaFin.setHours(0, 0, 0, 0);
          fechaFin.setDate(fechaFin.getDate() + 1);
        }

        // Calcular días solo si ambas fechas son válidas
        const diasAlquiler = (fechaInicio && fechaFin) ? 
          calcularDiasAlquiler(
            format(fechaInicio, 'yyyy-MM-dd'),
            format(fechaFin, 'yyyy-MM-dd')
          ) : 1;

        // Determinar si hay devolución pendiente
        const tienePiezasPendientes = Array.isArray(alquiler.detalles) && 
          alquiler.detalles.some(detalle => !detalle.devuelto);

        return {
          idAlquiler: alquiler.idAlquiler,
          cliente: `${alquiler.clienteNombre} ${alquiler.clienteApellido}`,
          clienteDni: alquiler.clienteDni,
          empleado: `${alquiler.empleadoNombre} ${alquiler.empleadoApellido}`,
          fechaInicio: fechaInicio ? formatearFecha(fechaInicio.toISOString()) : 'N/A',
          fechaFin: fechaFin ? formatearFecha(fechaFin.toISOString()) : 'N/A', 
          fechaInicioObj: fechaInicio,
          fechaFinObj: fechaFin,
          diasAlquiler, // Agregamos el cálculo de días
          devolucionPendiente: tienePiezasPendientes,
          total: alquiler.total || 0,
          mora: alquiler.mora || 0,
          totalConMora: alquiler.totalConMora || alquiler.total || 0,
          estado: alquiler.estado || ESTADO_ALQUILER.ACTIVO,
          metodoPago: alquiler.metodoPago || 'No registrado',
          idPago: alquiler.idPago,
          montoPagado: alquiler.montoPagado,
          vuelto: alquiler.vuelto,
          detalles: (alquiler.detalles || []).map(detalle => ({
            idDetalleAlquiler: detalle.idDetalleAlquiler,
            pieza: detalle.piezaNombre,
            piezaId: detalle.piezaId,
            cantidad: detalle.cantidad || 0,
            precioUnitario: detalle.precioUnitario || 0,
            subtotal: detalle.subtotal || 0,
            devuelto: detalle.devuelto || false
          }))
        };
      });

      console.log('Alquileres formateados:', alquileresFormateados);
      setAlquileres(alquileresFormateados);
      
      // Guardar en localStorage para acceso rápido
      localStorage.setItem('alquileres', JSON.stringify(alquileresFormateados));
      
    } catch (err) {
      console.error('Error al cargar alquileres:', err);
      setError('Error al cargar el historial de alquileres: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = (alquilerId) => {
    try {
      // Buscar el alquiler en los datos que ya tenemos
      const alquiler = alquileres.find(a => a.idAlquiler === alquilerId);
      
      if (!alquiler) {
        throw new Error('Alquiler no encontrado');
      }

      // Determinar si la fecha de fin ya pasó (para mostrar alertas)
      const estaVencido = alquiler.fechaFinObj && new Date() > alquiler.fechaFinObj && 
                         alquiler.estado === ESTADO_ALQUILER.ACTIVO;

      // Usar los datos existentes, manteniendo el formato de fecha de la tabla
      const detalleValidado = {
        ...alquiler,
        fechaInicio: alquiler.fechaInicio,  // Usar la fecha ya formateada de la tabla
        fechaFin: alquiler.fechaFin,        // Usar la fecha ya formateada de la tabla
        detalles: alquiler.detalles || [],
        pagado: alquiler.idPago != null,
        estaVencido: estaVencido
      };

      console.log('Detalle de alquiler:', detalleValidado);
      setDetalleAlquiler(detalleValidado);
      setModalDetalle(true);
    } catch (err) {
      console.error('Error al cargar detalle del alquiler:', err);
      setError('Error al cargar detalle: ' + err.message);
    }
  };

  const cerrarDetalle = () => {
    setModalDetalle(false);
    setTimeout(() => setDetalleAlquiler(null), 300);
  };

  // Método para cambiar estado de alquiler
  const cambiarEstadoAlquiler = async (id, nuevoEstado) => {
    try {
      setLoading(true);
      
      // Llamar al método específico según el nuevo estado
      switch (nuevoEstado) {
        case ESTADO_ALQUILER.FINALIZADO:
          await alquilerAPI.finalizarAlquiler(id);
          break;
        case ESTADO_ALQUILER.CANCELADO:
          await alquilerAPI.cancelarAlquiler(id);
          break;
        case ESTADO_ALQUILER.VENCIDO:
          await alquilerAPI.marcarVencido(id);
          break;
        default:
          await alquilerAPI.cambiarEstadoAlquiler(id, nuevoEstado);
      }
      
      // Actualizar la lista de alquileres localmente
      setAlquileres(alquileres.map(alquiler => 
        alquiler.idAlquiler === id ? { ...alquiler, estado: nuevoEstado } : alquiler
      ));
      
      // Si hay un detalle abierto, actualizarlo
      if (detalleAlquiler && detalleAlquiler.idAlquiler === id) {
        setDetalleAlquiler({ ...detalleAlquiler, estado: nuevoEstado });
      }
      
      const estadoInfo = ESTADO_ALQUILER_INFO[nuevoEstado];
      console.log(`Estado del alquiler ${id} cambiado a ${estadoInfo?.label || nuevoEstado}`);
      setError(null);
    } catch (err) {
      console.error('Error al cambiar el estado del alquiler:', err);
      setError('Error al cambiar el estado: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Método para registrar devolución
  const registrarDevolucion = async (id) => {
    try {
      setLoading(true);
      await alquilerAPI.registrarDevolucion(id);
      
      // Actualizar la lista de alquileres localmente
      setAlquileres(alquileres.map(alquiler => 
        alquiler.idAlquiler === id ? { 
          ...alquiler, 
          devolucionPendiente: false,
          detalles: alquiler.detalles.map(detalle => ({...detalle, devuelto: true}))
        } : alquiler
      ));
      
      if (detalleAlquiler && detalleAlquiler.idAlquiler === id) {
        setDetalleAlquiler({ 
          ...detalleAlquiler, 
          devolucionPendiente: false,
          detalles: detalleAlquiler.detalles.map(detalle => ({...detalle, devuelto: true}))
        });
      }
      
      // Una vez registrada la devolución, finalizamos el alquiler
      await cambiarEstadoAlquiler(id, ESTADO_ALQUILER.FINALIZADO);
      
      setError(null);
      console.log(`Devolución registrada y alquiler finalizado con ID ${id}`);
    } catch (err) {
      console.error('Error al registrar devolución:', err);
      setError('Error al registrar devolución: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const formatearFecha = (fechaStr) => {
    try {
      if (!fechaStr) return 'Sin fecha';
      
      // Primero intentamos crear una fecha con el formato ISO
      let fecha = new Date(fechaStr);
      
      // Si la fecha es inválida, intentamos parsear diferentes formatos
      if (isNaN(fecha.getTime())) {
        if (fechaStr.includes('/')) {
          // Formato dd/MM/yyyy
          const [dia, mes, anio] = fechaStr.split('/');
          fecha = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
        } else if (fechaStr.includes('-')) {
          // Formato yyyy-MM-dd
          const [anio, mes, dia] = fechaStr.split('-');
          fecha = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
        }
      }

      // Verificar si la fecha es válida después de los intentos de parseo
      if (isNaN(fecha.getTime())) {
        console.error('Fecha inválida después de intentos de parseo:', fechaStr);
        return 'Fecha inválida';
      }
      
      // Normalizar la fecha a medianoche local para evitar problemas de zona horaria
      fecha.setHours(0, 0, 0, 0);
      
      console.log('Fecha original:', fechaStr);
      console.log('Fecha normalizada:', fecha);
      
      return format(fecha, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };
  
  const convertirNumeroALetras = (numero) => {
    const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    
    if (numero === 0) return 'CERO';
    
    // Convertimos el número a un string para facilitar su manipulación
    const str = numero.toFixed(2);
    const partes = str.split('.');
    const entero = parseInt(partes[0]);
    const decimal = parseInt(partes[1]);
    
    // Procesamos la parte entera
    let resultado = '';
    
    if (entero < 10) {
      resultado = unidades[entero];
    } else if (entero < 20) {
      resultado = especiales[entero - 10];
    } else if (entero < 100) {
      const unidad = entero % 10;
      const decena = Math.floor(entero / 10);
      
      if (unidad === 0) {
        resultado = decenas[decena];
      } else {
        resultado = decenas[decena] + ' Y ' + unidades[unidad];
      }
    } else {
      resultado = 'NÚMERO FUERA DE RANGO';
    }
    
    // Añadimos la parte decimal si es necesario
    if (decimal > 0) {
      resultado += ' CON ' + decimal + ' SOLES';
    } else {
      resultado += ' CON 00 SOLES';
    }
    
    return resultado;
  };
  
  // Función auxiliar para calcular días de manera confiable
  const calcularDiasAlquiler = (fechaInicioStr, fechaFinStr) => {
    try {
      if (!fechaInicioStr || !fechaFinStr) return 1;
      
      console.log('Calculando días entre:', { fechaInicioStr, fechaFinStr });
      
      // Convertir las fechas a objetos Date normalizados
      let fechaInicio, fechaFin;
      
      // Función auxiliar para normalizar fechas
      const normalizarFecha = (fechaStr) => {
        let fecha;
        if (fechaStr.includes('/')) {
          const [dia, mes, anio] = fechaStr.split('/');
          fecha = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
        } else if (fechaStr.includes('-')) {
          const [anio, mes, dia] = fechaStr.split('-');
          fecha = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
        } else {
          fecha = new Date(fechaStr);
        }
        
        // Normalizar a medianoche para evitar problemas de zona horaria
        fecha.setHours(0, 0, 0, 0);
        return fecha;
      };
      
      fechaInicio = normalizarFecha(fechaInicioStr);
      fechaFin = normalizarFecha(fechaFinStr);
      
      // Verificar que las fechas sean válidas
      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        console.error('Fechas inválidas después de normalización:', { fechaInicio, fechaFin });
        return 1;
      }
      
      // Calcular la diferencia en días incluyendo ambos días (inicio y fin)
      const diferenciaTiempo = fechaFin.getTime() - fechaInicio.getTime();
      const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24)) + 1;
      
      console.log('Resultado del cálculo:', {
        fechaInicio: fechaInicio.toLocaleDateString('es-PE'),
        fechaFin: fechaFin.toLocaleDateString('es-PE'),
        diferenciaTiempo,
        diferenciaDias
      });
      
      return diferenciaDias > 0 ? diferenciaDias : 1;
    } catch (error) {
      console.error('Error en cálculo de días:', error);
      return 1;
    }
  };
  
  // Cargar alquileres al inicio
  useEffect(() => {
    cargarAlquileres();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Debug: agregar logs para verificar las fechas que llegan
  useEffect(() => {
    if (detalleAlquiler) {
      console.log('Detalle del alquiler recibido:', {
        fechaInicio: detalleAlquiler.fechaInicio,
        fechaFin: detalleAlquiler.fechaFin,
        detalles: detalleAlquiler.detalles
      });
    }
  }, [detalleAlquiler]);
  
  // --- FILTRADO ---
  // Filtrar alquileres por nombre y SOLO por la fecha de inicio exacta
  const alquileresFiltrados = alquileres.filter(alquiler => {
    const nombreMatch = filtroNombre.trim() === '' || alquiler.cliente.toLowerCase().includes(filtroNombre.trim().toLowerCase());
    let fechaMatch = true;
    if (filtroFecha) {
      const fechaInicio = alquiler.fechaInicioObj;
      if (fechaInicio) {
        // Normalizar ambas fechas a 00:00:00 local
        const filtroDate = new Date(filtroFecha);
        filtroDate.setHours(0, 0, 0, 0);
        const inicioDate = new Date(fechaInicio);
        inicioDate.setHours(0, 0, 0, 0);
        const filtroStr = format(filtroDate, 'yyyy-MM-dd');
        const inicioStr = format(inicioDate, 'yyyy-MM-dd');
        // LOG para depuración de fechas
        console.log('[DEBUG FILTRO FECHA]', {
          filtroFecha: filtroDate,
          filtroStr,
          fechaInicioObj: inicioDate,
          inicioStr,
          resultadoComparacion: filtroStr === inicioStr
        });
        fechaMatch = filtroStr === inicioStr;
      } else {
        fechaMatch = false;
      }
    }
    return nombreMatch && fechaMatch;
  });

  return (
    <div className="p-4">
      <style>{printStyles}</style>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial de Alquileres</h1>
          <p className="text-gray-500">Registro de todos los alquileres realizados</p>
        </div>
      </div>
      <Card>

        {/* Filtros avanzados estilo ListaInscripcionesPage */}
        <div className="flex flex-wrap gap-4 items-center justify-between p-4 border-b mb-4">
          {/* Buscador por nombre */}
          <div className="flex-1 min-w-[200px] relative">
            <TextInput
              placeholder="Buscar por nombre de cliente..."
              value={filtroNombre}
              onChange={e => setFiltroNombre(e.target.value)}
            />
            {filtroNombre && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                onClick={() => setFiltroNombre('')}
                aria-label="Limpiar filtro nombre"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {/* Selector de fecha */}
          <div className="min-w-[200px] flex items-center gap-2 relative">
            <DatePicker
              value={filtroFecha}
              onValueChange={date => {
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                if (date && date > hoy) return;
                setFiltroFecha(date);
              }}
              locale={es}
              maxDate={new Date()}
              placeholder="Filtrar por fecha"
              enableClear={false}
            />
            {filtroFecha && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                onClick={() => setFiltroFecha(null)}
                aria-label="Limpiar filtro fecha"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="mb-2 bg-gray-50 p-1 rounded text-center">
          <Text className="text-gray-600 text-xs">
            <span className="font-medium">Leyenda:</span> La columna <span className="font-medium">Estado</span> muestra el estado principal del alquiler y el estado de devolución de los productos.
          </Text>
        </div>

        {error && (
          <div className="mb-4 p-2 border border-red-200 bg-red-50 rounded">
            <Text className="text-red-600">{error}</Text>
          </div>
        )}

        {loading && !alquileres.length ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="animate-spin mr-2" size={20} />
            <Text className="text-gray-500 text-sm">Cargando alquileres...</Text>
          </div>
        ) : (
          <Table className="w-full border-collapse [&_tbody_tr:nth-of-type(even)]:bg-gray-50">
            <TableHead>
              <TableRow className="[&>*]:p-1.5 bg-gray-100">
                <TableHeaderCell className="w-10 text-center">ID</TableHeaderCell>
                <TableHeaderCell className="w-36">Cliente</TableHeaderCell>
                <TableHeaderCell className="w-24 text-center">Inicio</TableHeaderCell>
                <TableHeaderCell className="w-24 text-center">Fin</TableHeaderCell>
                <TableHeaderCell className="w-20 text-right">Total</TableHeaderCell>
                <TableHeaderCell className="w-32 text-center">Estado</TableHeaderCell>
                <TableHeaderCell className="w-24 text-center">Pago</TableHeaderCell>
                <TableHeaderCell className="w-28 text-center">Acciones</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alquileresFiltrados.map((alquiler) => {
                // ...existing code...
                const estadoInfo = ESTADO_ALQUILER_INFO[alquiler.estado] || {
                  label: 'Desconocido',
                  color: 'gray'
                };
                // ...existing code...
                let EstadoIcon;
                switch(alquiler.estado) {
                  case ESTADO_ALQUILER.ACTIVO:
                    EstadoIcon = CheckCircle;
                    break;
                  case ESTADO_ALQUILER.FINALIZADO:
                    EstadoIcon = CheckCircle;
                    break;
                  case ESTADO_ALQUILER.VENCIDO:
                    EstadoIcon = AlertTriangle;
                    break;
                  case ESTADO_ALQUILER.CANCELADO:
                    EstadoIcon = Ban;
                    break;
                  default:
                    EstadoIcon = null;
                }
                // ...existing code...
                return (
                  <TableRow key={alquiler.idAlquiler} className="[&>*]:p-1 border-t border-gray-100 hover:bg-gray-50">
                    <TableCell className="text-center">{alquiler.idAlquiler}</TableCell>
                    <TableCell className="truncate">{alquiler.cliente}</TableCell>
                    <TableCell className="text-center">{alquiler.fechaInicio}</TableCell>
                    <TableCell className="text-center">{alquiler.fechaFin}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <Text className="font-medium">S/ {alquiler.total.toFixed(2)}</Text>
                        {alquiler.mora > 0 && (
                          <>
                            <Text className="text-xs text-red-600">Mora: S/ {alquiler.mora.toFixed(2)}</Text>
                            <Text className="font-medium">Total: S/ {alquiler.totalConMora.toFixed(2)}</Text>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-2">
                        <Badge
                          color={estadoInfo.color}
                          icon={EstadoIcon}
                          className="justify-center text-xs px-1 py-0.5 w-28 mx-auto"
                          size="xs"
                        >
                          {estadoInfo.label}
                        </Badge>
                        {/* Estado de devolución dependiendo del estado actual */}
                        {(alquiler.estado === ESTADO_ALQUILER.ACTIVO || 
                          alquiler.estado === ESTADO_ALQUILER.VENCIDO) && (
                          <Badge
                            color={alquiler.devolucionPendiente ? "amber" : "green"}
                            icon={alquiler.devolucionPendiente ? Clock : CheckCircle}
                            className="justify-center text-xs px-1 py-0.5 w-28 mx-auto"
                            size="xs"
                          >
                            {alquiler.devolucionPendiente ? 'Por devolver' : 'Devuelto'}
                          </Badge>
                        )}
                        {/* Si está finalizado, mostrar siempre "Devuelto" */}
                        {alquiler.estado === ESTADO_ALQUILER.FINALIZADO && (
                          <Badge
                            color="green"
                            icon={CheckCircle}
                            className="justify-center text-xs px-1 py-0.5 w-28 mx-auto"
                            size="xs"
                          >
                            Devuelto
                          </Badge>
                        )}
                        {/* Si está cancelado, mostrar "No aplica" como estado de devolución */}
                        {alquiler.estado === ESTADO_ALQUILER.CANCELADO && (
                          <Badge
                            color="gray"
                            icon={Ban}
                            className="justify-center text-xs px-1 py-0.5 w-28 mx-auto"
                            size="xs"
                          >
                            No aplica
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        color={alquiler.idPago ? "green" : "gray"}
                        className="text-xs px-1 py-0.5 w-20 mx-auto"
                        size="xs"
                      >
                        {alquiler.idPago ? `${alquiler.metodoPago}` : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        {/* Botón Ver detalle with text and icon */}
                        <Button
                          icon={Eye}
                          variant="secondary"
                          size="xs"
                          onClick={() => verDetalle(alquiler.idAlquiler)}
                          className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-700 font-medium bg-transparent"
                        >
                          Ver Detalle
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {alquileresFiltrados.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                    No hay alquileres registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
      
      {/* Modal de detalle */}
      {modalDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-2xl my-4">
            <Card className="dialog-print-content p-6">
              {detalleAlquiler && (
                <div className="space-y-4">
                  {/* Encabezado de la Empresa */}
                  <div className="text-center border-b pb-4">
                    <img 
                      src="/src/assets/LOGO BUSSTER GYM.png" 
                      alt="Logo Busster Gym" 
                      className="h-16 mx-auto mb-2"
                    />
                    <Text className="font-bold text-xl">BUSTER GYM S.A.C</Text>
                    <Text className="text-gray-600">R.U.C. 20100100100</Text>
                    <Text className="text-gray-600">Nuevo Chimbote, Los cipreces O-25</Text>
                    <Text className="text-gray-600">Telf: (01) 123-4567</Text>
                  </div>

                  {/* Título y Número de Comprobante */}
                  <div className="text-center border-b pb-4">
                    <Text className="font-bold text-lg">COMPROBANTE DE ALQUILER</Text>
                    <Text className="font-medium">A002-{String(detalleAlquiler.idAlquiler).padStart(8, '0')}</Text>
                    <div className="flex justify-center mt-3">
                      <div>
                        {/* Badge unificado que muestra el estado general y el estado de devolución */}
                        {(() => {
                          const estadoInfo = ESTADO_ALQUILER_INFO[detalleAlquiler.estado] || {
                            label: 'Desconocido',
                            color: 'gray'
                          };
                          
                          let EstadoIcon;
                          let estadoTexto = estadoInfo.label;
                          let estadoColor = estadoInfo.color;
                          
                          // Decidir el icono basado en el estado
                          switch(detalleAlquiler.estado) {
                            case ESTADO_ALQUILER.ACTIVO:
                              EstadoIcon = CheckCircle;
                              estadoTexto += detalleAlquiler.devolucionPendiente ? 
                                " (Por devolver)" : " (Devuelto)";
                              break;
                            case ESTADO_ALQUILER.FINALIZADO:
                              EstadoIcon = CheckCircle;
                              estadoTexto += " (Devuelto)";
                              break;
                            case ESTADO_ALQUILER.VENCIDO:
                              EstadoIcon = AlertTriangle;
                              estadoTexto += detalleAlquiler.devolucionPendiente ? 
                                " (Por devolver)" : " (Devuelto)";
                              break;
                            case ESTADO_ALQUILER.CANCELADO:
                              EstadoIcon = Ban;
                              break;
                            default:
                              EstadoIcon = null;
                          }
                          
                          return (
                            <Badge 
                              color={estadoColor}
                              icon={EstadoIcon}
                              className="justify-center text-xs px-3 py-1"
                              size="md"
                            >
                              {estadoTexto}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Información del Cliente */}
                  <div className="text-sm space-y-2 border-b pb-4">
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                      <Text className="font-medium">Fecha inicio:</Text>
                      <Text>{detalleAlquiler.fechaInicio}</Text>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                      <Text className="font-medium">Fecha fin:</Text>
                      <Text>{detalleAlquiler.fechaFin}</Text>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                      <Text className="font-medium">Cliente:</Text>
                      <Text>{detalleAlquiler.cliente}</Text>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                      <Text className="font-medium">DNI:</Text>
                      <Text>{detalleAlquiler.clienteDni || 'Sin DNI'}</Text>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                      <Text className="font-medium">Empleado:</Text>
                      <Text>{detalleAlquiler.empleado}</Text>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                      <Text className="font-medium">Duración:</Text>
                      <Text>
                        {(() => {
                          const dias = calcularDiasAlquiler(detalleAlquiler.fechaInicio, detalleAlquiler.fechaFin);
                          return `${dias} día${dias > 1 ? 's' : ''}`;
                        })()}
                      </Text>
                    </div>
                  </div>

                  {/* Tabla de Piezas Alquiladas */}
                  <div className="text-sm">
                    <Text className="font-medium text-gray-700 mb-2">DETALLE DE PIEZAS ALQUILADAS</Text>
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left [&>th]:py-2 [&>th]:text-xs [&>th]:font-medium [&>th]:text-gray-500">
                          <th>CANT.</th>
                          <th>DESCRIPCIÓN</th>
                          <th className="text-right">P.DIARIO</th>
                          <th className="text-center">DÍAS</th>
                          <th className="text-right">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody className="[&>tr]:border-b [&>tr]:border-gray-100">
                        {detalleAlquiler.detalles.map((detalle, index) => {
                          // Calcular días del alquiler usando la función principal
                          const diasAlquiler = calcularDiasAlquiler(detalleAlquiler.fechaInicio, detalleAlquiler.fechaFin);
                          
                          // Si tenemos el subtotal del backend, verificar si coincide con el cálculo esperado
                          const subtotalEsperado = detalle.cantidad * detalle.precioUnitario * diasAlquiler;
                          const usarSubtotalBackend = Math.abs(detalle.subtotal - subtotalEsperado) < 0.01;
                          
                          return (
                            <tr key={detalle.idDetalleAlquiler || index} className="[&>td]:py-2">
                              <td>{detalle.cantidad}</td>
                              <td>{detalle.pieza}</td>
                              <td className="text-right">S/ {detalle.precioUnitario.toFixed(2)}</td>
                              <td className="text-center">{diasAlquiler}</td>
                              <td className="text-right">
                                S/ {usarSubtotalBackend ? detalle.subtotal.toFixed(2) : subtotalEsperado.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                        {detalleAlquiler.detalles.length === 0 && (
                          <tr>
                            <td colSpan="4" className="text-center py-4">No hay piezas alquiladas</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Totales y Detalles de Pago */}
                  <div className="text-sm space-y-2 pt-2">
                    <div className="grid grid-cols-2 text-right gap-2 border-t pt-2">
                      <Text className="font-bold">SUBTOTAL:</Text>
                      <Text className="font-bold">
                        S/ {(() => {
                          // Calcular el subtotal recalculado basado en los días correctos
                          const diasAlquiler = calcularDiasAlquiler(detalleAlquiler.fechaInicio, detalleAlquiler.fechaFin);
                          const subtotalRecalculado = detalleAlquiler.detalles.reduce((total, detalle) => {
                            return total + (detalle.cantidad * detalle.precioUnitario * diasAlquiler);
                          }, 0);
                          
                          // Usar el subtotal recalculado si hay una diferencia significativa con el del backend
                          const usarRecalculado = Math.abs(detalleAlquiler.total - subtotalRecalculado) > 0.01;
                          return (usarRecalculado ? subtotalRecalculado : detalleAlquiler.total).toFixed(2);
                        })()}
                      </Text>
                      
                      {detalleAlquiler.mora > 0 && (
                        <>
                          <Text className="font-bold text-red-600">MORA:</Text>
                          <Text className="font-bold text-red-600">S/ {detalleAlquiler.mora.toFixed(2)}</Text>
                          
                          <Text className="font-bold">TOTAL CON MORA:</Text>
                          <Text className="font-bold">
                            S/ {(() => {
                              // Calcular el total con mora basado en el subtotal recalculado
                              const diasAlquiler = calcularDiasAlquiler(detalleAlquiler.fechaInicio, detalleAlquiler.fechaFin);
                              const subtotalRecalculado = detalleAlquiler.detalles.reduce((total, detalle) => {
                                return total + (detalle.cantidad * detalle.precioUnitario * diasAlquiler);
                              }, 0);
                              
                              const usarRecalculado = Math.abs(detalleAlquiler.total - subtotalRecalculado) > 0.01;
                              const subtotalFinal = usarRecalculado ? subtotalRecalculado : detalleAlquiler.total;
                              
                              return (subtotalFinal + detalleAlquiler.mora).toFixed(2);
                            })()}
                          </Text>
                        </>
                      )}
                    </div>
                    <Text>SON: {(() => {
                      // Calcular el monto para convertir a letras usando el cálculo correcto
                      const diasAlquiler = calcularDiasAlquiler(detalleAlquiler.fechaInicio, detalleAlquiler.fechaFin);
                      const subtotalRecalculado = detalleAlquiler.detalles.reduce((total, detalle) => {
                        return total + (detalle.cantidad * detalle.precioUnitario * diasAlquiler);
                      }, 0);
                      
                      const usarRecalculado = Math.abs(detalleAlquiler.total - subtotalRecalculado) > 0.01;
                      const subtotalFinal = usarRecalculado ? subtotalRecalculado : detalleAlquiler.total;
                      const totalFinal = subtotalFinal + (detalleAlquiler.mora || 0);
                      
                      return convertirNumeroALetras(totalFinal);
                    })()}</Text>
                  </div>

                  {/* Mostrar alerta de mora si existe */}
                  {detalleAlquiler.mora > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
                      <div className="flex items-center">
                        <AlertTriangle className="text-red-500 mr-2" size={20} />
                        <Text className="text-red-700 font-medium">
                          ¡Atención! Este alquiler tiene mora por atraso
                        </Text>
                      </div>
                      <Text className="text-red-600 mt-1">
                        Se ha aplicado una mora de S/ {detalleAlquiler.mora.toFixed(2)} por retraso en la devolución.
                        El monto total a pagar es de S/ {detalleAlquiler.totalConMora.toFixed(2)}.
                      </Text>
                    </div>
                  )}

                  {/* Información de Pago */}
                  <div className="text-sm space-y-2 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <Text className="font-medium">Estado de pago:</Text>
                        <Badge color={detalleAlquiler.idPago ? "green" : "yellow"} className="text-xs px-2 py-0.5">
                          {detalleAlquiler.idPago ? 'PAGADO' : 'PENDIENTE'}
                        </Badge>
                      </div>
                      
                      {detalleAlquiler.idPago && (
                        <div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Text className="font-medium">Forma de Pago:</Text>
                              <Text>{detalleAlquiler.metodoPago}</Text>
                            </div>
                            <div>
                              <Text className="font-medium">Monto Pagado:</Text>
                              <Text>S/ {detalleAlquiler.montoPagado?.toFixed(2) || '0.00'}</Text>
                            </div>
                          </div>
                          {detalleAlquiler.vuelto && detalleAlquiler.vuelto > 0 && (
                            <div className="mt-2">
                              <Text className="font-medium">Vuelto:</Text>
                              <Text>S/ {detalleAlquiler.vuelto.toFixed(2)}</Text>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="mt-6 pt-4 border-t border-gray-200 no-print">
                    <div className="mb-3">
                      <Text className="font-medium text-gray-700">Acciones disponibles:</Text>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {/* Botón de devolución - Solo visible en estado ACTIVO o VENCIDO con devolución pendiente */}
                      {(detalleAlquiler.estado === ESTADO_ALQUILER.ACTIVO || detalleAlquiler.estado === ESTADO_ALQUILER.VENCIDO) && 
                       detalleAlquiler.devolucionPendiente && (
                        <Button
                          icon={ArrowDownCircle}
                          variant="secondary"
                          color="green"
                          onClick={() => registrarDevolucion(detalleAlquiler.idAlquiler)}
                          disabled={loading}
                          className="justify-start"
                        >
                          <span className="flex items-center">
                            <ArrowDownCircle className="mr-2" size={16} />
                            Registrar devolución
                          </span>
                        </Button>
                      )}
                      
                      {/* Botón para finalizar - Solo en ACTIVO sin devoluciones pendientes */}
                      {detalleAlquiler.estado === ESTADO_ALQUILER.ACTIVO && !detalleAlquiler.devolucionPendiente && (
                        <Button
                          variant="secondary"
                          color="blue"
                          onClick={() => cambiarEstadoAlquiler(detalleAlquiler.idAlquiler, ESTADO_ALQUILER.FINALIZADO)}
                          disabled={loading}
                          className="justify-start"
                        >
                          <span className="flex items-center">
                            <CheckCircle className="mr-2" size={16} />
                            Finalizar alquiler
                          </span>
                        </Button>
                      )}
                      
                      {/* Botón para cancelar - Solo en ACTIVO o ACTIVA */}
                      {(detalleAlquiler.estado === ESTADO_ALQUILER.ACTIVO || detalleAlquiler.estado === 'ACTIVA' || detalleAlquiler.estado === ESTADO_ALQUILER.VENCIDO) && (
                        <Button
                          variant="secondary"
                          color="red"
                          onClick={() => {
                            showConfirmDeleteToast({
                              message: '¿Estás seguro de que deseas cancelar este alquiler?',
                              onConfirm: () => cambiarEstadoAlquiler(detalleAlquiler.idAlquiler, ESTADO_ALQUILER.CANCELADO)
                            });
                          }}
                          disabled={loading}
                          className="justify-start"
                        >
                          <span className="flex items-center">
                            <XCircle className="mr-2" size={16} />
                            Cancelar alquiler
                          </span>
                        </Button>
                      )}
                      
                      {/* El botón 'Marcar como Vencido' se ha eliminado porque ahora el proceso es automático */}
                      {/* Un sistema automático ahora marca los alquileres como vencidos cuando pasa su fecha de fin */}
                      
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          window.print();
                        }}
                        icon={Printer}
                        className="border border-gray-400 text-gray-700 bg-transparent hover:bg-gray-100 hover:text-gray-900"
                      >
                        Imprimir comprobante
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={cerrarDetalle}
                        className="border border-gray-400 text-gray-700 bg-transparent hover:bg-gray-100 hover:text-gray-900"
                      >
                        Cerrar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaAlquileresPage;

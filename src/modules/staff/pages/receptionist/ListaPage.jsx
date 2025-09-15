import React, { useState, useEffect } from 'react';
import { ventasAPI } from '../../services/ventaAPI';

import {
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Title,
  Text,
  Button,  
  Badge,
  Flex,
  TextInput,
  DatePicker
} from '@tremor/react';
import { 
  Receipt,
  FileText,
  Printer,
  Search,
  Clock,
  User,
  CreditCard,
  Calendar,
  AlertCircle,
  Loader2,
  X,
  Filter,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';



const ListaPage = () => {
  // Fecha actual local (del navegador)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const [ventas, setVentas] = useState([]);
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoy);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detalleVentaSeleccionada, setDetalleVentaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cancelandoVenta, setCancelandoVenta] = useState(false);
  // Cancelar venta
  const cancelarVenta = async (idVenta) => {
    if (!idVenta) return;
    import('../../../../shared/components/ConfirmDeleteToast').then(({ showConfirmDeleteToast }) => {
      showConfirmDeleteToast({
        message: '¿Estás seguro de que deseas cancelar esta venta?',
        onConfirm: async () => {
          setCancelandoVenta(true);
          setError(null);
          try {
            await ventasAPI.cancelarVenta(idVenta);
            await cargarVentas();
            setModalAbierto(false);
          } catch (err) {
            setError(err.message || 'Error al cancelar la venta');
          } finally {
            setCancelandoVenta(false);
          }
        },
      });
    });
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  useEffect(() => {
    filtrarVentas();
  }, [ventas, busqueda, fechaSeleccionada]);

  const cargarVentas = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Iniciando carga de ventas...');
      
      const response = await ventasAPI.listarVentas();
      console.log('Datos crudos del servidor:', response);
      
      if (!Array.isArray(response)) {
        console.error('La respuesta no es un array:', response);
        throw new Error('Formato de respuesta inválido');
      }
      
      // Mostrar cada venta en detalle para debugging
      response.forEach((venta, index) => {
        console.log(`Venta ${index + 1}:`, {
          ID: venta.idVenta,
          Cliente: `${venta.clienteNombre} ${venta.clienteApellido}`,
          Fecha: venta.fecha,
          Total: venta.total,
          Estado: venta.estado ? 'COMPLETADA' : 'PENDIENTE',
          MetodoPago: venta.metodoPago,
          Detalles: venta.detalles
        });
      });
      // Sumar +1 día a la fecha para corregir desfase de zona horaria
      const ventasFormateadas = response.map(venta => {
        let fechaAjustada = venta.fecha;
        if (venta.fecha) {
          const fechaObj = new Date(venta.fecha);
          fechaObj.setDate(fechaObj.getDate() + 1);
          fechaAjustada = fechaObj.toISOString().split('T')[0];
        }
        return {
          idVenta: venta.idVenta,
          fecha: fechaAjustada,
          hora: venta.hora,
          clienteNombre: venta.clienteNombre || 'Sin nombre',
          clienteApellido: venta.clienteApellido || '',
          clienteDni: venta.clienteDni || '(Sin DNI)',
          empleadoNombre: venta.empleadoNombre || '(Empleado no registrado)',
          empleadoApellido: venta.empleadoApellido || '',
          empleadoDni: venta.empleadoDni || '(Sin DNI)',
          total: venta.total || 0,
          estado: venta.estado,
          idPago: venta.idPago,
          vuelto: venta.vuelto || 0,
          montoPagado: venta.montoPagado || 0,
          metodoPago: venta.metodoPago || 'No especificado',
          detalles: (venta.detalles || []).map(detalle => ({
            idDetalle: detalle.idDetalle,
            productoNombre: detalle.productoNombre || 'Producto sin nombre',
            cantidad: detalle.cantidad || 0,
            precioUnitario: detalle.precioUnitario || 0,
            subtotal: detalle.subtotal || 0
          }))
        };
      });

      console.log('Ventas formateadas:', ventasFormateadas);
      setVentas(ventasFormateadas);
      
    } catch (err) {
      console.error('Error al cargar ventas:', err);
      setError('Error al cargar el historial de ventas: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };  const verDetalle = (ventaId) => {
    try {
      // Buscar la venta en los datos que ya tenemos
      const venta = ventas.find(v => v.idVenta === ventaId);
      
      if (!venta) {
        throw new Error('Venta no encontrada');
      }

      // Usar los datos existentes
      const detalleValidado = {
        ...venta,
        detalles: venta.detalles || [], // Si no hay detalles, usar array vacío
        clienteDni: venta.clienteDni || '(Sin DNI)',
        empleadoNombre: venta.empleadoNombre || '(Empleado no registrado)',
        empleadoApellido: venta.empleadoApellido || '',
        empleadoDni: venta.empleadoDni || '(Sin DNI)'
      };

      console.log('Detalle de venta:', detalleValidado);
      
      setDetalleVentaSeleccionada(detalleValidado);
      setModalAbierto(true);
    } catch (err) {
      console.error('Error al mostrar detalle de venta:', err);
      setError(`Error al mostrar el detalle de la venta: ${err.message}`);
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setDetalleVentaSeleccionada(null);
  };

  const imprimirBoleta = () => {
    window.print();
  };

  const formatearFecha = (fecha) => {
    try {
      if (!fecha) return 'Sin fecha';
      const date = new Date(fecha);
      return format(date, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };

  const formatearHora = (hora) => {
    try {
      if (!hora) return 'Sin hora';
      
      // Si la hora viene en formato 12h (con AM/PM)
      if (hora.toLowerCase().includes('a. m.') || hora.toLowerCase().includes('p. m.')) {
        const [tiempo, periodo] = hora.split(' ');
        const [h, m, s] = tiempo.split(':').map(num => parseInt(num, 10));
        const horaFormateada = new Date();
        let hora24 = h;
        
        if (periodo.toLowerCase().includes('p. m.') && h !== 12) {
          hora24 = h + 12;
        } else if (periodo.toLowerCase().includes('a. m.') && h === 12) {
          hora24 = 0;
        }
        
        horaFormateada.setHours(hora24, m || 0, s || 0);
        return format(horaFormateada, 'HH:mm:ss');
      }
      
      // Si la hora viene en formato 24h
      const [h, m, s] = hora.split(':').map(num => parseInt(num, 10));
      if (isNaN(h) || isNaN(m) || (s !== undefined && isNaN(s))) {
        return 'Formato de hora inválido';
      }
      
      const horaFormateada = new Date();
      horaFormateada.setHours(h, m, s || 0);
      return format(horaFormateada, 'HH:mm:ss');
    } catch (error) {
      console.error('Error al formatear hora:', error);
      return 'Hora inválida';
    }
  };
  
  const convertirNumeroALetras = (numero) => {
    const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    
    if (numero === 0) return 'CERO';
    
    let numeroStr = Math.floor(numero).toString();
    let decimales = Math.round((numero - Math.floor(numero)) * 100);
    let resultado = '';
    
    // Procesar parte entera
    if (numeroStr.length === 1) {
      resultado = unidades[parseInt(numeroStr)];
    } else if (numeroStr.length === 2) {
      let dec = parseInt(numeroStr[0]);
      let uni = parseInt(numeroStr[1]);
      
      if (dec === 1 && uni > 0) {
        resultado = especiales[uni];
      } else {
        resultado = decenas[dec];
        if (uni > 0) {
          resultado += ' Y ' + unidades[uni];
        }
      }
    } else if (numeroStr.length === 3) {
      let centena = parseInt(numeroStr[0]);
      let resto = parseInt(numeroStr.slice(1));
      
      if (centena === 1) {
        resultado = resto === 0 ? 'CIEN' : 'CIENTO';
      } else if (centena === 5) {
        resultado = 'QUINIENTOS';
      } else if (centena === 9) {
        resultado = 'NOVECIENTOS';
      } else {
        resultado = unidades[centena] + 'CIENTOS';
      }
      
      if (resto > 0) {
        resultado += ' ' + convertirNumeroALetras(resto);
      }
    }
    
    // Agregar decimales
    if (decimales > 0) {
      resultado += ' CON ' + decimales.toString().padStart(2, '0') + '/100';
    }
    
    return resultado;
  };

  useEffect(() => {
    // Agregar estilos de impresión cuando el componente se monta
    const style = document.createElement('style');
    style.innerHTML = `
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
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Limpiar los estilos cuando el componente se desmonta
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const manejarBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    
    // Filtrar ventas por búsqueda
    const ventasFiltradas = ventas.filter(venta => {
      const nombreCompletoCliente = `${venta.clienteNombre} ${venta.clienteApellido}`.toLowerCase();
      return (
        venta.idVenta.toString().includes(valor) ||
        nombreCompletoCliente.includes(valor.toLowerCase()) ||
        venta.metodoPago.toLowerCase().includes(valor.toLowerCase())
      );
    });
    
    setVentasFiltradas(ventasFiltradas);
  };

  const manejarFechaCambio = (fecha) => {
    setFechaSeleccionada(fecha);
    
    if (!fecha) {
      setVentasFiltradas(ventas);
      return;
    }
    
    // Filtrar ventas por fecha
    const fechaSeleccionada = format(new Date(fecha), 'yyyy-MM-dd');
    const ventasFiltradas = ventas.filter(venta => {
      const fechaVenta = format(new Date(venta.fecha), 'yyyy-MM-dd');
      return fechaVenta === fechaSeleccionada;
    });
    
    setVentasFiltradas(ventasFiltradas);
  };

  const filtrarVentas = () => {
    let resultados = [...ventas];

    // Filtrar por nombre o apellido del cliente
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultados = resultados.filter(venta => 
        `${venta.clienteNombre} ${venta.clienteApellido}`.toLowerCase().includes(busquedaLower)
      );
    }

    // Filtrar por fecha
    if (fechaSeleccionada) {
      const fechaSelec = new Date(fechaSeleccionada);
      const fechaSelecStr = format(fechaSelec, 'yyyy-MM-dd');
      resultados = resultados.filter(venta => {
        if (!venta.fecha) return false;
        const fechaVenta = new Date(venta.fecha);
        const fechaVentaStr = format(fechaVenta, 'yyyy-MM-dd');
        return fechaVentaStr === fechaSelecStr;
      });
    }

    setVentasFiltradas(resultados);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFechaSeleccionada(null);
    setVentasFiltradas(ventas);
  };

  // Usar ventas filtradas para mostrar en la tabla
  const ventasAMostrar = (busqueda || fechaSeleccionada) ? ventasFiltradas : ventas;

  // Mostrar mensaje cuando no hay resultados
  const noHayResultados = ventasAMostrar.length === 0 && !loading;

  if (loading && !ventas.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial de Ventas</h1>
          <p className="text-gray-500">Registro de todas las ventas realizadas</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <Text color="red">{error}</Text>
          </div>
        </div>
      )}

      <Card>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between p-4 border-b">
            {/* Buscador por nombre */}
            <div className="flex-1 min-w-[200px] relative">
              <TextInput
                icon={Search}
                placeholder="Buscar por nombre del cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            {/* Selector de fecha con X para limpiar */}
            <div className="min-w-[200px] flex items-center gap-2 relative">
              <DatePicker
                value={fechaSeleccionada}
                onValueChange={date => {
                  const hoy = new Date();
                  hoy.setHours(0, 0, 0, 0);
                  if (date && date > hoy) return;
                  setFechaSeleccionada(date);
                }}
                locale={es}
                maxDate={new Date()}
                placeholder="Filtrar por fecha"
                enableClear={false}
              />
              {fechaSeleccionada && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  onClick={() => setFechaSeleccionada(null)}
                  aria-label="Limpiar filtro fecha"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Fecha</TableHeaderCell>
                <TableHeaderCell>Hora</TableHeaderCell>
                <TableHeaderCell>Cliente</TableHeaderCell>
                <TableHeaderCell>Total</TableHeaderCell>
                <TableHeaderCell>Monto Pagado</TableHeaderCell>
                <TableHeaderCell>Vuelto</TableHeaderCell>
                <TableHeaderCell>Método de Pago</TableHeaderCell>
                <TableHeaderCell>Estado</TableHeaderCell>
                <TableHeaderCell>Acciones</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {noHayResultados ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    No se encontraron ventas para los filtros seleccionados
                  </TableCell>
                </TableRow>
              ) : (
                ventasAMostrar.map((venta) => {
                  let estadoTexto = 'COMPLETADA';
                  let color = 'green';
                  if (venta.estado === false || venta.estado === 'CANCELADA') {
                    estadoTexto = 'CANCELADA';
                    color = 'red';
                  } else if (venta.estado === null || venta.estado === undefined) {
                    estadoTexto = 'PENDIENTE';
                    color = 'yellow';
                  }
                  return (
                    <TableRow key={venta.idVenta}>
                      <TableCell>#{venta.idVenta}</TableCell>
                      <TableCell>{formatearFecha(venta.fecha)}</TableCell>
                      <TableCell>{formatearHora(venta.hora)}</TableCell>
                      <TableCell>{`${venta.clienteNombre} ${venta.clienteApellido}`}</TableCell>
                      <TableCell>S/. {venta.total?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>S/. {venta.montoPagado?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>S/. {venta.vuelto?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{venta.metodoPago}</TableCell>
                      <TableCell>
                        <Badge color={color}>
                          {estadoTexto}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Eye}
                          onClick={() => verDetalle(venta.idVenta)}
                          className="border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-700 bg-transparent px-4 py-2 flex items-center gap-2 font-medium"
                        >
                          Ver Detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-2xl my-4">
            <Card className="dialog-print-content p-6">
              {detalleVentaSeleccionada && (
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

                  {/* Título y Número de Boleta */}
                  <div className="text-center border-b pb-4">
                    <Text className="font-bold text-lg">BOLETA DE VENTA ELECTRÓNICA</Text>
                    <Text className="font-medium">B002-{String(detalleVentaSeleccionada.idVenta).padStart(8, '0')}</Text>
                  </div>

                  {/* Información del Cliente */}
                  <div className="text-sm space-y-2 border-b pb-4">
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                      <Text className="font-medium">Fecha:</Text>
                      <Text>{formatearFecha(detalleVentaSeleccionada.fecha)} {formatearHora(detalleVentaSeleccionada.hora)}</Text>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                      <Text className="font-medium">Cliente:</Text>
                      <Text>{detalleVentaSeleccionada.clienteNombre} {detalleVentaSeleccionada.clienteApellido}</Text>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                      <Text className="font-medium">DNI:</Text>
                      <Text>{detalleVentaSeleccionada.clienteDni || 'Sin DNI'}</Text>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                      <Text className="font-medium">Vendedor:</Text>
                      <Text>{detalleVentaSeleccionada.empleadoNombre} {detalleVentaSeleccionada.empleadoApellido}</Text>
                    </div>
                  </div>

                  {/* Tabla de Productos */}
                  <div className="text-sm">
                    {(() => {
                      // Calcular precios sin IGV y con IGV
                      const IGV_RATE = 0.18;
                      const detalles = detalleVentaSeleccionada.detalles;
                      // Para el desglose
                      const detallesSinIGV = detalles.map(detalle => {
                        const precioUnitSinIGV = detalle.precioUnitario / (1 + IGV_RATE);
                        const subtotalSinIGV = detalle.subtotal / (1 + IGV_RATE);
                        return {
                          ...detalle,
                          precioUnitSinIGV,
                          subtotalSinIGV
                        };
                      });
                      const subtotalSinIGV = detallesSinIGV.reduce((acc, d) => acc + d.subtotalSinIGV, 0);
                      const igv = subtotalSinIGV * IGV_RATE;
                      const total = subtotalSinIGV + igv;
                      return (
                        <>
                          <table className="w-full mb-4">
                            <thead className="border-b">
                              <tr className="text-left [&>th]:py-2 [&>th]:text-xs [&>th]:font-medium [&>th]:text-gray-500">
                                <th>CANT.</th>
                                <th>DESCRIPCIÓN</th>
                                <th className="text-right">P.UNIT</th>
                                <th className="text-right">TOTAL</th>
                              </tr>
                            </thead>
                            <tbody className="[&>tr]:border-b [&>tr]:border-gray-100">
                              {detalles.map((detalle, idx) => (
                                <tr key={detalle.idDetalle || idx} className="[&>td]:py-2">
                                  <td>{detalle.cantidad}</td>
                                  <td>{detalle.productoNombre}</td>
                                  <td className="text-right">S/ {detalle.precioUnitario.toFixed(2)}</td>
                                  <td className="text-right">S/ {detalle.subtotal.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {/* Desglose debajo de la tabla */}
                          <div className="pt-2">
                            <div className="grid grid-cols-2 text-right gap-2 border-t pt-2">
                              <Text className="">TOTAL:</Text>
                              <Text className="">S/ {detalleVentaSeleccionada.detalles.reduce((acc, d) => acc + d.subtotal, 0).toFixed(2)}</Text>
                            </div>
                            <div className="grid grid-cols-2 text-right gap-2">
                              <Text className="">Op. Grabada:</Text>
                              <Text className="">S/ {subtotalSinIGV.toFixed(2)}</Text>
                            </div>
                            <div className="grid grid-cols-2 text-right gap-2">
                              <Text className="">IGV (18%):</Text>
                              <Text className="">S/ {igv.toFixed(2)}</Text>
                            </div>
                            <div className="grid grid-cols-2 text-right gap-2">
                              <Text className="font-bold">IMPORTE TOTAL:</Text>
                              <Text className="font-bold">S/ {total.toFixed(2)}</Text>
                            </div>
                            <Text>SON: {convertirNumeroALetras(total)} SOLES</Text>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Información de Pago */}
                  <div className="text-sm space-y-2 border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Text className="font-medium">Forma de Pago:</Text>
                        <Text>{detalleVentaSeleccionada.metodoPago}</Text>
                      </div>
                      <div>
                        <Text className="font-medium">Monto Pagado:</Text>
                        <Text>S/ {detalleVentaSeleccionada.montoPagado.toFixed(2)}</Text>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">                      <div>
                        <Text className="font-medium">Vuelto:</Text>
                        <Text>S/ {detalleVentaSeleccionada.vuelto.toFixed(2)}</Text>
                      </div>
                    </div>
                  </div>
                  {/* Botones de Acción */}
                  <div className="flex justify-between pt-6 no-print">
                    {/* Botón cancelar venta solo si la venta no está cancelada */}
                    <div>
                      {detalleVentaSeleccionada && detalleVentaSeleccionada.estado !== false && detalleVentaSeleccionada.estado !== 'CANCELADA' && (
                        <Button
                          size="lg"
                          onClick={() => cancelarVenta(detalleVentaSeleccionada.idVenta)}
                          disabled={cancelandoVenta}
                          className="px-8 border border-red-600 text-red-600 bg-transparent hover:bg-red-50 hover:text-red-700"
                        >
                          {cancelandoVenta ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Cancelando...
                            </>
                          ) : (
                            'Cancelar Venta'
                          )}
                        </Button>
                      )}
                    </div>
                    <div className="flex space-x-4">
                      <Button
                        size="lg"
                        onClick={cerrarModal}
                        className="px-8 border border-gray-400 text-gray-700 bg-transparent hover:bg-gray-100 hover:text-gray-900"
                      >
                        Cerrar
                      </Button>
                      <Button
                        size="lg"
                        icon={Printer}
                        onClick={imprimirBoleta}
                        className="px-8 border border-gray-400 text-gray-700 bg-transparent hover:bg-gray-100 hover:text-gray-900"
                      >
                        Imprimir
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

export default ListaPage;

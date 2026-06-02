import React, { useState, useEffect } from 'react';
import { inscripcionAPI } from '../../services/InscripcionAPI';
import logoImage from '../../../../assets/LOGO BUSSTER GYM.png';
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
  UserCheck,
  CalendarDays,
  Ban,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { showConfirmDeleteToast } from '../../../../shared/components/ConfirmDeleteToast';


const ListaInscripcionesPage = () => {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detalleInscripcionSeleccionada, setDetalleInscripcionSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cancelandoInscripcion, setCancelandoInscripcion] = useState(false);
  // Filtros
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroFecha, setFiltroFecha] = useState(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return hoy;
  });


  useEffect(() => {
    cargarInscripciones();
  }, []);
  // Filtrar inscripciones por nombre y fecha
  const inscripcionesFiltradas = inscripciones.filter(inscripcion => {
    // Filtro por nombre (cliente)
    const nombreCompleto = `${inscripcion.clienteNombre || ''} ${inscripcion.clienteApellido || ''}`.toLowerCase();
    const nombreMatch = filtroNombre.trim() === '' || nombreCompleto.includes(filtroNombre.trim().toLowerCase());
    // Filtro por fecha (fecha de inscripción)
    let fechaMatch = true;
    if (filtroFecha && inscripcion.fechaInscripcion) {
      const fechaInsc = new Date(inscripcion.fechaInscripcion);
      const filtro = new Date(filtroFecha);
      // Comparar año, mes y día en UTC para evitar desfases de zona horaria local
      fechaMatch = (
        fechaInsc.getUTCFullYear() === filtro.getUTCFullYear() &&
        fechaInsc.getUTCMonth() === filtro.getUTCMonth() &&
        fechaInsc.getUTCDate() === filtro.getUTCDate()
      );
    }
    return nombreMatch && fechaMatch;
  });

  const cargarInscripciones = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Iniciando carga de inscripciones...');
      
      const response = await inscripcionAPI.listarTodasLasInscripciones();
      console.log('Datos de inscripciones del servidor:', response);
      
      if (!Array.isArray(response)) {
        console.error('La respuesta no es un array:', response);
        throw new Error('Formato de respuesta inválido');
      }
      
      // Mostrar cada inscripción en detalle para debugging
      response.forEach((inscripcion, index) => {
        console.log(`Inscripción ${index + 1}:`, {
          ID: inscripcion.idInscripcion,
          Cliente: `${inscripcion.clienteNombre} ${inscripcion.clienteApellido}`,
          Plan: inscripcion.nombrePlan,
          FechaInicio: inscripcion.fechaInicio,
          Estado: inscripcion.estado,
          Monto: inscripcion.monto
        });
      });

      const inscripcionesFormateadas = response.map(inscripcion => ({
        idInscripcion: inscripcion.idInscripcion,
        clienteNombre: inscripcion.clienteNombre || 'Sin nombre',
        clienteApellido: inscripcion.clienteApellido || '',
        clienteDni: inscripcion.clienteDni || '(Sin DNI)',
        recepcionistaNombre: inscripcion.recepcionistaNombre || '(Recepcionista no registrado)',
        recepcionistaApellido: inscripcion.recepcionistaApellido || '',
        recepcionistaDni: inscripcion.recepcionistaDni || '(Sin DNI)',
        fechaInscripcion: inscripcion.fechaInscripcion,
        fechaInicio: inscripcion.fechaInicio,
        fechaFin: inscripcion.fechaFin,
        monto: inscripcion.monto || 0,
        nombrePlan: inscripcion.nombrePlan || 'Plan no especificado',
        duracionPlan: inscripcion.duracionPlan || 0,
        precioPlan: inscripcion.precioPlan || 0,
        estado: inscripcion.estado || 'ACTIVA',
        detalles: inscripcion.detalles || [],
        idPago: inscripcion.idPago,
        montoPagado: inscripcion.montoPagado || 0,
        vuelto: inscripcion.vuelto || 0,
        metodoPago: inscripcion.metodoPago || 'No especificado'
      }));

      console.log('Inscripciones formateadas:', inscripcionesFormateadas);
      setInscripciones(inscripcionesFormateadas);
      
    } catch (err) {
      console.error('Error al cargar inscripciones:', err);
      setError('Error al cargar el historial de inscripciones: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = (inscripcionId) => {
    try {
      console.log('Mostrando detalle de inscripción:', inscripcionId);
      
      // Buscar la inscripción en los datos que ya tenemos
      const inscripcion = inscripciones.find(i => i.idInscripcion === inscripcionId);
      
      if (!inscripcion) {
        throw new Error('Inscripción no encontrada');
      }

      // Usar los datos existentes
      const detalleValidado = {
        ...inscripcion,
        detalles: inscripcion.detalles || [], // Si no hay detalles, usar array vacío
        clienteDni: inscripcion.clienteDni || '(Sin DNI)',
        recepcionistaNombre: inscripcion.recepcionistaNombre || '(Recepcionista no registrado)',
        recepcionistaApellido: inscripcion.recepcionistaApellido || '',
        recepcionistaDni: inscripcion.recepcionistaDni || '(Sin DNI)'
      };

      console.log('Detalle de inscripción:', detalleValidado);
      
      setDetalleInscripcionSeleccionada(detalleValidado);
      setModalAbierto(true);
    } catch (err) {
      console.error('Error al mostrar detalle de inscripción:', err);
      setError(`Error al mostrar el detalle de la inscripción: ${err.message}`);
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setDetalleInscripcionSeleccionada(null);
  };

  const imprimirComprobante = () => {
    window.print();
  };

  const cancelarInscripcion = async (idInscripcion) => {
    showConfirmDeleteToast({
      message: '¿Estás seguro de que deseas cancelar esta inscripción?',
      onConfirm: async () => {
        try {
          setCancelandoInscripcion(true);
          setError(null);
          console.log('Cancelando inscripción:', idInscripcion);
          await inscripcionAPI.cancelarInscripcion(idInscripcion);
          setInscripciones(prev => prev.map(inscripcion => 
            inscripcion.idInscripcion === idInscripcion 
              ? { ...inscripcion, estado: 'CANCELADA' }
              : inscripcion
          ));
          if (detalleInscripcionSeleccionada && detalleInscripcionSeleccionada.idInscripcion === idInscripcion) {
            setDetalleInscripcionSeleccionada(prev => ({
              ...prev,
              estado: 'CANCELADA'
            }));
          }
          console.log('Inscripción cancelada exitosamente');
        } catch (err) {
          console.error('Error al cancelar inscripción:', err);
          setError(`Error al cancelar la inscripción: ${err.message}`);
        } finally {
          setCancelandoInscripcion(false);
        }
      }
    });
  };

  const formatearFecha = (fecha) => {
    try {
      if (!fecha) return 'Sin fecha';
      
      // Si la fecha viene como string, extraer solo la parte de fecha (YYYY-MM-DD)
      let fechaString = fecha;
      if (typeof fecha === 'string' && fecha.includes('T')) {
        fechaString = fecha.split('T')[0];
      }
      
      // Crear fecha usando solo año, mes y día para evitar problemas de zona horaria
      const partesFecha = fechaString.split('-');
      if (partesFecha.length === 3) {
        const año = parseInt(partesFecha[0]);
        const mes = parseInt(partesFecha[1]) - 1; // Los meses en JS son 0-indexados
        const dia = parseInt(partesFecha[2]);
        
        const date = new Date(año, mes, dia);
        return format(date, 'dd/MM/yyyy', { locale: es });
      }
      
      // Fallback: usar la fecha directamente
      const date = new Date(fecha);
      return format(date, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };


  const getEstadoBadgeColor = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'ACTIVA':
        return 'green';
      case 'VENCIDA':
        return 'red';
      case 'FINALIZADO':
        return 'red';
      case 'SUSPENDIDA':
        return 'yellow';
      case 'CANCELADA':
      case 'CANCELADO':
        return 'gray';
      default:
        return 'blue';
    }
  };

  // Función para formatear duración correctamente (singular/plural)
  const formatearDuracion = (duracion) => {
    return duracion === 1 ? `${duracion} día` : `${duracion} días`;
  };

  // Función para filtrar horarios para planes de 1 día (fechas de inicio y fin de la inscripción)
  const filtrarHorariosPlan1Dia = (detalles, duracionPlan, fechaInicio, fechaFin) => {
    console.log('Filtrando horarios para plan de 1 día - Fecha inicio:', fechaInicio, 'Fecha fin:', fechaFin);
    
    if (duracionPlan !== 1) {
      return detalles; // Si no es plan de 1 día, devolver todos los horarios
    }

    // Obtener los días de la semana correspondientes a la inscripción
    const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const diasValidosSet = new Set();

    try {
      // Procesar fecha de inicio
      if (fechaInicio) {
        // Extraer solo la parte de la fecha (sin hora) y crear objeto Date
        const fechaInicioStr = fechaInicio.includes('T') ? fechaInicio.split('T')[0] : fechaInicio;
        const fechaInicioDate = new Date(fechaInicioStr + 'T00:00:00');
        const diaInicio = diasSemana[fechaInicioDate.getDay()];
        console.log('Día de inicio calculado:', diaInicio);
        if (diaInicio) diasValidosSet.add(diaInicio);
      }

      // Procesar fecha de fin
      if (fechaFin) {
        // Extraer solo la parte de la fecha (sin hora) y crear objeto Date
        const fechaFinStr = fechaFin.includes('T') ? fechaFin.split('T')[0] : fechaFin;
        const fechaFinDate = new Date(fechaFinStr + 'T00:00:00');
        const diaFin = diasSemana[fechaFinDate.getDay()];
        console.log('Día de fin calculado:', diaFin);
        if (diaFin) diasValidosSet.add(diaFin);
      }
    } catch (error) {
      console.error('Error al procesar fechas para filtro de horarios:', error);
      // En caso de error, devolver todos los horarios
      return detalles;
    }

    // Si no se pudieron determinar los días válidos, devolver todos los horarios
    if (diasValidosSet.size === 0) {
      console.warn('No se pudieron determinar días válidos para el filtro. Mostrando todos los horarios.');
      return detalles;
    }

    // Convertir a array para facilitar la comparación
    const diasValidos = Array.from(diasValidosSet);
    console.log('Días válidos para filtro:', diasValidos);

    const horariosFiltrados = detalles.filter(detalle => {
      const diaDetalle = detalle.dia?.toUpperCase();
      
      // Normalizar el día para quitar tildes
      const diaNormalizado = diaDetalle
        ?.replace('Í', 'I')  // MIÉRCOLES -> MIERCOLES
        ?.replace('Á', 'A'); // SÁBADO -> SABADO
      
      const esValido = diasValidos.includes(diaDetalle) || diasValidos.includes(diaNormalizado);
      
      if (esValido) {
        console.log(`✓ Horario incluido: ${detalle.dia} ${detalle.horaInicio}-${detalle.horaFin} (${detalle.instructorNombre})`);
      }
      
      return esValido;
    });

    console.log(`Resultado: ${horariosFiltrados.length} de ${detalles.length} horarios filtrados`);
    
    return horariosFiltrados;
  };


  useEffect(() => {
    // Agregar estilos de impresión cuando el componente se monta
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          size: A4;
          margin: 0.5in;
        }
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
          font-size: 12px;
          line-height: 1.3;
          color: black !important;
        }
        .dialog-print-content img {
          max-height: 40px !important;
        }
        .dialog-print-content .text-xl {
          font-size: 16px !important;
        }
        .dialog-print-content .text-lg {
          font-size: 14px !important;
        }
        .dialog-print-content .text-sm {
          font-size: 11px !important;
        }
        .dialog-print-content .space-y-4 > * + * {
          margin-top: 8px !important;
        }
        .dialog-print-content .space-y-2 > * + * {
          margin-top: 4px !important;
        }
        .dialog-print-content .pb-4 {
          padding-bottom: 8px !important;
        }
        .dialog-print-content .pt-4 {
          padding-top: 8px !important;
        }
        .dialog-print-content .py-2 {
          padding-top: 3px !important;
          padding-bottom: 3px !important;
        }
        .dialog-print-content table {
          font-size: 10px !important;
        }
        .dialog-print-content th {
          font-size: 9px !important;
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


  if (loading && !inscripciones.length) {
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
          <h1 className="text-2xl font-bold text-gray-900">Historial de Inscripciones</h1>
          <p className="text-gray-500">Registro de todas las inscripciones realizadas</p>
        </div>
      </div>

      {/* Filtros avanzados estilo ListaPage */}
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
              ×
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

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <Text color="red">{error}</Text>
          </div>
        </div>
      )}

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>ID</TableHeaderCell>
              <TableHeaderCell>Cliente</TableHeaderCell>
              <TableHeaderCell>Plan</TableHeaderCell>
              <TableHeaderCell>Fecha Inscripción</TableHeaderCell>
              <TableHeaderCell>Fecha Inicio</TableHeaderCell>
              <TableHeaderCell>Fecha Fin</TableHeaderCell>
              <TableHeaderCell>Monto</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inscripcionesFiltradas.map((inscripcion) => (
              <TableRow key={inscripcion.idInscripcion}>
                <TableCell>#{inscripcion.idInscripcion}</TableCell>
                <TableCell>{`${inscripcion.clienteNombre} ${inscripcion.clienteApellido}`}</TableCell>
                <TableCell>{inscripcion.nombrePlan}</TableCell>
                <TableCell>{formatearFecha(inscripcion.fechaInscripcion)}</TableCell>
                <TableCell>{formatearFecha(inscripcion.fechaInicio)}</TableCell>
                <TableCell>{formatearFecha(inscripcion.fechaFin)}</TableCell>
                <TableCell>S/. {inscripcion.monto?.toFixed(2) || '0.00'}</TableCell>
                <TableCell>
                  <Badge color={getEstadoBadgeColor(inscripcion.estado)}>
                    {inscripcion.estado || 'ACTIVA'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Eye}
                    onClick={() => verDetalle(inscripcion.idInscripcion)}
                    className="border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-700 bg-transparent px-4 py-2 flex items-center gap-2 font-medium"
                  >
                    Ver Detalle
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {inscripcionesFiltradas.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4 text-gray-500">
                  No hay inscripciones registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-3xl my-4">
            <Card className="dialog-print-content p-4">
              {detalleInscripcionSeleccionada && (
                <div className="space-y-3 ml-12">
                  {/* Encabezado de la Empresa */}
                  <div className="text-center border-b pb-3">
                    <img 
                      src={logoImage} 
                      alt="Logo Busster Gym" 
                      className="h-12 mx-auto mb-1"
                    />
                    <Text className="font-bold text-lg">BUSTER GYM S.A.C</Text>
                    <Text className="text-gray-600 text-xs">R.U.C. 20100100100 | Nuevo Chimbote, Los cipreces O-25 | Telf: (01) 123-4567</Text>
                  </div>

                  {/* Título y Número de Comprobante */}
                  <div className="text-center border-b pb-3">
                    <Text className="font-bold text-base">COMPROBANTE DE INSCRIPCIÓN</Text>
                    <Text className="font-medium text-sm">INS-{String(detalleInscripcionSeleccionada.idInscripcion).padStart(8, '0')}</Text>
                  </div>

                  {/* Información en dos columnas */}
                  <div className="grid grid-cols-2 gap-4 text-xs border-b pb-3">
                    {/* Columna izquierda - Cliente y Plan */}
                    <div className="space-y-1">
                      <Text className="font-medium text-sm">DATOS DEL CLIENTE:</Text>
                      <div className="space-y-1">
                        <div className="flex">
                          <span className="font-medium w-20">F. Inscripción:</span>
                          <span>{formatearFecha(detalleInscripcionSeleccionada.fechaInscripcion)}</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium w-20">Cliente:</span>
                          <span>{detalleInscripcionSeleccionada.clienteNombre} {detalleInscripcionSeleccionada.clienteApellido}</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium w-20">DNI:</span>
                          <span>{detalleInscripcionSeleccionada.clienteDni || 'Sin DNI'}</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium w-20">Plan:</span>
                          <span>{detalleInscripcionSeleccionada.nombrePlan}</span>
                        </div>
                      </div>
                    </div>

                    {/* Columna derecha - Fechas y Empleado */}
                    <div className="space-y-1">
                      <Text className="font-medium text-sm">INFORMACIÓN GENERAL:</Text>
                      <div className="space-y-1">
                        <div className="flex">
                          <span className="font-medium w-20">Duración:</span>
                          <span>{formatearDuracion(detalleInscripcionSeleccionada.duracionPlan)}</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium w-20">F. Inicio:</span>
                          <span>{formatearFecha(detalleInscripcionSeleccionada.fechaInicio)}</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium w-20">F. Fin:</span>
                          <span>{formatearFecha(detalleInscripcionSeleccionada.fechaFin)}</span>
                        </div>
                        {detalleInscripcionSeleccionada.recepcionistaNombre && (
                          <div className="flex">
                            <span className="font-medium w-20">Vendedor:</span>
                            <span>{detalleInscripcionSeleccionada.recepcionistaNombre} {detalleInscripcionSeleccionada.recepcionistaApellido}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tabla de Horarios compacta */}
                  {detalleInscripcionSeleccionada.detalles && detalleInscripcionSeleccionada.detalles.length > 0 && (
                    <div className="text-xs">
                      <Text className="font-medium mb-2 text-sm">HORARIOS ASIGNADOS:</Text>
                      {(() => {
                        // Filtrar horarios si es plan de 1 día
                        const horariosFiltrados = filtrarHorariosPlan1Dia(
                          detalleInscripcionSeleccionada.detalles, 
                          detalleInscripcionSeleccionada.duracionPlan,
                          detalleInscripcionSeleccionada.fechaInicio,
                          detalleInscripcionSeleccionada.fechaFin
                        );

                        // Si es plan de 1 día y se filtraron horarios, mostrar nota informativa
                        const esPlan1Dia = detalleInscripcionSeleccionada.duracionPlan === 1;
                        const seFiltro = esPlan1Dia && horariosFiltrados.length < detalleInscripcionSeleccionada.detalles.length;

                        return (
                          <>
                            {seFiltro && (
                              <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                <Text className="text-blue-700">
                                  📅 Plan de 1 día - Mostrando horarios de las fechas de la inscripción ({horariosFiltrados.length} de {detalleInscripcionSeleccionada.detalles.length} horarios)
                                </Text>
                              </div>
                            )}
                            
                            <table className="w-full text-xs border-collapse">
                              <thead>
                                <tr className="border-b bg-gray-50">
                                  <th className="text-left py-1 px-2 font-medium">INSTRUCTOR</th>
                                  <th className="text-left py-1 px-2 font-medium">DÍA</th>
                                  <th className="text-left py-1 px-2 font-medium">INICIO</th>
                                  <th className="text-left py-1 px-2 font-medium">FIN</th>
                                </tr>
                              </thead>
                              <tbody>
                                {horariosFiltrados
                                  .sort((a, b) => {
                                    // Definir el orden de los días de la semana
                                    const ordenDias = {
                                      'LUNES': 1,
                                      'MARTES': 2,
                                      'MIERCOLES': 3,
                                      'JUEVES': 4,
                                      'VIERNES': 5,
                                      'SABADO': 6,
                                      'DOMINGO': 7
                                    };
                                    
                                    // Primero ordenar por día de la semana
                                    const diaA = ordenDias[a.dia?.toUpperCase()?.replace('Í', 'I')?.replace('Á', 'A')] || 8;
                                    const diaB = ordenDias[b.dia?.toUpperCase()?.replace('Í', 'I')?.replace('Á', 'A')] || 8;
                                    
                                    if (diaA !== diaB) {
                                      return diaA - diaB;
                                    }
                                    
                                    // Si es el mismo día, ordenar por hora de inicio
                                    const horaA = a.horaInicio || '00:00';
                                    const horaB = b.horaInicio || '00:00';
                                    
                                    return horaA.localeCompare(horaB);
                                  })
                                  .map((detalle, index) => (
                                  <tr key={index} className="border-b border-gray-100">
                                    <td className="py-1 px-2">{detalle.instructorNombre} {detalle.instructorApellido}</td>
                                    <td className="py-1 px-2">{detalle.dia}</td>
                                    <td className="py-1 px-2">{detalle.horaInicio}</td>
                                    <td className="py-1 px-2">{detalle.horaFin}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Información de pago y totales en una sola sección */}
                  <div className="border-t pt-3">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      {/* Información de Pago */}
                      {detalleInscripcionSeleccionada.idPago && (
                        <div>
                          <Text className="font-medium text-sm mb-1">INFORMACIÓN DE PAGO:</Text>
                          <div className="space-y-1">
                            <div className="flex">
                              <span className="font-medium w-20">Método:</span>
                              <span>{detalleInscripcionSeleccionada.metodoPago}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-20">Pagado:</span>
                              <span>S/ {detalleInscripcionSeleccionada.montoPagado?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-20">Vuelto:</span>
                              <span>S/ {detalleInscripcionSeleccionada.vuelto?.toFixed(2) || '0.00'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Totales */}
                      <div>
                        <Text className="font-medium text-sm mb-1">TOTALES:</Text>
                        <div className="space-y-1">
                          <div className="flex">
                            <span className="font-bold w-20">MONTO:</span>
                            <span className="font-bold">S/ {detalleInscripcionSeleccionada.monto?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-20">Estado:</span>
                            <Badge color={getEstadoBadgeColor(detalleInscripcionSeleccionada.estado)} size="xs">
                              {detalleInscripcionSeleccionada.estado || 'ACTIVA'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex justify-between pt-4 no-print">
                    {/* Botón de cancelar - solo si no está cancelada o finalizada */}
                    <div>
                      {(detalleInscripcionSeleccionada.estado?.toUpperCase() === 'ACTIVA' || detalleInscripcionSeleccionada.estado?.toUpperCase() === 'ACTIVO') && (
                        <Button
                          size="md"
                          variant="secondary"
                          icon={Ban}
                          onClick={() => cancelarInscripcion(detalleInscripcionSeleccionada.idInscripcion)}
                          disabled={cancelandoInscripcion}
                          className="px-6 text-red-600 border-red-300 hover:bg-red-50"
                        >
                          {cancelandoInscripcion ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Cancelando...
                            </>
                          ) : (
                            'Cancelar Inscripción'
                          )}
                        </Button>
                      )}
                    </div>
                    
                    {/* Botones de cerrar e imprimir */}
                    <div className="flex space-x-3">
                      <Button
                        size="md"
                        variant="secondary"
                        onClick={cerrarModal}
                        className="px-6 border border-gray-400 text-gray-700 bg-transparent hover:bg-gray-100 hover:text-gray-900"
                      >
                        Cerrar
                      </Button>
                      <Button
                        size="md"
                        variant="secondary"
                        icon={Printer}
                        onClick={imprimirComprobante}
                        className="px-6 border border-gray-400 text-gray-700 bg-transparent hover:bg-gray-100 hover:text-gray-900"
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

export default ListaInscripcionesPage;

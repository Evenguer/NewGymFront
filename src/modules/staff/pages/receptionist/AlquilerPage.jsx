import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { alquilerAPI } from '../../services/alquilerAPI';
import { 
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Button,
  TextInput,
  Title,
  Flex,
  Text,
  SearchSelect,
  SearchSelectItem,
  NumberInput,
  DatePicker
} from '@tremor/react';
import { 
  Search, 
  ShoppingCart, 
  CreditCard, 
  User, 
  Package, 
  Plus, 
  Trash2, 
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import {
  Snackbar,
  Alert
} from '@mui/material';

const AlquilerPage = () => {
  const { isAuthenticated } = useAuth();
  const [dni, setDni] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [formData, setFormData] = useState({
    clienteId: '',
    fechaFin: null // Inicialmente null hasta llegar al paso 2
  });
  // Ya no necesitamos el estado de empleados
  // const [empleados, setEmpleados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [alquilerCreado, setAlquilerCreado] = useState(null);
  const [piezas, setPiezas] = useState([]);
  const [detallesAlquiler, setDetallesAlquiler] = useState([]);
  const [piezaSeleccionada, setPiezaSeleccionada] = useState('');
  const [piezaSeleccionadaObj, setPiezaSeleccionadaObj] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [busquedaPieza, setBusquedaPieza] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [montoPagado, setMontoPagado] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [totalAlquiler, setTotalAlquiler] = useState(0);
  const [botonCrearBloqueado, setBotonCrearBloqueado] = useState(false);
  const [pasoActual, setPasoActual] = useState(1); // 1: Datos básicos, 2: Equipos, 3: Pago, 4: Confirmación

  // Cargar empleados y clientes al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Ya no necesitamos obtener la lista de empleados
        const clientesData = await alquilerAPI.obtenerClientes();

        console.log('Datos de clientes recibidos:', clientesData);

        // Procesar clientes
        const clientesFormateados = clientesData
          .filter(cliente => cliente && cliente.estado && cliente.id)
          .map(cliente => ({
            id: `cli-${cliente.id}`,
            clienteId: cliente.id,
            nombre: cliente.nombre || '',
            apellidos: cliente.apellidos || '',
            nombreCompleto: `${cliente.nombre || ''} ${cliente.apellidos || ''}`.trim(),
            dni: cliente.dni || ''
          }));

        console.log('Clientes formateados:', clientesFormateados);
        setClientes(clientesFormateados);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setFormErrors({ fetch: 'Error al cargar los datos: ' + err.message });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Manejar cambios en los inputs del formulario


  // Validar todos los campos requeridos

  const validateForm = () => {
    const errors = {};
    if (!clienteEncontrado) {
      errors.cliente = 'Debe buscar y seleccionar un cliente por DNI';
    }
    if (!formData.clienteId) {
      errors.clienteId = 'Debe seleccionar un cliente';
    }
    // No validamos fechaFin en el paso 1, se hará en el paso 2
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    
    // Formatear la fecha para usarla posteriormente (YYYY-MM-DD)
    const formattedFechaFin = formData.fechaFin instanceof Date 
      ? formData.fechaFin.toISOString().split('T')[0]
      : (typeof formData.fechaFin === 'string' ? formData.fechaFin : '');
      
    console.log('Fecha fin formateada:', formattedFechaFin);

    // Preparar datos del alquiler temporales
    const clienteId = parseInt(formData.clienteId.replace('cli-', ''));
    
    // Validar que los IDs sean números válidos
    if (isNaN(clienteId)) {
      setFormErrors({ submit: 'ID de cliente inválido' });
      showNotification('ID de cliente inválido', 'error');
      return;
    }
    
    // Estructura temporal del alquiler (sin enviar a backend todavía)
    const alquilerTemp = {
      idAlquiler: Date.now(), // ID temporal para identificar el alquiler
      clienteId: clienteId,
      fechaFin: formattedFechaFin
    };
    
    console.log('Datos de alquiler preparados (no guardados aún):', alquilerTemp);
    
    // Guardar temporalmente el alquiler creado en el estado
    setAlquilerCreado(alquilerTemp);
    
    // Solo avanzamos al siguiente paso, sin guardar todavía en el backend
    setAlquilerCreado(alquilerTemp);
    
    // Avanzar al paso 2 y cargar piezas
    setPasoActual(2);
    setBotonCrearBloqueado(true); 
    
    // Cargar piezas para el siguiente paso
    await cargarPiezas();
    
    showNotification('Datos registrados. Continúe agregando los elementos del alquiler', 'success');
  };

  // Función para cargar piezas disponibles
  const cargarPiezas = async () => {
    try {
      setLoading(true);
      const piezasData = await alquilerAPI.listarPiezas();
      console.log('Piezas disponibles:', piezasData);
      
      // Verificar que piezasData es un array
      if (!Array.isArray(piezasData)) {
        console.error('Error: piezasData no es un array', piezasData);
        throw new Error('La respuesta de piezas no es un array');
      }
      
      // Filtrar piezas con stock disponible
      const piezasDisponibles = piezasData
        .filter(pieza => pieza && typeof pieza === 'object' && pieza.estado && pieza.stock > 0)
        .map(pieza => ({
          id: pieza.idPieza,
          nombre: pieza.nombre,
          precioAlquiler: pieza.precioAlquiler,
          stock: pieza.stock
        }));
      
      console.log('Piezas filtradas y formateadas:', piezasDisponibles);
      setPiezas(piezasDisponibles);
    } catch (error) {
      console.error('Error al cargar piezas:', error);
      setFormErrors(prev => ({ ...prev, piezas: 'Error al cargar las piezas: ' + error.message }));
      
      // En caso de error, establecer un array vacío para evitar errores en la interfaz
      setPiezas([]);
      
      // Mostrar snackbar de error
      setSnackbarMessage('Error al cargar las piezas disponibles. Por favor, intenta de nuevo.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Cargar piezas cuando se muestre el panel de detalles

  // Función para agregar detalle
  const agregarDetalle = () => {
    console.log('Intentando agregar detalle. Pieza seleccionada:', piezaSeleccionadaObj);

    if (!piezaSeleccionadaObj) {
      setFormErrors(prev => ({
        ...prev,
        detalles: 'Seleccione una pieza'
      }));
      return;
    }

    // Verificar stock disponible
    if (cantidad > piezaSeleccionadaObj.stock) {
      setFormErrors(prev => ({
        ...prev,
        detalles: `Stock insuficiente. Solo hay ${piezaSeleccionadaObj.stock} disponibles.`
      }));
      return;
    }

    // Verificar si la pieza ya está en los detalles
    const detalleExistente = detallesAlquiler.find(d => d.piezaId === piezaSeleccionadaObj.id);
    
    if (detalleExistente) {
      // Si la pieza ya existe, verificar si la nueva cantidad total excede el stock
      const cantidadTotal = detalleExistente.cantidad + cantidad;
      if (cantidadTotal > piezaSeleccionadaObj.stock) {
        setFormErrors(prev => ({
          ...prev,
          detalles: `La cantidad total excede el stock disponible (${piezaSeleccionadaObj.stock})`
        }));
        return;
      }

      // Actualizar la cantidad del detalle existente
      setDetallesAlquiler(detallesAlquiler.map(d => 
        d.piezaId === piezaSeleccionadaObj.id
          ? { ...d, cantidad: cantidadTotal }
          : d
      ));
    } else {
      // Crear nuevo detalle
      const nuevoDetalle = {
        piezaId: piezaSeleccionadaObj.id,
        cantidad: parseInt(cantidad),
        pieza: {
          id: piezaSeleccionadaObj.id,
          nombre: piezaSeleccionadaObj.nombre,
          precioAlquiler: piezaSeleccionadaObj.precioAlquiler
        }
      };

      console.log('Nuevo detalle a agregar:', nuevoDetalle);
      setDetallesAlquiler(prev => [...prev, nuevoDetalle]);
    }

    setPiezaSeleccionadaObj(null);
    setPiezaSeleccionada('');
    setCantidad(1);
    setFormErrors(prev => ({ ...prev, detalles: '' }));
    showNotification('Equipo agregado correctamente', 'success');
  };

  // Función para seleccionar pieza
  const seleccionarPieza = (piezaId) => {
    try {
      const pieza = piezas.find(p => p.id === piezaId);
      if (!pieza) {
        showNotification('Equipo no encontrado', 'error');
        return;
      }
      
      setPiezaSeleccionadaObj(pieza);
      setPiezaSeleccionada(piezaId.toString());
      setCantidad(1);
      showNotification(`Equipo "${pieza.nombre}" seleccionado`, 'success');
    } catch (error) {
      console.error('Error al seleccionar pieza:', error);
      showNotification('Error al seleccionar el equipo', 'error');
    }
  };

  // Función para filtrar piezas
  const piezasFiltradas = piezas.filter(pieza => {
    const coincideBusqueda = pieza.nombre.toLowerCase().includes(busquedaPieza.toLowerCase());
    return coincideBusqueda;
  });

  // Eliminar un detalle del alquiler
  const eliminarDetalle = (piezaId) => {
    try {
      setDetallesAlquiler(prev => prev.filter(d => d.piezaId !== piezaId));
      showNotification('Pieza eliminada del detalle', 'success');
    } catch (error) {
      console.error('Error al eliminar detalle:', error);
      showNotification('Error al eliminar la pieza', 'error');
    }
  };

  // Actualizar cantidad de un detalle
  const actualizarCantidad = (piezaId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) return;
    
    // Buscar la pieza para verificar stock
    const pieza = piezas.find(p => p.id === piezaId);
    if (!pieza) return;
    
    // Limitar la cantidad al stock disponible
    if (nuevaCantidad > pieza.stock) {
      showNotification(`Cantidad máxima disponible: ${pieza.stock}`, 'warning');
      nuevaCantidad = pieza.stock;
    }
    
    setDetallesAlquiler(detallesAlquiler.map(d => 
      d.piezaId === piezaId ? { ...d, cantidad: nuevaCantidad } : d
    ));
  };

  // Preparar para avanzar al paso de pago
  const guardarDetalles = async () => {
    if (detallesAlquiler.length === 0) {
      showNotification('Error: No hay elementos seleccionados para el alquiler', 'error');
      return;
    }

    if (!formData.fechaFin) {
      setFormErrors({ fechaFin: 'Debe seleccionar una fecha de fin del alquiler' });
      showNotification('Error: Debe seleccionar una fecha de fin del alquiler', 'error');
      return;
    }

    if (!validarFechaFutura(formData.fechaFin)) {
      setFormErrors({ fechaFin: 'La fecha de fin debe ser igual o posterior a la fecha actual' });
      showNotification('Error: La fecha de fin debe ser igual o posterior a la fecha actual', 'error');
      return;
    }

    try {
      setLoading(true);
      
      // Calcular el total del alquiler basado en días
      const total = await calcularPrecioConDias();
      
      setTotalAlquiler(total);
      setPasoActual(3); // Avanzar al paso de pago
      
      showNotification('Elementos agregados. Continúe con el registro del pago', 'success');
    } catch (error) {
      console.error('Error al procesar los detalles:', error);
      showNotification(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Finalizar todo el proceso de alquiler (guardar todo a la vez)
  const registrarPago = async () => {
    if (!montoPagado || parseFloat(montoPagado) <= 0) {
      showNotification('Debe ingresar un monto válido', 'error');
      return;
    }

    if (parseFloat(montoPagado) < totalAlquiler) {
      showNotification('El monto pagado es menor que el total del alquiler', 'error');
      return;
    }

    setLoading(true);

    try {
      // Formatear la fecha para enviarla al backend (YYYY-MM-DD)
      const formattedFechaFin = formData.fechaFin instanceof Date 
        ? formData.fechaFin.toISOString().split('T')[0]
        : (typeof formData.fechaFin === 'string' ? formData.fechaFin : '');
        
      console.log('Fecha fin formateada para pago:', formattedFechaFin);

      // Calcular días para incluir en el cálculo
      const fechaInicio = new Date();
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(formData.fechaFin);
      fechaFin.setHours(0, 0, 0, 0);
      const diasAlquiler = calcularDias(fechaInicio, fechaFin);

      // Formatear los detalles en el formato esperado por el backend incluyendo información de días y precio
      const detallesFormateados = detallesAlquiler.map(detalle => ({
        piezaId: detalle.piezaId,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.pieza.precioAlquiler,
        diasAlquiler: diasAlquiler,
        subtotal: detalle.cantidad * detalle.pieza.precioAlquiler * diasAlquiler
      }));
      
      console.log('Detalles formateados con días:', detallesFormateados);
      
      // Preparar la estructura completa del alquiler para enviarla en una sola llamada
      const alquilerCompleto = {
        clienteId: parseInt(formData.clienteId.replace('cli-', '')),
        fechaFin: formattedFechaFin,
        diasAlquiler: diasAlquiler, // Agregar días calculados
        detalles: detallesFormateados,
        montoPagado: parseFloat(montoPagado),
        metodoPago: metodoPago,
        totalCalculado: totalAlquiler // Agregar el total calculado en el frontend
      };
      
      console.log('Enviando alquiler completo al backend:', alquilerCompleto);
      
      // Llamar al nuevo endpoint que procesa todo en una sola transacción
      const response = await alquilerAPI.crearAlquilerCompleto(alquilerCompleto);
      
      console.log('Alquiler completado:', response);
      setAlquilerCreado(response); // Guardamos la respuesta que incluye el ID y todos los detalles
      setPasoActual(4); // Avanzar al paso de confirmación
      
      showNotification('Alquiler registrado exitosamente', 'success');
      
    } catch (error) {
      console.error('Error al registrar pago:', error);
      showNotification(`Error al registrar pago: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar cliente por DNI
  const buscarClientePorDNI = () => {
    if (!dni || dni.trim() === '') {
      setClienteEncontrado(null);
      setFormData(prev => ({ ...prev, clienteId: '' }));
      setFormErrors(prev => ({ ...prev, dni: null, cliente: null }));
      showNotification('Por favor, ingrese un DNI válido', 'error');
      return;
    }
    // Buscar cliente
    const cliente = clientes.find(c => c.dni === dni);
    if (cliente) {
      setClienteEncontrado(cliente);
      setFormData(prev => ({ ...prev, clienteId: cliente.id }));
      setFormErrors(prev => ({ ...prev, dni: null, cliente: null }));
      showNotification('Cliente encontrado', 'success');
    } else {
      setClienteEncontrado(null);
      setFormData(prev => ({ ...prev, clienteId: '' }));
      setFormErrors(prev => ({ ...prev, dni: null, cliente: null }));
      showNotification('No se encontró ningún cliente con ese DNI', 'error');
    }
  };

  const showNotification = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Función para reiniciar completamente el formulario
  const reiniciarFormulario = () => {
    // Mostrar confirmación antes de reiniciar
    if (botonCrearBloqueado && (pasoActual < 4 && !confirm('¿Está seguro que desea cancelar este alquiler y empezar uno nuevo?'))) {
      return;
    }
    
    // Desbloquear el botón "Crear alquiler y continuar"
    setBotonCrearBloqueado(false);
    
    // Resetear todos los estados para un nuevo alquiler
    setDetallesAlquiler([]);
    setAlquilerCreado(null);
    setPiezaSeleccionada('');
    setPiezaSeleccionadaObj(null);
    setCantidad(1);
    setBusquedaPieza('');
    setFormData({
      clienteId: '',
      fechaFin: null
    });
    setDni('');
    setClienteEncontrado(null);
    setTotalAlquiler(0);
    setMontoPagado('');
    setFormErrors({});
    setPasoActual(1); // Volver al primer paso
    
    showNotification('Listo para registrar un nuevo alquiler', 'info');
  };

  // Componente para mostrar el paso actual en el proceso
  const ProgresoAlquiler = ({ pasoActual }) => {
    const pasos = [
      { numero: 1, nombre: 'Datos cliente' },
      { numero: 2, nombre: 'Equipamiento' },
      { numero: 3, nombre: 'Pago' },
      { numero: 4, nombre: 'Confirmación' }
    ];

    return (
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between">
          {pasos.map(paso => (
            <div 
              key={paso.numero} 
              className={`flex flex-col items-center ${paso.numero <= pasoActual ? 'text-red-600' : 'text-gray-400'}`}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  paso.numero === pasoActual ? 'border-red-600 bg-red-50 font-bold' : 
                  paso.numero < pasoActual ? 'border-red-500 bg-red-500 text-white' : 'border-gray-300'
                }`}
              >
                {paso.numero < pasoActual ? (
                  <CheckCircle size={18} />
                ) : (
                  paso.numero
                )}
              </div>
              <div className="mt-2 text-sm font-medium">{paso.nombre}</div>
            </div>
          ))}
        </div>
        <div className="relative mt-4">
          <div className="absolute top-0 h-2 bg-gray-200 w-full rounded-full"></div>
          <div 
            className="absolute top-0 h-2 bg-red-500 rounded-full transition-all duration-500" 
            style={{ width: `${((pasoActual - 1) / (pasos.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Validar que la fecha es futura y no excede 30 días
  const validarFechaFutura = (fecha) => {
    if (!fecha) return false;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaComparar = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    
    // Validar que la fecha es futura
    const esFechaFutura = fechaComparar >= hoy;
    
    // Calcular días entre hoy y la fecha seleccionada
    const diferenciaDias = Math.ceil((fechaComparar - hoy) / (1000 * 60 * 60 * 24));
    
    // Validar que no excede 30 días
    const noExcedePlazo = diferenciaDias <= 30;
    
    return esFechaFutura && noExcedePlazo;
  };

  // Calcular días entre fechas
  const calcularDias = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) return 1;
    
    // Normalizar las fechas a medianoche en la zona horaria local
    const inicio = new Date(fechaInicio);
    inicio.setHours(0, 0, 0, 0);
    
    const fin = new Date(fechaFin);
    fin.setHours(0, 0, 0, 0);
    
    // Asegurarnos de que estamos trabajando con las fechas correctas
    console.log('Calculando días entre:', {
      fechaInicioOriginal: fechaInicio,
      fechaFinOriginal: fechaFin,
      inicioNormalizado: inicio.toISOString(),
      finNormalizado: fin.toISOString()
    });
    
    // Calcular la diferencia en milisegundos y convertir a días
    const diferenciaMilisegundos = fin.getTime() - inicio.getTime();
    // Añadimos 1 para incluir tanto el día inicial como el final
    const diferenciaDias = Math.round(diferenciaMilisegundos / (1000 * 60 * 60 * 24)) + 1;
    
    // Generar array de fechas para verificación
    const fechas = [];
    const fechaTemp = new Date(inicio);
    for (let i = 0; i < diferenciaDias; i++) {
      fechas.push(new Date(fechaTemp).toLocaleDateString('es-PE'));
      fechaTemp.setDate(fechaTemp.getDate() + 1);
    }
    
    console.log('Resultado del cálculo:', {
      inicio: inicio.toLocaleDateString('es-PE'),
      fin: fin.toLocaleDateString('es-PE'),
      diferenciaDias,
      fechasIncluidas: fechas.join(', ')
    });
    
    return diferenciaDias > 0 ? diferenciaDias : 1;
  };

  // Calcular precio total basado en días
  const calcularPrecioConDias = async () => {
    if (detallesAlquiler.length === 0) return 0;

    try {
      const fechaInicio = new Date();
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
      
      const fechaFin = new Date(formData.fechaFin);
      fechaFin.setHours(0, 0, 0, 0);
      const fechaFinStr = fechaFin.toISOString().split('T')[0];

      // Calcular días localmente para enviar al backend
      const diasAlquiler = calcularDias(fechaInicio, fechaFin);

      const detallesParaCalculo = detallesAlquiler.map(detalle => ({
        piezaId: detalle.piezaId,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.pieza.precioAlquiler,
        diasAlquiler: diasAlquiler
      }));

      console.log('Enviando al API para calcular precio:', {
        fechaInicio: fechaInicioStr,
        fechaFin: fechaFinStr,
        diasAlquiler,
        detalles: detallesParaCalculo
      });

      const resultado = await alquilerAPI.calcularPrecio(fechaInicioStr, fechaFinStr, detallesParaCalculo);
      
      console.log('Resultado del API:', resultado);
      return resultado.total;
    } catch (error) {
      console.error('Error al calcular precio:', error);
      // Fallback al cálculo local simple
      const fechaInicio = new Date();
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(formData.fechaFin);
      fechaFin.setHours(0, 0, 0, 0);
      const dias = calcularDias(fechaInicio, fechaFin);
      
      console.log('Usando cálculo local de fallback:', {
        fechaInicio: fechaInicio.toLocaleDateString('es-PE'),
        fechaFin: fechaFin.toLocaleDateString('es-PE'),
        dias
      });
      
      return detallesAlquiler.reduce((sum, detalle) => {
        const subtotal = detalle.cantidad * detalle.pieza.precioAlquiler * dias;
        console.log(`${detalle.pieza.nombre}: ${detalle.cantidad} x S/${detalle.pieza.precioAlquiler} x ${dias} días = S/${subtotal}`);
        return sum + subtotal;
      }, 0);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Alquiler</h1>
          <p className="text-gray-500">Registra un nuevo alquiler</p>
        </div>
        {botonCrearBloqueado && pasoActual === 1 && (
          <Button 
            onClick={reiniciarFormulario} 
            variant="secondary"
            color="gray"
            size="sm"
          >
            Nuevo Alquiler
          </Button>
        )}
      </div>
      <ProgresoAlquiler pasoActual={pasoActual} />
      {formErrors.fetch && (
        <Alert severity="error" className="mb-4">
          {formErrors.fetch}
        </Alert>
      )}
      {/* Paso 1: Formulario para crear alquiler */}
      {pasoActual === 1 && (
        <Card className="mb-6">
          <div className="mb-4">
            <Title className="flex items-center gap-2">
              <User className="text-red-600 mr-1" size={22} /> Datos del Cliente
            </Title>
            <Text className="text-gray-500 mt-2 block">Busca y selecciona el cliente para el alquiler</Text>
          </div>
          <form
            className="flex flex-col sm:flex-row gap-2 mb-4"
            onSubmit={e => {
              e.preventDefault();
              if (!dni.trim() || loading || botonCrearBloqueado) return;
              buscarClientePorDNI();
            }}
          >
            <div className="flex-1 relative">
              <TextInput
                placeholder="Ingrese DNI del cliente"
                value={dni}
                onChange={e => {
                  const value = e.target.value;
                  // Permitir pegar, pero solo aceptar números y máximo 8 dígitos
                  if (/^\d{0,8}$/.test(value)) setDni(value);
                }}
                maxLength={8}
                icon={User}
                className="pr-8"
                disabled={botonCrearBloqueado}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!dni.trim() || loading || botonCrearBloqueado) return;
                    buscarClientePorDNI();
                  }
                  // Ya no se bloquean otros caracteres para permitir pegar
                }}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              {dni && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  onClick={() => setDni('')}
                  aria-label="Limpiar filtro DNI"
                >
                  ×
                </button>
              )}
            </div>
            <Button 
              type="submit"
              onClick={e => {
                e.preventDefault();
                if (!dni.trim() || loading || botonCrearBloqueado) return;
                buscarClientePorDNI();
              }}
              icon={Search}
              disabled={!dni.trim() || loading || botonCrearBloqueado}
              className="bg-red-600 hover:bg-red-700 text-white px-4"
            >
              Buscar
            </Button>
          </form>
          {clienteEncontrado && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="text-green-600" size={22} />
              <span className="text-green-700 font-medium">
                Cliente encontrado: {clienteEncontrado.nombreCompleto} (DNI: {clienteEncontrado.dni})
              </span>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleSubmit}
              icon={loading ? Loader2 : ShoppingCart}
              disabled={loading || !clienteEncontrado || botonCrearBloqueado}
              variant="primary"
              className="bg-red-600 hover:bg-red-700 text-white w-full"
            >
              {loading ? 'Procesando...' : 'Crear alquiler y continuar'}
            </Button>
          </div>
        </Card>
      )}

      {/* Paso 2: Selección de equipamiento */}
      {pasoActual === 2 && (
        <Card className="mb-6 shadow-sm">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Title className="flex items-center">
                <Package size={20} className="mr-2 text-blue-600" />
                <span>Seleccionar Equipamiento</span>
              </Title>
            </div>

            {clienteEncontrado && (
              <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
                <Text className="text-blue-700">
                  Cliente: <strong>{clienteEncontrado.nombreCompleto}</strong>
                  {formData.fechaFin && (
                    <span> | Periodo: <strong>{(() => {
                      const fechaInicio = new Date();
                      const fechaFin = new Date(formData.fechaFin);
                      const dias = calcularDias(fechaInicio, fechaFin);
                      return `${dias} días`;
                    })()}</strong></span>
                  )}
                </Text>
              </div>
            )}

            {/* Selección de fecha de fin */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <Text className="mb-2 font-medium">Fecha de fin del alquiler</Text>
              <div className="space-y-2">
                <label className="block text-sm font-semibold">Fecha Fin:</label>
                <input
                  type="date"
                  className={`w-full p-2 border rounded ${formErrors.fechaFin ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.fechaFin instanceof Date ? formData.fechaFin.toISOString().split('T')[0] : (formData.fechaFin || '')}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setFormData(prev => ({ ...prev, fechaFin: null }));
                      return;
                    }
                    
                    // Crear la fecha seleccionada en la zona horaria local
                    const [year, month, day] = e.target.value.split('-').map(Number);
                    const fechaSeleccionada = new Date(year, month - 1, day);
                    
                    // Crear la fecha de inicio (hoy) en la zona horaria local
                    const fechaInicio = new Date();
                    fechaInicio.setHours(0, 0, 0, 0);
                    
                    const diasAlquiler = calcularDias(fechaInicio, fechaSeleccionada);
                    
                    console.log('Selección de fecha:', {
                      fechaInicio: fechaInicio.toLocaleDateString('es-PE'),
                      fechaFin: fechaSeleccionada.toLocaleDateString('es-PE'),
                      diasCalculados: diasAlquiler,
                      fechaSeleccionadaOriginal: e.target.value
                    });
                    
                    if (diasAlquiler > 30) {
                      setFormErrors(prev => ({
                        ...prev,
                        fechaFin: 'El período de alquiler no puede exceder los 30 días'
                      }));
                      showNotification('El período de alquiler no puede exceder los 30 días', 'error');
                      return;
                    }
                    
                    setFormErrors(prev => ({ ...prev, fechaFin: '' }));
                    setFormData(prev => ({
                      ...prev,
                      fechaFin: fechaSeleccionada
                    }));
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]}
                />
                {formErrors.fechaFin && (
                  <span className="text-red-500 text-xs">{formErrors.fechaFin}</span>
                )}
              </div>
            </div>

            {/* Buscador */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <Text className="mb-2 font-medium">Buscar equipamiento</Text>
                <TextInput
                  placeholder="Buscar por nombre del equipamiento..."
                  value={busquedaPieza || ''}
                  onChange={(e) => setBusquedaPieza(e.target.value)}
                  icon={Search}
                  className="bg-white"
                />
              </div>
              
              {/* Contador de resultados */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <Text className="text-sm text-gray-600">
                  Mostrando {piezasFiltradas.length} de {piezas.length} equipos
                  {busquedaPieza && ` que contienen "${busquedaPieza}"`}
                </Text>
              </div>
            </div>

            {/* Equipo seleccionado */}
            {piezaSeleccionadaObj && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="mb-2 font-medium text-lg text-green-800">
                      {piezaSeleccionadaObj.nombre}
                    </span>
                    <div className="text-green-600">
                      Precio: S/ {piezaSeleccionadaObj.precioAlquiler} | Stock: {piezaSeleccionadaObj.stock}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="light"
                    onClick={() => {
                      setPiezaSeleccionadaObj(null);
                      setPiezaSeleccionada('');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <span className="mb-2 font-medium">Cantidad</span>
                    <NumberInput
                      value={cantidad}
                      onValueChange={(value) => {
                        if (value > piezaSeleccionadaObj.stock) {
                          showNotification(`Cantidad máxima disponible: ${piezaSeleccionadaObj.stock}`, 'warning');
                          setCantidad(piezaSeleccionadaObj.stock);
                        } else {
                          setCantidad(value);
                        }
                      }}
                      min={1}
                      max={piezaSeleccionadaObj.stock}
                      className="w-32"
                    />
                  </div>
                  <Button
                    icon={Plus}
                    variant="primary"
                    onClick={agregarDetalle}
                    disabled={!piezaSeleccionadaObj || cantidad <= 0}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Agregar al Alquiler
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de equipos filtrados */}
            {piezasFiltradas.length === 0 ? (
              <div className="p-8 text-center border border-gray-200 rounded-lg">
                <Package size={48} className="mx-auto mb-4 text-gray-300" />
                <Text className="text-gray-500 mb-2">No se encontraron equipos</Text>
                <Text className="text-sm text-gray-400">
                  {busquedaPieza 
                    ? 'Intenta ajustar la búsqueda'
                    : 'No hay equipos disponibles en este momento'
                  }
                </Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {piezasFiltradas.map(pieza => (
                  <div 
                    key={pieza.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      piezaSeleccionadaObj?.id === pieza.id 
                        ? 'border-green-500 bg-green-50' 
                        : 'hover:border-red-500 hover:bg-red-50'
                    } ${pieza.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => pieza.stock > 0 && seleccionarPieza(pieza.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{pieza.nombre}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${
                        pieza.stock > 5 ? 'bg-green-100 text-green-700' : 
                        pieza.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        Stock: {pieza.stock}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>💰 Precio: S/ {pieza.precioAlquiler}</p>
                      <p>🏋️ Equipamiento deportivo</p>
                    </div>
                    <Button 
                      className={`w-full mt-3 ${
                        pieza.stock === 0 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                      size="sm"
                      disabled={loading || pieza.stock === 0}
                    >
                      {pieza.stock === 0 ? 'Sin Stock' : 'Seleccionar'}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {formErrors.detalles && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <Text color="red">{formErrors.detalles}</Text>
              </div>
            )}
            
            {detallesAlquiler.length > 0 && (
              <div>
                <Text className="mb-4 font-medium text-lg">Equipos Agregados:</Text>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Equipo</TableHeaderCell>
                      <TableHeaderCell>Stock Disponible</TableHeaderCell>
                      <TableHeaderCell>Cantidad</TableHeaderCell>
                      <TableHeaderCell>Precio</TableHeaderCell>
                      <TableHeaderCell>Días</TableHeaderCell>
                      <TableHeaderCell>Subtotal</TableHeaderCell>
                      <TableHeaderCell className="text-right">Acciones</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detallesAlquiler.map((detalle) => {
                      if (!formData.fechaFin) {
                        return (
                          <TableRow key={detalle.piezaId}>
                            <TableCell>{detalle.pieza.nombre}</TableCell>
                            <TableCell>
                              {piezas.find(p => p.id === detalle.piezaId)?.stock || 0}
                            </TableCell>
                            <TableCell>
                              <NumberInput
                                value={detalle.cantidad}
                                onValueChange={(value) => actualizarCantidad(detalle.piezaId, value)}
                                min={1}
                                max={piezas.find(p => p.id === detalle.piezaId)?.stock || 1}
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>S/ {detalle.pieza.precioAlquiler}</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="light"
                                color="red"
                                icon={Trash2}
                                onClick={() => eliminarDetalle(detalle.piezaId)}
                              >
                                Eliminar
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      }
                      
                      const fechaInicio = new Date();
                      fechaInicio.setHours(0, 0, 0, 0);
                      const fechaFin = new Date(formData.fechaFin);
                      fechaFin.setHours(0, 0, 0, 0);
                      const dias = calcularDias(fechaInicio, fechaFin);
                      const subtotal = detalle.cantidad * detalle.pieza.precioAlquiler * dias;
                      return (
                        <TableRow key={detalle.piezaId}>
                          <TableCell>{detalle.pieza.nombre}</TableCell>
                          <TableCell>
                            {piezas.find(p => p.id === detalle.piezaId)?.stock || 0}
                          </TableCell>
                          <TableCell>
                            <NumberInput
                              value={detalle.cantidad}
                              onValueChange={(value) => actualizarCantidad(detalle.piezaId, value)}
                              min={1}
                              max={piezas.find(p => p.id === detalle.piezaId)?.stock || 1}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>S/ {detalle.pieza.precioAlquiler}</TableCell>
                          <TableCell>{dias}</TableCell>
                          <TableCell>S/ {subtotal.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="light"
                              color="red"
                              icon={Trash2}
                              onClick={() => eliminarDetalle(detalle.piezaId)}
                            >
                              Eliminar
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell colSpan={5} className="text-right font-medium">
                        Total:
                      </TableCell>
                      <TableCell className="font-medium" colSpan={2}>
                        {formData.fechaFin ? (
                          <>S/ {(() => {
                            const fechaInicio = new Date();
                            fechaInicio.setHours(0, 0, 0, 0);
                            const fechaFin = new Date(formData.fechaFin);
                            fechaFin.setHours(0, 0, 0, 0);
                            const dias = calcularDias(fechaInicio, fechaFin);
                            const total = detallesAlquiler.reduce((sum, detalle) => {
                              return sum + (detalle.cantidad * detalle.pieza.precioAlquiler * dias);
                            }, 0);
                            return total.toFixed(2);
                          })()}</>
                        ) : (
                          <Text className="text-gray-500">Seleccione fecha para ver el total</Text>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button
                variant="primary"
                icon={loading ? Loader2 : CreditCard}
                disabled={loading || detallesAlquiler.length === 0 || !formData.fechaFin}
                onClick={guardarDetalles}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? 'Guardando...' : 'Proceder al Pago'}
              </Button>
            </div>
          </div>
        </Card>
      )}
      {/* Paso 3: Pago */}
      {pasoActual === 3 && (
        <Card className="mb-6 shadow-sm">
          <div className="space-y-6">
            <Title className="mb-4 flex items-center">
              <CreditCard size={20} className="mr-2 text-blue-600" />
              <span>Procesar Pago</span>
            </Title>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <Text className="mb-2 font-medium">Método de pago</Text>
                <SearchSelect
                  value={metodoPago}
                  onValueChange={(value) => {
                    setMetodoPago(value);
                    if (value === 'TARJETA' || value === 'BILLETERAS') {
                      setMontoPagado(totalAlquiler.toFixed(2));
                    } else {
                      setMontoPagado('');
                    }
                  }}
                  disabled={loading}
                  icon={CreditCard}
                  className="bg-white"
                >
                  <SearchSelectItem value="EFECTIVO">Efectivo</SearchSelectItem>
                  <SearchSelectItem value="TARJETA">Tarjeta</SearchSelectItem>
                  <SearchSelectItem value="BILLETERAS">Billeteras digitales</SearchSelectItem>
                </SearchSelect>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Text className="mb-2 font-medium">Monto recibido (S/)</Text>
                <TextInput
                  value={montoPagado}
                  onChange={(e) => setMontoPagado(e.target.value)}
                  disabled={loading || metodoPago === 'TARJETA' || metodoPago === 'BILLETERAS'}
                  type="number"
                  step="0.01"
                  min={totalAlquiler}
                  placeholder={`Mínimo: S/ ${totalAlquiler.toFixed(2)}`}
                  className="bg-white"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div>
                <Text className="text-lg font-semibold text-blue-800">
                  Total a pagar: S/ {totalAlquiler.toFixed(2)}
                </Text>
                {montoPagado && parseFloat(montoPagado) > totalAlquiler && (
                  <Text className="text-green-600 font-medium">
                    Vuelto: S/ {(parseFloat(montoPagado) - totalAlquiler).toFixed(2)}
                  </Text>
                )}
              </div>
              <Button 
                onClick={registrarPago} 
                disabled={loading || !montoPagado || parseFloat(montoPagado) < totalAlquiler}
                loading={loading}
                icon={CheckCircle}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                Finalizar alquiler
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Paso 4: Confirmación */}
      {pasoActual === 4 && (
        <Card className="p-8 text-center">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
          <Title>¡Alquiler registrado exitosamente!</Title>
          <Text>El alquiler ha sido registrado y procesado correctamente.</Text>
          <Button 
            className="mt-6 bg-red-600 hover:bg-red-700 text-white" 
            variant="primary" 
            onClick={reiniciarFormulario}
          >
            Registrar otro alquiler
          </Button>
        </Card>
      )}
      
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {/* Personalización visual para éxito e info especial */}
        {(snackbarSeverity === 'success' || (snackbarSeverity === 'info' && snackbarMessage === 'Listo para registrar un nuevo alquiler')) ? (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg shadow text-green-700 font-medium min-w-[300px]">
            <CheckCircle className="text-green-600" />
            <span>{snackbarMessage}</span>
          </div>
        ) : (
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled">
            {snackbarMessage}
          </Alert>
        )}
      </Snackbar>
    </div>
  );
};

export default AlquilerPage;

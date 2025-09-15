import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { inscripcionAPI } from '../../services/InscripcionAPI';
import { 
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  NumberInput,
  DatePicker,
  Title,
  Text,
  TextInput,
  Button,
  SearchSelect,
  SearchSelectItem
} from '@tremor/react';
import { 
  Search, 
  CreditCard, 
  User, 
  Calendar, 
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Clock,
  MapPin,
  DollarSign
} from 'lucide-react';
import {
  Snackbar,
  Alert
} from '@mui/material';

const InscripcionPage = () => {
  const { isAuthenticated } = useAuth();
  
  // Estados principales
  const [dni, setDni] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [instructorSeleccionado, setInstructorSeleccionado] = useState(null);
  const [horariosInstructor, setHorariosInstructor] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
  
  // Estados para filtros de planes
  const [busquedaPlan, setBusquedaPlan] = useState('');
  const [filtroTipoPlan, setFiltroTipoPlan] = useState('TODOS');
  
  // Datos de formulario
  const [formData, setFormData] = useState({
    idCliente: '',
    idPlan: '',
    idInstructor: null,
    fechaInicio: new Date(),
    monto: 0
  });
  
  // Datos para listas
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [instructoresDisponibles, setInstructoresDisponibles] = useState([]);
  
  // Estados de control
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [inscripcionCreada, setInscripcionCreada] = useState(null);
  const [pasoActual, setPasoActual] = useState(1); // 1: Cliente, 2: Plan, 3: Instructor, 4: Horario, 5: Confirmación, 6: Pago, 7: Finalizado
  
  // Estados de pago
  const [montoPagado, setMontoPagado] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [mostrarPago, setMostrarPago] = useState(false);
  // Efecto para auto-completar y deshabilitar montoPagado según método de pago
  useEffect(() => {
    if (["TARJETA", "BILLETERAS"].includes(metodoPago)) {
      setMontoPagado(formData.monto ? formData.monto.toFixed(2) : '');
    } else {
      setMontoPagado('');
    }
  }, [metodoPago, formData.monto]);
  
  // Estados de notificación
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarDuration, setSnackbarDuration] = useState(6000);
  const [snackbarKey, setSnackbarKey] = useState(0);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const [clientesData, planesData] = await Promise.all([
          inscripcionAPI.obtenerClientes(),
          inscripcionAPI.obtenerPlanes()
        ]);

        // Formatear clientes
        const clientesFormateados = clientesData
          .filter(cliente => cliente && cliente.estado)
          .map(cliente => ({
            id: cliente.id,
            nombre: cliente.nombre || '',
            apellidos: cliente.apellidos || '',
            nombreCompleto: `${cliente.nombre || ''} ${cliente.apellidos || ''}`.trim(),
            dni: cliente.dni || ''
          }));

        // Formatear planes
        const planesFormateados = planesData
          .filter(plan => plan && plan.estado)
          .map(plan => ({
            id: plan.idPlan,
            nombre: plan.nombre,
            precio: plan.precio,
            duracion: plan.duracion,
            tipoPlan: plan.tipoPlan
          }));

        setClientes(clientesFormateados);
        setPlanes(planesFormateados);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setFormErrors({ fetch: 'Error al cargar los datos: ' + err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // Buscar cliente por DNI
  const buscarClientePorDNI = async () => {
    if (!dni.trim()) {
      setFormErrors({ dni: 'Ingrese un DNI válido' });
      return;
    }

    try {
      setLoading(true);
      setFormErrors({});
      
      const cliente = clientes.find(c => c.dni === dni);
      if (cliente) {
        setClienteEncontrado(cliente);
        setFormData(prev => ({ ...prev, idCliente: cliente.id }));
        showSnackbar('Cliente encontrado exitosamente', 'success');
      } else {
        setFormErrors({ dni: 'No se encontró un cliente con ese DNI' });
        setClienteEncontrado(null);
      }
    } catch (error) {
      console.error('Error al buscar cliente:', error);
      setFormErrors({ dni: 'Error al buscar el cliente' });
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar plan
  const seleccionarPlan = async (planId) => {
    try {
      setLoading(true);
      const plan = planes.find(p => p.id === parseInt(planId));
      
      if (plan) {
        setPlanSeleccionado(plan);
        setFormData(prev => ({ 
          ...prev, 
          idPlan: plan.id,
          monto: plan.precio
        }));

        // Si es plan PREMIUM, cargar instructores disponibles
        if (plan.tipoPlan === 'PREMIUM') {
          const instructores = await inscripcionAPI.obtenerInstructoresDisponibles(plan.id);
          console.log('Instructores obtenidos del API:', instructores);
          setInstructoresDisponibles(instructores);
          setPasoActual(3); // Paso de selección de instructor
        } else {
          // Si es ESTANDAR, saltar a confirmación
          setPasoActual(5); // Paso de confirmación
        }
        
        showSnackbar('Plan seleccionado exitosamente', 'success');
      }
    } catch (error) {
      console.error('Error al seleccionar plan:', error);
      showSnackbar('Error al seleccionar el plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar instructor (solo para planes PREMIUM)
  const seleccionarInstructor = async (instructorId) => {
    try {
      setLoading(true);
      const instructor = instructoresDisponibles.find(i => i.idEmpleado === parseInt(instructorId));
      
      if (instructor) {
        setInstructorSeleccionado(instructor);
        setFormData(prev => ({ ...prev, idInstructor: instructor.idEmpleado }));
        
        // Cargar horarios del instructor
        const horarios = await inscripcionAPI.obtenerHorariosInstructor(instructor.idEmpleado);
        setHorariosInstructor(horarios);
        setPasoActual(4); // Paso de selección de horario
        
        showSnackbar('Instructor seleccionado exitosamente', 'success');
      }
    } catch (error) {
      console.error('Error al seleccionar instructor:', error);
      showSnackbar('Error al seleccionar el instructor', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar horario
  const seleccionarHorario = (horario) => {
    setHorarioSeleccionado(horario);
    setPasoActual(5); // Paso de confirmación
    showSnackbar('Horario seleccionado exitosamente', 'success');
  };

  // Registrar inscripción
  const registrarInscripcion = async () => {
    try {
      setLoading(true);
      
      // Formatear fecha de inicio como YYYY-MM-DD en local, forzando hora 00:00:00
      const formatDateLocal = (date) => {
        if (!(date instanceof Date)) return date;
        // Forzar hora local a 00:00:00 para evitar desfase
        const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const day = String(localDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const inscripcionData = {
        idCliente: formData.idCliente,
        idPlan: formData.idPlan,
        idInstructor: formData.idInstructor,
        fechaInicio: formatDateLocal(formData.fechaInicio),
        monto: formData.monto
      };

      console.log('Datos de inscripción a enviar:', inscripcionData);
      
      const resultado = await inscripcionAPI.registrarInscripcion(inscripcionData);
      setInscripcionCreada(resultado);
      setPasoActual(6); // Paso de pago
      
      showSnackbar('Inscripción registrada exitosamente', 'success');
    } catch (error) {
      console.error('Error al registrar inscripción:', error);
      // Manejar diferentes tipos de errores
      let errorMessage;
      if (error.response?.data?.message === '[object Object]' || 
          error.message?.includes('[object Object]') ||
          error.response?.data?.error === 'El cliente ya tiene una inscripción activa') {
        errorMessage = 'Este cliente ya tiene una inscripción activa';
      } else {
        errorMessage = error.message || 'Error al registrar la inscripción';
      }
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Registrar pago
  const registrarPago = async () => {
    if (!montoPagado || parseFloat(montoPagado) < formData.monto) {
      setFormErrors({ pago: 'El monto pagado debe ser igual o mayor al monto de la inscripción' });
      return;
    }

    try {
      setLoading(true);
      
      const pagoData = {
        inscripcion: { idInscripcion: inscripcionCreada.idInscripcion },
        montoPagado: parseFloat(montoPagado),
        metodoPago: metodoPago
      };

      await inscripcionAPI.registrarPagoInscripcion(pagoData);
      setPasoActual(7); // Paso final
      
      showSnackbar('Pago registrado exitosamente', 'success');
    } catch (error) {
      console.error('Error al registrar pago:', error);
      showSnackbar(error.message || 'Error al registrar el pago', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Funciones auxiliares
 const showSnackbar = (message, severity = 'success', duration) => {
  setSnackbarMessage(message);
  setSnackbarSeverity(severity);
  setSnackbarDuration(duration || 8000);
  setSnackbarKey(prev => prev + 1); // Fuerza reinicio del Snackbar
  setOpenSnackbar(false);
  setTimeout(() => setOpenSnackbar(true), 10);
};

  // Función para filtrar planes
  const planesFiltrados = planes.filter(plan => {
    const coincideBusqueda = plan.nombre.toLowerCase().includes(busquedaPlan.toLowerCase());
    const coincideTipo = filtroTipoPlan === 'TODOS' || plan.tipoPlan === filtroTipoPlan;
    return coincideBusqueda && coincideTipo;
  });

  // Función para formatear duración correctamente (singular/plural)
  const formatearDuracion = (duracion) => {
    return duracion === 1 ? `${duracion} día` : `${duracion} días`;
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const reiniciarFormulario = () => {
    setDni('');
    setClienteEncontrado(null);
    setPlanSeleccionado(null);
    setInstructorSeleccionado(null);
    setHorariosInstructor([]);
    setHorarioSeleccionado(null);
    setBusquedaPlan('');
    setFiltroTipoPlan('TODOS');
    setFormData({
      idCliente: '',
      idPlan: '',
      idInstructor: null,
      fechaInicio: new Date(),
      monto: 0
    });
    setInscripcionCreada(null);
    setMontoPagado('');
    setMetodoPago('EFECTIVO');
    setFormErrors({});
    setPasoActual(1);
  };

  const volver = () => {
    if (pasoActual > 1) {
      // Para planes ESTÁNDAR, manejar los saltos correctamente
      if (planSeleccionado && planSeleccionado.tipoPlan === 'ESTANDAR') {
        if (pasoActual === 5) { // Desde confirmación volver a plan
          setPasoActual(2);
        } else if (pasoActual === 6) { // Desde pago volver a confirmación
          setPasoActual(5);
        } else if (pasoActual === 7) { // Desde completado volver a pago
          setPasoActual(6);
        } else {
          setPasoActual(pasoActual - 1);
        }
      } else {
        // Para planes PREMIUM o cuando no hay plan seleccionado, comportamiento normal
        setPasoActual(pasoActual - 1);
      }
    }
  };

  // Componente de progreso
  const ProgresoInscripcion = ({ pasoActual }) => {
    const pasos = [
      { numero: 1, titulo: 'Cliente', icono: User },
      { numero: 2, titulo: 'Plan', icono: Calendar },
      { numero: 3, titulo: 'Instructor', icono: User, condicional: true },
      { numero: 4, titulo: 'Horario', icono: Clock, condicional: true },
      { numero: 5, titulo: 'Confirmación', icono: CheckCircle },
      { numero: 6, titulo: 'Pago', icono: CreditCard },
      { numero: 7, titulo: 'Completado', icono: CheckCircle }
    ];

    // Filtrar pasos según el tipo de plan
    const pasosFiltrados = pasos.filter(paso => {
      if (paso.condicional && planSeleccionado?.tipoPlan !== 'PREMIUM') {
        return false;
      }
      return true;
    });

    // Mapear pasos actuales a la numeración filtrada para planes ESTÁNDAR
    const obtenerPasoMapeado = (pasoOriginal) => {
      if (!planSeleccionado || planSeleccionado.tipoPlan === 'PREMIUM') {
        return pasoOriginal;
      }
      
      // Para planes ESTÁNDAR: 1=Cliente, 2=Plan, 5=Confirmación, 6=Pago, 7=Completado
      // Mapear a: 1=Cliente, 2=Plan, 3=Confirmación, 4=Pago, 5=Completado
      if (pasoOriginal <= 2) return pasoOriginal;
      if (pasoOriginal === 5) return 3; // Confirmación
      if (pasoOriginal === 6) return 4; // Pago
      if (pasoOriginal === 7) return 5; // Completado
      return pasoOriginal;
    };

    const pasoMapeado = obtenerPasoMapeado(pasoActual);

    return (
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between">
          {pasosFiltrados.map((paso, index) => {
            const IconComponent = paso.icono;
            const numeroEnSecuencia = index + 1;
            return (
              <div 
                key={paso.numero} 
                className={`flex flex-col items-center ${numeroEnSecuencia <= pasoMapeado ? 'text-red-600' : 'text-gray-400'}`}
              >
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                    numeroEnSecuencia === pasoMapeado ? 'border-red-600 bg-red-50 font-bold' : 
                    numeroEnSecuencia < pasoMapeado ? 'border-red-500 bg-red-500 text-white' : 'border-gray-300'
                  }`}
                >
                  {numeroEnSecuencia < pasoMapeado ? (
                    <CheckCircle size={18} />
                  ) : (
                    <IconComponent size={16} />
                  )}
                </div>
                <div className="mt-2 text-sm font-medium">{paso.titulo}</div>
              </div>
            );
          })}
        </div>
        <div className="relative mt-4">
          <div className="absolute top-0 h-2 bg-gray-200 w-full rounded-full"></div>
          <div 
            className="absolute top-0 h-2 bg-red-500 rounded-full transition-all duration-500" 
            style={{ width: `${((pasoMapeado - 1) / (pasosFiltrados.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        

        <div className="flex flex-col items-start">
          <h1 className="text-2xl font-bold text-gray-900">Nueva Inscripción</h1>
          <p className="text-gray-500 mt-1">Registra una nueva inscripción</p>
        </div>
                  
                  
        {pasoActual > 1 && pasoActual < 7 && (
          <div className="flex gap-2">
            {pasoActual !== 6 && (
              <button 
                type="button"
                onClick={volver}
                className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-700 font-medium"
                disabled={loading}
              >
                <span className="flex items-center gap-2">
                  <ArrowLeft size={18} />
                  Volver
                </span>
              </button>
            )}
            {/* Se elimina el botón Nueva Inscripción */}
          </div>
        )}
      </div>
      
      <ProgresoInscripcion pasoActual={pasoActual} />
      
      {formErrors.fetch && (
        <Alert severity="error" className="mb-4">
          {formErrors.fetch}
        </Alert>
      )}

      {/* Paso 1: Búsqueda de Cliente (diseño igual a AlquilerPage.jsx) */}
      {pasoActual === 1 && (
        <Card className="mb-6 shadow-sm">
          <Title className="mb-4 flex items-center">
            <User size={20} className="mr-2 text-red-600" />
            <span>Datos del Cliente</span>
          </Title>
          <div className="mb-5">
            <Text className="mb-2 font-medium">Busca y selecciona el cliente para la inscripción</Text>
            <form
              className="flex flex-col sm:flex-row gap-2"
              onSubmit={e => {
                e.preventDefault();
                if (!dni.trim()) return;
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
                  className="pr-8 bg-white"
                  error={!!formErrors.dni}
                  errorMessage={formErrors.dni}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!dni.trim()) return;
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
                  icon={Search}
                  disabled={loading || !dni.trim()}
                  loading={loading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Buscar
                </Button>
            </form>
          </div>
          <>
            {clienteEncontrado && (
              <div className="mb-4 p-3 border border-green-200 bg-green-50 rounded flex items-center gap-2">
                <CheckCircle className="text-green-600" size={18} />
                <Text>
                  Cliente encontrado: <strong>{clienteEncontrado.nombreCompleto}</strong> (DNI: {clienteEncontrado.dni})
                </Text>
              </div>
            )}
            <div className="mt-4">
              <Button
                className="bg-red-600 hover:bg-red-700 text-white w-full py-2 text-sm font-medium rounded-lg shadow-sm"
                icon={CheckCircle}
                onClick={() => {
                  setPasoActual(2);
                  showSnackbar('Datos registrados. Continúe agregando su plan para la inscripción', 'success', 4000);
                }}
                size="lg"
                disabled={!clienteEncontrado}
              >
                Crear Inscripción
              </Button>
            </div>
          </>
        </Card>
      )}

      {/* Paso 2: Selección de Plan */}
      {pasoActual === 2 && (
        <Card className="mb-6 shadow-sm">
          <Title className="mb-4 flex items-center">
            <Calendar size={20} className="mr-2 text-red-600" />
            <span>Seleccionar Plan</span>
          </Title>
          
          {clienteEncontrado && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
              <Text className="text-blue-700">
                Cliente: <strong>{clienteEncontrado.nombreCompleto}</strong>
              </Text>
            </div>
          )}
          
          {/* Filtros y buscador */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-2 font-medium">Buscar plan</Text>
                <TextInput
                  placeholder="Buscar por nombre del plan..."
                  value={busquedaPlan}
                  onChange={(e) => setBusquedaPlan(e.target.value)}
                  icon={Search}
                  className="bg-white"
                />
              </div>
              <div>
                <Text className="mb-2 font-medium">Filtrar por tipo</Text>
                <SearchSelect
                  value={filtroTipoPlan}
                  onValueChange={setFiltroTipoPlan}
                  className="bg-white"
                >
                  <SearchSelectItem value="TODOS">Todos los planes</SearchSelectItem>
                  <SearchSelectItem value="ESTANDAR">Plan Estándar</SearchSelectItem>
                  <SearchSelectItem value="PREMIUM">Plan Premium</SearchSelectItem>
                </SearchSelect>
              </div>
            </div>
            
            {/* Contador de resultados */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <Text className="text-sm text-gray-600">
                Mostrando {planesFiltrados.length} de {planes.length} planes
                {busquedaPlan && ` que contienen "${busquedaPlan}"`}
                {filtroTipoPlan !== 'TODOS' && ` del tipo ${filtroTipoPlan}`}
              </Text>
            </div>
          </div>
          
          {/* Lista de planes filtrados */}
          {planesFiltrados.length === 0 ? (
            <div className="p-8 text-center border border-gray-200 rounded-lg">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <Text className="text-gray-500 mb-2">No se encontraron planes</Text>
              <Text className="text-sm text-gray-400">
                {busquedaPlan || filtroTipoPlan !== 'TODOS' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay planes disponibles en este momento'
                }
              </Text>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {planesFiltrados.map(plan => (
                <div 
                  key={plan.id}
                  className="p-4 border rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors"
                  onClick={() => seleccionarPlan(plan.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{plan.nombre}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      plan.tipoPlan === 'PREMIUM' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {plan.tipoPlan}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>💰 Precio: S/ {plan.precio}</p>
                    <p>📅 Duración: {formatearDuracion(plan.duracion)}</p>
                  </div>
                  <Button 
                    className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white"
                    size="sm"
                    disabled={loading}
                  >
                    Seleccionar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Paso 3: Selección de Instructor (solo para PREMIUM) */}
      {pasoActual === 3 && planSeleccionado?.tipoPlan === 'PREMIUM' && (
        <Card className="mb-6 shadow-sm">
          <Title className="mb-4 flex items-center">
            <User size={20} className="mr-2 text-red-600" />
            <span>Seleccionar Instructor</span>
          </Title>
          
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
            <Text className="text-blue-700">
              Plan seleccionado: <strong>{planSeleccionado.nombre}</strong> - S/ {planSeleccionado.precio}
            </Text>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instructoresDisponibles.length === 0 ? (
              <div className="col-span-full p-4 text-center border border-gray-200 rounded">
                <Text>No hay instructores disponibles para este plan</Text>
              </div>
            ) : (
              instructoresDisponibles.map(instructor => {
                console.log('Renderizando instructor:', instructor);
                console.log('Nombre completo:', instructor.nombreCompleto);
                return (
                  <div 
                    key={instructor.idEmpleado}
                    className="p-4 border rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors"
                    onClick={() => seleccionarInstructor(instructor.idEmpleado)}
                  >
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">
                      {instructor.nombreCompleto || `Instructor ID: ${instructor.idEmpleado}`}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>👨‍🏫 Tipo: {instructor.tipoInstructor || 'No especificado'}</p>
                      <p>👥 Cupo disponible: {instructor.cupoMaximo || 0}</p>
                    </div>
                    <Button 
                      className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                      disabled={loading}
                    >
                      Seleccionar
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {/* Paso 4: Selección de Horario */}
      {pasoActual === 4 && instructorSeleccionado && (
        <Card className="mb-6 shadow-sm">
          <Title className="mb-4 flex items-center">
            <Clock size={20} className="mr-2 text-red-600" />
            <span>Seleccionar Horario</span>
          </Title>
          
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
            <Text className="text-blue-700">
              Instructor seleccionado: <strong>{instructorSeleccionado.nombreCompleto}</strong>
            </Text>
          </div>
          
          {horariosInstructor.length > 0 ? (
            <div>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Día</TableHeaderCell>
                    <TableHeaderCell>Hora Inicio</TableHeaderCell>
                    <TableHeaderCell>Hora Fin</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {horariosInstructor.map((horario, index) => (
                    <TableRow key={index}>
                      <TableCell>{horario.dia}</TableCell>
                      <TableCell>{horario.horaInicio}</TableCell>
                      <TableCell>{horario.horaFin}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={() => {
                    setHorarioSeleccionado(horariosInstructor[0]); // Seleccionar el primer horario por defecto
                    setPasoActual(5); // Ir al paso de confirmación
                    showSnackbar('Bloque de horarios seleccionado exitosamente', 'success');
                  }}
                  disabled={loading}
                  loading={loading}
                  className="bg-red-600 hover:bg-red-700 text-white px-8"
                  size="lg"
                >
                  Seleccionar Bloque de Horarios
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center border border-gray-200 rounded">
              <Text>No hay horarios disponibles para este instructor</Text>
            </div>
          )}
        </Card>
      )}

      {/* Paso 5: Confirmación */}
      {pasoActual === 5 && (
        <Card className="mb-6 shadow-sm">
          <Title className="mb-4 flex items-center">
            <CheckCircle size={20} className="mr-2 text-red-600" />
            <span>Confirmar Inscripción</span>
          </Title>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Resumen de la Inscripción</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Cliente:</strong> {clienteEncontrado?.nombreCompleto}</p>
                <p><strong>Plan:</strong> {planSeleccionado?.nombre} ({planSeleccionado?.tipoPlan})</p>
                <p><strong>Duración:</strong> {formatearDuracion(planSeleccionado?.duracion)}</p>
                {instructorSeleccionado && (
                  <p><strong>Instructor:</strong> {instructorSeleccionado.nombreCompleto}</p>
                )}
                <p><strong>Fecha de inicio:</strong> {formData.fechaInicio instanceof Date ? formData.fechaInicio.toLocaleDateString() : formData.fechaInicio}</p>
                <p className="text-lg font-semibold text-red-600"><strong>Monto total: S/ {formData.monto}</strong></p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Text className="mb-2 font-medium">Fecha de inicio (opcional - modificar si es necesario)</Text>
              <DatePicker
                value={formData.fechaInicio}
                onValueChange={(value) => setFormData(prev => ({ ...prev, fechaInicio: value }))}
                enableClear={false}
                minDate={new Date()}
                icon={Calendar}
                className="bg-white max-w-xs"
              />
            </div>
            
            <Button 
              onClick={registrarInscripcion}
              disabled={loading}
              loading={loading}
              icon={CheckCircle}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              Confirmar y Registrar Inscripción
            </Button>
          </div>
        </Card>
      )}

      {/* Paso 6: Pago */}
      {pasoActual === 6 && inscripcionCreada && (
        <Card className="mb-6 shadow-sm">
          <Title className="mb-4 flex items-center">
            <CreditCard size={20} className="mr-2 text-red-600" />
            <span>Registrar Pago</span>
          </Title>
          
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <Text className="text-green-700">
              <CheckCircle className="inline-block mr-2" size={16} />
              Inscripción registrada exitosamente. ID: {inscripcionCreada.idInscripcion}
            </Text>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Text className="mb-2 font-medium">Método de pago</Text>
              <SearchSelect
                value={metodoPago}
                onValueChange={setMetodoPago}
                disabled={loading}
                icon={CreditCard}
                className="bg-white"
              >
                <SearchSelectItem value="EFECTIVO">Efectivo</SearchSelectItem>
                <SearchSelectItem value="TARJETA">Tarjeta</SearchSelectItem>
                <SearchSelectItem value="BILLETERAS">Billeteras Digitales</SearchSelectItem>
              </SearchSelect>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Text className="mb-2 font-medium">Monto recibido (S/)</Text>
              <TextInput
                value={montoPagado}
                onChange={(e) => {
                  if (!["TARJETA", "BILLETERAS"].includes(metodoPago)) {
                    setMontoPagado(e.target.value);
                  }
                }}
                disabled={loading || ["TARJETA", "BILLETERAS"].includes(metodoPago)}
                type="number"
                step="0.01"
                min={formData.monto}
                placeholder={`Mínimo: S/ ${formData.monto.toFixed(2)}`}
                className="bg-white"
                icon={DollarSign}
              />
              {formErrors.pago && (
                <Text className="text-red-600 text-xs mt-1">{formErrors.pago}</Text>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div>
              <Text className="text-lg font-semibold text-blue-800">
                Total a pagar: S/ {formData.monto.toFixed(2)}
              </Text>
              {montoPagado && parseFloat(montoPagado) > formData.monto && (
                <Text className="text-green-600 font-medium">
                  Vuelto: S/ {(parseFloat(montoPagado) - formData.monto).toFixed(2)}
                </Text>
              )}
            </div>
            <Button 
              onClick={registrarPago} 
              disabled={loading || !montoPagado || parseFloat(montoPagado) < formData.monto}
              loading={loading}
              icon={CheckCircle}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              Finalizar Pago
            </Button>
          </div>
        </Card>
      )}

      {/* Paso 7: Completado */}
      {pasoActual === 7 && (
        <Card className="mb-6 shadow-sm">
          <div className="text-center py-8">
            <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
            <Title className="mb-2 text-green-700">¡Inscripción Completada!</Title>
            <Text className="mb-6 text-gray-600">
              La inscripción y el pago han sido registrados exitosamente.
            </Text>
            
            <div className="max-w-md mx-auto mb-6 p-4 bg-gray-50 rounded-lg text-left">
              <h3 className="font-semibold mb-2">Detalles de la inscripción:</h3>
              <div className="space-y-1 text-sm">
                <p><strong>ID:</strong> {inscripcionCreada?.idInscripcion}</p>
                <p><strong>Cliente:</strong> {clienteEncontrado?.nombreCompleto}</p>
                <p><strong>Plan:</strong> {planSeleccionado?.nombre}</p>
                <p><strong>Monto:</strong> S/ {formData.monto.toFixed(2)}</p>
                <p><strong>Método de pago:</strong> {metodoPago}</p>
                {montoPagado && parseFloat(montoPagado) > formData.monto && (
                  <p><strong>Vuelto:</strong> S/ {(parseFloat(montoPagado) - formData.monto).toFixed(2)}</p>
                )}
              </div>
            </div>
            
            <Button 
              onClick={() => {
                reiniciarFormulario();
                showSnackbar('Listo para registrar una nueva inscripción', 'info');
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              Nueva Inscripción
            </Button>
          </div>
        </Card>
      )}
      
      {/* Notificaciones arriba, igual que en AlquilerPage.jsx */}
      <Snackbar 
        key={snackbarKey}
        open={openSnackbar} 
        autoHideDuration={snackbarDuration}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {/* Patrón verde para success y para el mensaje especial de info */}
        {(snackbarSeverity === 'success' || snackbarMessage === 'Listo para registrar una nueva inscripción') ? (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg shadow text-green-700 font-medium min-w-[300px]">
            <CheckCircle className="text-green-600" />
            <span className="text-green-700 font-medium">{snackbarMessage}</span>
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

export default InscripcionPage;

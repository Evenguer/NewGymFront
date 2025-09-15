import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { ventasAPI } from '../../services/ventaAPI';
import { productosAPI } from '../../services/productosAPI';
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
  NumberInput
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
  Loader2 
} from 'lucide-react';
import {
  Snackbar,
  Alert
} from '@mui/material';

const VentaPage = () => {
  const { isAuthenticated } = useAuth();
  const [dni, setDni] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [formData, setFormData] = useState({
    empleadoId: '',
    clienteId: ''
  });
  const [empleados, setEmpleados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
const [ventaTemp, setVentaTemp] = useState(null); // venta temporal
const [productos, setProductos] = useState([]);
const [detallesVenta, setDetallesVenta] = useState([]);
const [productoSeleccionado, setProductoSeleccionado] = useState(null);
const [cantidad, setCantidad] = useState(1);
const [busquedaProducto, setBusquedaProducto] = useState('');
const [filtroCategoriaProducto, setFiltroCategoriaProducto] = useState('TODOS');
const [categorias, setCategorias] = useState([]);
const [openSnackbar, setOpenSnackbar] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState('');
const [snackbarSeverity, setSnackbarSeverity] = useState('success');
const [montoPagado, setMontoPagado] = useState('');
const [metodoPago, setMetodoPago] = useState('EFECTIVO');
const [totalVenta, setTotalVenta] = useState(0);
const [pasoActual, setPasoActual] = useState(1); // 1: datos, 2: detalles, 3: pago, 4: confirmación

  // Cargar empleados y clientes al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [empleadosData, clientesData] = await Promise.all([
          ventasAPI.obtenerEmpleados(),
          ventasAPI.obtenerClientes()
        ]);

        console.log('Datos de empleados recibidos:', empleadosData);
        console.log('Datos de clientes recibidos:', clientesData);        // Procesar empleados
        const recepcionistas = empleadosData          .filter(emp => emp && emp.estado && emp.idEmpleado)
          .map(emp => ({
            id: `emp-${emp.idEmpleado}`,
            idEmpleado: emp.idEmpleado,
            nombre: emp.nombre || '',
            apellidos: emp.apellidos || '',
            nombreCompleto: `${emp.nombre || ''} ${emp.apellidos || ''}`.trim()
          }));        // Procesar clientes
        const clientesFormateados = clientesData
          .filter(cliente => cliente && cliente.estado && cliente.id)
          .map(cliente => ({
            id: `cli-${cliente.id}`,
            clienteId: cliente.id,
            nombre: cliente.nombre || '',
            apellidos: cliente.apellidos || '',
            nombreCompleto: `${cliente.nombre || ''} ${cliente.apellidos || ''}`.trim(),
            dni: cliente.dni || ''
          }));console.log('Recepcionistas formateados:', recepcionistas);
        console.log('Clientes formateados:', clientesFormateados);

        setEmpleados(recepcionistas);
        // Asignar el primer empleado por defecto
        if (recepcionistas.length > 0) {
          setFormData(prev => ({
            ...prev,
            empleadoId: recepcionistas[0].id
          }));
        }
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
  }, [isAuthenticated]);  const handleInputChange = (field, value) => {
    console.log(`Cambiando ${field} a:`, value);
    
    // Si el valor es null o undefined, usar cadena vacía
    const safeValue = value || '';
    
    // Validar el formato del ID
    if (field === 'empleadoId' && !safeValue.startsWith('emp-')) {
      const formattedValue = `emp-${safeValue}`;
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue
      }));
    } else if (field === 'clienteId' && !safeValue.startsWith('cli-')) {
      const formattedValue = `cli-${safeValue}`;
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: safeValue
      }));
    }

    // Limpiar error del campo cuando cambia
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
    
    // Limpiar mensaje de éxito si existe
    // (Eliminado: setSuccess, no está definido ni utilizado)

    console.log('Estado actualizado:', formData);
  };  const validateForm = () => {
    const errors = {};
    if (!clienteEncontrado) {
      errors.cliente = 'Debe buscar y seleccionar un cliente por DNI';
    }
    if (!formData.clienteId) {
      errors.clienteId = 'Debe seleccionar un cliente';
    }
    return errors;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setFormErrors({});
  const errors = validateForm();
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }
  try {
    // Formatear IDs
    const clienteId = parseInt(formData.clienteId.replace('cli-', ''));
    const empleadoId = parseInt(formData.empleadoId.replace('emp-', ''));
    if (isNaN(clienteId) || isNaN(empleadoId)) {
      throw new Error('ID de cliente o empleado inválido');
    }
    // Estructura temporal de venta
    const ventaTempObj = {
      idVenta: Date.now(),
      clienteId,
      empleadoId
    };
    setVentaTemp(ventaTempObj);
    setPasoActual(2); // Avanzar a detalles
    showNotification('Datos registrados. Continúe agregando productos a la venta', 'success');
    // Cargar productos para el siguiente paso
    setLoading(true);
    const response = await productosAPI.listarProductos();
    const productosFormateados = response
      .filter(p => p && p.idProducto && p.estado)
      .map(p => ({
        id: p.idProducto,
        nombre: p.nombre || 'Sin nombre',
        precio: p.precioVenta ? parseFloat(p.precioVenta) : 0,
        stockTotal: p.stockTotal || 0,
        categoria: p.categoria?.nombre || 'Sin categoría'
      }));
    setProductos(productosFormateados);
    
    // Extraer categorías únicas para el filtro
    const categoriasUnicas = [...new Set(productosFormateados.map(p => p.categoria))];
    setCategorias(categoriasUnicas);
  } catch (err) {
    setFormErrors({ submit: `Error: ${err.message}` });
    showNotification(`Error: ${err.message}`, 'error');
  } finally {
    setLoading(false);
  }
};

  // (Eliminado: useEffect dependiente de mostrarDetalles, ya no es necesario)
  // Función para agregar detalle
  const agregarDetalle = () => {
    console.log('Intentando agregar detalle. Producto seleccionado:', productoSeleccionado);

    if (!productoSeleccionado) {
      setFormErrors(prev => ({
        ...prev,
        detalles: 'Seleccione un producto'
      }));
      return;
    }

    // Verificar stock disponible
    if (cantidad > productoSeleccionado.stockTotal) {
      setFormErrors(prev => ({
        ...prev,
        detalles: `Stock insuficiente. Stock disponible: ${productoSeleccionado.stockTotal}`
      }));
      return;
    }

    // Verificar si el producto ya está en los detalles
    const detalleExistente = detallesVenta.find(d => 
      d.productoId === productoSeleccionado.id
    );

    if (detalleExistente) {
      // Si el producto ya existe, verificar si la nueva cantidad total excede el stock
      const cantidadTotal = detalleExistente.cantidad + cantidad;
      if (cantidadTotal > productoSeleccionado.stockTotal) {
        setFormErrors(prev => ({
          ...prev,
          detalles: `La cantidad total excede el stock disponible (${productoSeleccionado.stockTotal})`
        }));
        return;
      }

      // Actualizar la cantidad del detalle existente
      setDetallesVenta(detallesVenta.map(d => 
        d.productoId === productoSeleccionado.id
          ? { ...d, cantidad: cantidadTotal }
          : d
      ));
    } else {
      // Agregar nuevo detalle
      const nuevoDetalle = {
        productoId: productoSeleccionado.id,
        cantidad: parseInt(cantidad),
        producto: {
          id: productoSeleccionado.id,
          nombre: productoSeleccionado.nombre,
          precio: productoSeleccionado.precio,
          categoria: productoSeleccionado.categoria
        }
      };

      console.log('Nuevo detalle a agregar:', nuevoDetalle);
      setDetallesVenta(prev => [...prev, nuevoDetalle]);
    }

    setProductoSeleccionado(null);
    setCantidad(1);
    setFormErrors(prev => ({ ...prev, detalles: '' }));
    showNotification('Producto agregado correctamente', 'success');
  };
  // Eliminar un detalle de la venta
  const eliminarDetalle = (productoId) => {
    try {
      setDetallesVenta(prev => prev.filter(d => d.productoId !== productoId));
      showNotification('Producto eliminado del detalle', 'success');
    } catch (error) {
      console.error('Error al eliminar detalle:', error);
      showNotification('Error al eliminar el producto', 'error');
    }
  };

  // Actualizar cantidad de un detalle
  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) return;
    
    // Buscar el producto para verificar stock
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    
    // Limitar la cantidad al stock disponible
    if (nuevaCantidad > producto.stockTotal) {
      showNotification(`Cantidad máxima disponible: ${producto.stockTotal}`, 'warning');
      nuevaCantidad = producto.stockTotal;
    }
    
    setDetallesVenta(detallesVenta.map(d => 
      d.productoId === productoId ? { ...d, cantidad: nuevaCantidad } : d
    ));
  };

  
// Guardar detalles y avanzar a pago
const guardarDetalles = () => {
  if (!ventaTemp || !ventaTemp.idVenta) {
    showNotification('Error: No se encontró la venta temporal', 'error');
    return;
  }
  if (detallesVenta.length === 0) {
    showNotification('Error: No hay productos agregados', 'error');
    return;
  }
  setPasoActual(3); // Avanzar a pago
  showNotification('Productos agregados. Continúe con el registro del pago', 'success');
};
// Procesar pago y enviar todo al backend
const procesarPago = async () => {
  if (!montoPagado || parseFloat(montoPagado) <= 0) {
    showNotification('Error: Ingrese un monto válido', 'error');
    return;
  }
  if (parseFloat(montoPagado) < totalVenta) {
    showNotification('Error: El monto pagado es menor al total de la venta', 'error');
    return;
  }
  setLoading(true);
  try {
    // Validar clienteId antes de enviar
    if (!ventaTemp || !ventaTemp.clienteId || isNaN(ventaTemp.clienteId)) {
      showNotification('Error: Debe seleccionar un cliente válido antes de registrar la venta.', 'error');
      setLoading(false);
      return;
    }
    // Preparar estructura completa de la venta
    const ventaCompleta = {
      clienteId: ventaTemp.clienteId,
      empleadoId: ventaTemp.empleadoId,
      detalles: detallesVenta.map(detalle => ({
        productoId: detalle.productoId,
        cantidad: detalle.cantidad
      })),
      montoPagado: parseFloat(montoPagado),
      metodoPago: metodoPago
    };
    console.log('Enviando ventaCompleta a la API:', JSON.stringify(ventaCompleta, null, 2));
    // Enviar todo en una sola llamada
    await ventasAPI.crearVentaCompleta(ventaCompleta);
    setVentaTemp(null);
    setDetallesVenta([]);
    setMontoPagado('');
    setMetodoPago('EFECTIVO');
    setFormData({ empleadoId: empleados[0]?.id || '', clienteId: '' });
    setDni('');
    setClienteEncontrado(null);
    setPasoActual(4); // Confirmación
    showNotification('Venta registrada exitosamente', 'success');
  } catch (error) {
    showNotification(`Error al registrar la venta: ${error.message}`, 'error');
    console.error('Error al registrar la venta:', error);
  } finally {
    setLoading(false);
  }
};

  // (Eliminado: recargarDatos no se utiliza)

  // Función para seleccionar producto
  const seleccionarProducto = (productoId) => {
    try {
      const producto = productos.find(p => p.id === productoId);
      if (!producto) {
        showNotification('Producto no encontrado', 'error');
        return;
      }
      
      setProductoSeleccionado(producto);
      setCantidad(1);
      showNotification(`Producto "${producto.nombre}" seleccionado`, 'success');
    } catch (error) {
      console.error('Error al seleccionar producto:', error);
      showNotification('Error al seleccionar el producto', 'error');
    }
  };

  // Función para filtrar productos
  const productosFiltrados = productos.filter(producto => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busquedaProducto.toLowerCase());
    const coincideCategoria = filtroCategoriaProducto === 'TODOS' || producto.categoria === filtroCategoriaProducto;
    return coincideBusqueda && coincideCategoria;
  });

  const showNotification = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  // Calcular total de la venta cuando cambian los detalles
  useEffect(() => {
    const total = detallesVenta.reduce((sum, detalle) => 
      sum + (detalle.cantidad * detalle.producto.precio), 0
    );
    setTotalVenta(total);
  }, [detallesVenta]);
  const buscarClientePorDNI = () => {
    if (!dni.trim()) {
      showNotification('Por favor, ingrese un DNI válido', 'error');
      return;
    }

    console.log('Buscando cliente con DNI:', dni);
    console.log('Lista de clientes:', clientes);

    // Buscar en la lista de clientes cargada
    const cliente = clientes.find(cli => cli.dni === dni);
    
    if (!cliente) {
      setClienteEncontrado(null);
      setFormData(prev => ({
        ...prev,
        clienteId: ''
      }));
      showNotification('No se encontró ningún cliente con ese DNI', 'error');
      return;
    }

    console.log('Cliente encontrado:', cliente);
    setClienteEncontrado(cliente);
    // Actualizar el formData con el ID del cliente encontrado usando el formato correcto
    setFormData(prev => ({
      ...prev,
      clienteId: `cli-${cliente.clienteId}`
    }));
    showNotification('Cliente encontrado', 'success');
  };

  const handleDNIChange = (e) => {
    const value = e.target.value;
    if (value.length <= 8 && /^\d*$/.test(value)) {
      setDni(value);
      // Limpiar cliente encontrado si se modifica el DNI
      if (clienteEncontrado) {
        setClienteEncontrado(null);
        setFormData(prev => ({
          ...prev,
          clienteId: ''
        }));
      }
    }
  };

  if (loading && !empleados.length && !clientes.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

// Progreso visual
const ProgresoVenta = ({ pasoActual }) => {
  const pasos = [
    { numero: 1, nombre: 'Datos cliente' },
    { numero: 2, nombre: 'Productos' },
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

return (
  <div className="space-y-6 p-6">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Venta</h1>
        <p className="text-gray-500">Registra una nueva venta</p>
      </div>
    </div>
    <ProgresoVenta pasoActual={pasoActual} />

    {formErrors.fetch && (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <Text color="red">{formErrors.fetch}</Text>
        </div>
      </div>
    )}

    {/* Paso 1: Datos básicos */}
    {pasoActual === 1 && (
      <Card className="mb-6">
        <div className="mb-4">
          <Title className="flex items-center gap-2">
            <User className="text-red-600 mr-1" size={22} /> Datos del Cliente
          </Title>
          <Text className="text-gray-500 mt-2 block">Busca y selecciona el cliente para la venta</Text>
        </div>
        <form
          className="flex flex-col sm:flex-row gap-2 mb-4"
          onSubmit={e => {
            e.preventDefault();
            if (!dni.trim() || loading) return;
            buscarClientePorDNI();
          }}
        >
          <div className="flex-1 relative">
            <TextInput
              placeholder="Ingrese DNI del cliente"
              value={dni}
              onChange={handleDNIChange}
              maxLength={8}
              icon={User}
              className="pr-8"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (!dni.trim() || loading) return;
                  buscarClientePorDNI();
                }
              }}
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
              if (!dni.trim() || loading) return;
              buscarClientePorDNI();
            }}
            icon={Search}
            disabled={!dni.trim() || loading}
            className="bg-red-600 hover:bg-red-700 text-white px-4"
          >
            Buscar
          </Button>
        </form>
        {clienteEncontrado && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="text-green-600" size={22} />
            <Text className="text-green-700 font-medium">
              Cliente encontrado: {clienteEncontrado.nombreCompleto} (DNI: {clienteEncontrado.dni})
            </Text>
          </div>
        )}
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleSubmit}
            icon={loading ? Loader2 : ShoppingCart}
            disabled={loading || !clienteEncontrado}
            variant="primary"
            className="bg-red-600 hover:bg-red-700 text-white w-full"
          >
            {loading ? 'Procesando...' : 'Crear Venta'}
          </Button>
        </div>
      </Card>
    )}

    {/* Paso 2: Detalles de venta */}
    {pasoActual === 2 && (
      <Card>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Title>Seleccionar Productos</Title>
          </div>
          
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
                <Text className="mb-2 font-medium">Buscar producto</Text>
                <TextInput
                  placeholder="Buscar por nombre del producto..."
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  icon={Search}
                  className="bg-white"
                />
              </div>
              <div>
                <Text className="mb-2 font-medium">Filtrar por categoría</Text>
                <SearchSelect
                  value={filtroCategoriaProducto}
                  onValueChange={setFiltroCategoriaProducto}
                  className="bg-white"
                >
                  <SearchSelectItem value="TODOS">Todas las categorías</SearchSelectItem>
                  {categorias.map(categoria => (
                    <SearchSelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SearchSelectItem>
                  ))}
                </SearchSelect>
              </div>
            </div>
            
            {/* Contador de resultados */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <Text className="text-sm text-gray-600">
                Mostrando {productosFiltrados.length} de {productos.length} productos
                {busquedaProducto && ` que contienen "${busquedaProducto}"`}
                {filtroCategoriaProducto !== 'TODOS' && ` de la categoría ${filtroCategoriaProducto}`}
              </Text>
            </div>
          </div>

          {/* Producto seleccionado */}
          {productoSeleccionado && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Text className="font-semibold text-lg text-green-800">
                    {productoSeleccionado.nombre}
                  </Text>
                  <Text className="text-green-600">
                    Precio: S/ {productoSeleccionado.precio.toFixed(2)} | Stock: {productoSeleccionado.stockTotal}
                  </Text>
                </div>
                <Button
                  size="sm"
                  variant="light"
                  onClick={() => setProductoSeleccionado(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Text className="mb-2 font-medium">Cantidad</Text>
                  <NumberInput
                    value={cantidad}
                    onValueChange={(value) => {
                      if (value > productoSeleccionado.stockTotal) {
                        showNotification(`Cantidad máxima disponible: ${productoSeleccionado.stockTotal}`, 'warning');
                        setCantidad(productoSeleccionado.stockTotal);
                      } else {
                        setCantidad(value);
                      }
                    }}
                    min={1}
                    max={productoSeleccionado.stockTotal}
                    className="w-32"
                  />
                </div>
                <Button
                  icon={Plus}
                  variant="primary"
                  onClick={agregarDetalle}
                  disabled={!productoSeleccionado || cantidad <= 0}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Agregar al Detalle
                </Button>
              </div>
            </div>
          )}
          
          {/* Lista de productos filtrados */}
          {productosFiltrados.length === 0 ? (
            <div className="p-8 text-center border border-gray-200 rounded-lg">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <Text className="text-gray-500 mb-2">No se encontraron productos</Text>
              <Text className="text-sm text-gray-400">
                {busquedaProducto || filtroCategoriaProducto !== 'TODOS' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay productos disponibles en este momento'
                }
              </Text>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {productosFiltrados.map(producto => (
                <div 
                  key={producto.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    productoSeleccionado?.id === producto.id 
                      ? 'border-green-500 bg-green-50' 
                      : 'hover:border-red-500 hover:bg-red-50'
                  } ${producto.stockTotal === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => producto.stockTotal > 0 && seleccionarProducto(producto.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{producto.nombre}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      producto.stockTotal > 10 ? 'bg-green-100 text-green-700' : 
                      producto.stockTotal > 0 ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      Stock: {producto.stockTotal}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>💰 Precio: S/ {producto.precio.toFixed(2)}</p>
                    <p>📦 Categoría: {producto.categoria}</p>
                  </div>
                  <Button 
                    className={`w-full mt-3 ${
                      producto.stockTotal === 0 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                    size="sm"
                    disabled={loading || producto.stockTotal === 0}
                  >
                    {producto.stockTotal === 0 ? 'Sin Stock' : 'Seleccionar'}
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
          
          {detallesVenta.length > 0 && (
            <div>
              <Text className="mb-4 font-medium text-lg">Productos Agregados:</Text>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Producto</TableHeaderCell>
                    <TableHeaderCell>Stock</TableHeaderCell>
                    <TableHeaderCell>Cantidad</TableHeaderCell>
                    <TableHeaderCell>Precio Unit. (con IGV)</TableHeaderCell>
                    <TableHeaderCell>Subtotal (con IGV)</TableHeaderCell>
                    <TableHeaderCell className="text-right">Acciones</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detallesVenta.map((detalle, index) => (
                    <TableRow key={index}>
                      <TableCell>{detalle.producto.nombre}</TableCell>
                      <TableCell>
                        {productos.find(p => p.id === detalle.productoId)?.stockTotal || 0}
                      </TableCell>
                      <TableCell>
                        <NumberInput
                          value={detalle.cantidad}
                          onValueChange={(value) => actualizarCantidad(detalle.productoId, value)}
                          min={1}
                          max={productos.find(p => p.id === detalle.productoId)?.stockTotal || 1}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>S/ {detalle.producto.precio.toFixed(2)}</TableCell>
                      <TableCell>S/ {(detalle.cantidad * detalle.producto.precio).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="light"
                          color="red"
                          icon={Trash2}
                          onClick={() => eliminarDetalle(detalle.productoId)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Desglose debajo de la tabla */}
              {detallesVenta.length > 0 && (() => {
                const IGV_RATE = 0.18;
                // Calcular subtotal sin IGV
                const subtotalSinIGV = detallesVenta.reduce((sum, detalle) => {
                  const precioSinIGV = detalle.producto.precio / (1 + IGV_RATE);
                  return sum + (detalle.cantidad * precioSinIGV);
                }, 0);
                const igv = subtotalSinIGV * IGV_RATE;
                const total = subtotalSinIGV + igv;
                return (
                  <div className="mt-4 text-right space-y-1">
                    <div>
                      <span className="font-medium">Op. Grabada (sin IGV):</span>
                      <span className="ml-4">S/ {subtotalSinIGV.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="font-medium">IGV (18%):</span>
                      <span className="ml-4">S/ {igv.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="font-bold">Total:</span>
                      <span className="ml-4 font-bold">S/ {total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              variant="primary"
              icon={loading ? Loader2 : CreditCard}
              disabled={loading || detallesVenta.length === 0}
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
      <Card>
        <div className="space-y-6">
          <Title>Procesar Pago</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Text className="mb-2">Método de Pago</Text>
              <select
                value={metodoPago}
                onChange={(e) => {
                  setMetodoPago(e.target.value);
                  if (e.target.value === 'TARJETA' || e.target.value === 'BILLETERAS') {
                    setMontoPagado(totalVenta.toFixed(2));
                  } else {
                    setMontoPagado('');
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="BILLETERAS">Billeteras Digitales</option>
              </select>
            </div>
            <div>
              <Text className="mb-2">Monto Recibido</Text>
              <NumberInput
                value={montoPagado}
                onValueChange={setMontoPagado}
                placeholder="0.00"
                min={0}
                step={0.01}
                enableStepper={false}
                disabled={metodoPago === 'TARJETA' || metodoPago === 'BILLETERAS'}
              />
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <Flex justifyContent="between" className="font-semibold">
                <Text>Total a Pagar:</Text>
                <Text>S/ {totalVenta.toFixed(2)}</Text>
              </Flex>
              {parseFloat(montoPagado) > totalVenta && (
                <Flex justifyContent="between" className="text-blue-600">
                  <Text>Vuelto:</Text>
                  <Text>S/ {(parseFloat(montoPagado) - totalVenta).toFixed(2)}</Text>
                </Flex>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              icon={loading ? Loader2 : CheckCircle}
              disabled={loading || !montoPagado || parseFloat(montoPagado) < totalVenta}
              onClick={procesarPago}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Procesando...' : 'Finalizar Venta'}
            </Button>
          </div>
        </div>
      </Card>
    )}

    {/* Paso 4: Confirmación */}
    {pasoActual === 4 && (
      <Card className="p-8 text-center">
        <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
        <Title>¡Venta registrada exitosamente!</Title>
        <Text>La venta ha sido registrada y procesada correctamente.</Text>
        <Button
          className="mt-6 bg-red-600 hover:bg-red-700 text-white"
          variant="primary"
          onClick={() => {
            setPasoActual(1);
            showNotification('Listo para registrar una nueva venta', 'info');
          }}
        >
          Registrar otra venta
        </Button>
      </Card>
    )}

    <Snackbar
      open={openSnackbar}
      autoHideDuration={6000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      {/* Patrón verde para success y para el mensaje especial de info */}
      {(snackbarSeverity === 'success' || snackbarMessage === 'Listo para registrar una nueva venta') ? (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg shadow text-green-700 font-medium min-w-[300px]">
          <CheckCircle className="text-green-600" />
          <span className="text-green-700 font-medium">{snackbarMessage}</span>
        </div>
      ) : (
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      )}
    </Snackbar>
  </div>
);
};

export default VentaPage;
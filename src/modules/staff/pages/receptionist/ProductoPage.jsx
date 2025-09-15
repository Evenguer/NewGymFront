import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../../shared/hooks/useNotification';
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
  TabGroup,
  TabList,
  Tab
} from '@tremor/react';
import { Edit, Trash2, Search, PlusCircle, RefreshCw } from 'react-feather';
import { productosAPI } from '../../../staff/services/productosAPI';
import { showConfirmDeleteToast } from '../../../../shared/components/ConfirmDeleteToast';
import { categoriaAPI } from '../../../admin/services/CategoriaAPI';
import ProductoModal from '../../components/receptionist/ProductoModal';

const ProductoPage = () => {
  const notify = useNotification();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Contadores para tabs
  const [counters, setCounters] = useState({
    total: 0,
    activos: 0,
    inactivos: 0
  });
  const [activeTab, setActiveTab] = useState('todos');

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await productosAPI.listarProductos();
      setProductos(response);
      setCounters({
        total: response.length,
        activos: response.filter(p => p.estado).length,
        inactivos: response.filter(p => !p.estado).length
      });
      // notify.success eliminado para evitar mostrar mensaje al recargar/entrar a la página
    } catch (err) {
      setError('Error al cargar los productos');
      console.error('Error:', err.message);
      notify.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await categoriaAPI.listarCategorias();
      if (Array.isArray(response)) {
        setCategorias(response.filter(cat => cat.estado)); // Solo mostrar categorías activas
      } else {
      setError('Error al cargar las categorías: formato de respuesta inválido');
      setCategorias([]);
      notify.error('Error al cargar las categorías');
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setError('Error al cargar las categorías. Por favor, intenta nuevamente.');
      setCategorias([]);
      notify.error('Error al cargar las categorías');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProductos(), fetchCategorias()]);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleToggleEstado = async (id, estadoActual) => {
    try {
      const response = await productosAPI.cambiarEstadoProducto(id, !estadoActual);
      if (response) {
        const nuevos = productos.map(prod => 
          prod.idProducto === id ? {...prod, estado: !estadoActual} : prod
        );
        setProductos(nuevos);
        setCounters({
          total: nuevos.length,
          activos: nuevos.filter(p => p.estado).length,
          inactivos: nuevos.filter(p => !p.estado).length
        });
        notify.success('Estado del producto actualizado correctamente');
      }
    } catch (err) {
      console.error('Error al cambiar el estado del producto:', err);
      if (err.message === 'No tienes permisos para realizar esta acción') {
        notify.error('No tienes permisos para cambiar el estado del producto');
      } else {
        notify.error('Error al cambiar el estado del producto. Por favor, intenta nuevamente.');
      }
    }
  };

  const handleDelete = async (id) => {
    showConfirmDeleteToast({
      message: '¿Estás seguro de que quieres eliminar este producto?',
      onConfirm: async () => {
        try {
          await productosAPI.eliminarProducto(id);
          const nuevos = productos.filter(prod => prod.idProducto !== id);
          setProductos(nuevos);
          setCounters({
            total: nuevos.length,
            activos: nuevos.filter(p => p.estado).length,
            inactivos: nuevos.filter(p => !p.estado).length
          });
          notify.success('Producto eliminado correctamente');
        } catch (err) {
          console.error('Error al eliminar el producto:', err.message);
          notify.error('Error al eliminar el producto');
        }
      }
    });
  };

  const handleEdit = (producto) => {
    setSelectedProduct(producto);
    setIsModalOpen(true);
  };

  const handleOpenModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const handleProductSuccess = (updatedProducto) => {
    let nuevos;
    if (selectedProduct) {
      // Actualizar producto existente
      nuevos = productos.map(prod => 
        prod.idProducto === updatedProducto.idProducto ? updatedProducto : prod
      );
    } else {
      // Agregar nuevo producto
      nuevos = [...productos, updatedProducto];
    }
    setProductos(nuevos);
    setCounters({
      total: nuevos.length,
      activos: nuevos.filter(p => p.estado).length,
      inactivos: nuevos.filter(p => !p.estado).length
    });
    if (selectedProduct) {
      notify.success('Producto actualizado correctamente');
    } else {
      notify.success('Producto agregado correctamente');
    }
    // Cerrar el modal después de actualizar los datos
    handleCloseModal();
  };

  const filteredProductos = productos.filter(prod => {
    const matchesSearch = prod.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'activos') return matchesSearch && prod.estado;
    if (activeTab === 'inactivos') return matchesSearch && !prod.estado;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
        <p className="font-medium">Error</p>
        <p>{error}</p>
        <button 
          onClick={fetchProductos}
          className="mt-2 flex items-center text-sm bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded"
        >
          <RefreshCw size={14} className="mr-1" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-sm sm:text-base text-gray-500">Administra los productos del gimnasio</p>
        </div>
        <Button 
          icon={PlusCircle} 
          size="sm" 
          variant="primary" 
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
          onClick={handleOpenModal}
        >
          Nuevo Producto
        </Button>
      </div>
      <Card className="overflow-hidden">
        <Flex justifyContent="between" className="flex-col sm:flex-row gap-4 sm:gap-0 mb-4">
          <Title className="text-base sm:text-lg">Lista de Productos</Title>
          <div className="w-full sm:w-64">
            <TextInput
              icon={Search}
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Flex>
        <TabGroup className="mb-4 sm:mb-6" onIndexChange={(index) => {
          const tabs = ['todos', 'activos', 'inactivos'];
          setActiveTab(tabs[index]);
        }}>
          <TabList variant="solid" className="overflow-x-auto">
            <Tab className="text-sm sm:text-base whitespace-nowrap">Todos <span className="ml-1"><span className="inline-block bg-gray-200 text-gray-800 rounded px-2 text-xs">{counters.total}</span></span></Tab>
            <Tab className="text-sm sm:text-base whitespace-nowrap">Activos <span className="ml-1"><span className="inline-block bg-green-200 text-green-800 rounded px-2 text-xs">{counters.activos}</span></span></Tab>
            <Tab className="text-sm sm:text-base whitespace-nowrap">Inactivos <span className="ml-1"><span className="inline-block bg-red-200 text-red-800 rounded px-2 text-xs">{counters.inactivos}</span></span></Tab>
          </TabList>
        </TabGroup>

        {/* Vista móvil - Cards */}
        <div className="block sm:hidden">
          {filteredProductos.length > 0 ? (
            <div className="space-y-3">
              {filteredProductos.map((producto) => (
                <div key={producto.idProducto} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{producto.nombre}</p>
                      <p className="text-sm text-gray-500">{producto.categoria.nombre}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(producto)}
                        className="p-1.5 bg-amber-100 text-amber-600 rounded hover:bg-amber-200"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(producto.idProducto)}
                        className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Precio:</p>
                      <p>S/ {producto.precioVenta}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Stock:</p>
                      <p className={producto.stockTotal <= producto.stockMinimo ? 'text-red-600' : ''}>
                        {producto.stockTotal}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Vencimiento:</p>
                      <p>{new Date(producto.fechaVencimiento).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Estado:</p>
                      <button
                        onClick={() => handleToggleEstado(producto.idProducto, producto.estado)}
                        className="flex items-center gap-2"
                      >
                        <div className={`relative inline-flex h-5 w-9 items-center rounded-full ${
                          producto.estado ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                            producto.estado ? 'translate-x-5' : 'translate-x-1'
                          }`} />
                        </div>
                        <span className="text-xs">
                          {producto.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No se encontraron productos
            </div>
          )}
        </div>

        {/* Vista desktop - Tabla */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nombre</TableHeaderCell>
                <TableHeaderCell>Categoría</TableHeaderCell>
                <TableHeaderCell>Precio Venta</TableHeaderCell>
                <TableHeaderCell>Stock</TableHeaderCell>
                <TableHeaderCell>Fecha Vencimiento</TableHeaderCell>
                <TableHeaderCell>Estado</TableHeaderCell>
                <TableHeaderCell>Acciones</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProductos.length > 0 ? (
                filteredProductos.map((producto) => (
                  <TableRow key={producto.idProducto}>
                    <TableCell className="font-medium">{producto.nombre}</TableCell>
                    <TableCell>{producto.categoria.nombre}</TableCell>
                    <TableCell>S/ {producto.precioVenta}</TableCell>
                    <TableCell>
                      <span className={producto.stockTotal <= producto.stockMinimo ? 'text-red-600' : ''}>
                        {producto.stockTotal}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(producto.fechaVencimiento).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleEstado(producto.idProducto, producto.estado)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          producto.estado ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            producto.estado ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="ml-2 text-xs">
                        {producto.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(producto)}
                          className="p-1.5 bg-amber-100 text-amber-600 rounded hover:bg-amber-200"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(producto.idProducto)}
                          className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ProductoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        producto={selectedProduct}
        categorias={categorias}
        onSuccess={handleProductSuccess}
      />
    </div>
  );
};

export default ProductoPage;
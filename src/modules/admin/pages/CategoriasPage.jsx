import React, { useState, useEffect } from 'react';
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
  Badge,
  Flex,
  TabGroup,
  TabList,
  Tab
} from '@tremor/react';
import { Edit, Trash2, Search, PlusCircle, RefreshCw } from 'react-feather';
import { categoriaAPI } from '../services/CategoriaAPI';
import CategoriaModal from '../components/Categorias/CategoriaModal';
import { ActionButtons } from '../components/common/ActionButtons';
import { useNotification } from '../../../shared/hooks/useNotification';

const CategoriasPage = () => {
  const notify = useNotification();
  
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    descripcion: '',
    estado: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState('todas');
  const [counters, setCounters] = useState({
    total: 0,
    activas: 0,
    inactivas: 0
  });

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const data = await categoriaAPI.listarCategorias();
      setCategorias(data);
      setCounters({
        total: data.length,
        activas: data.filter(cat => cat.estado).length,
        inactivas: data.filter(cat => !cat.estado).length
      });
      setError(null);
      setLoading(false);
    } catch {
      setError('Error al cargar las categorías');
      setLoading(false);
      // Optionally, you can log the error if needed
    }
  };
  
  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleToggleEstado = async (id, estadoActual) => {
    try {
      const response = await categoriaAPI.cambiarEstadoCategoria(id, !estadoActual);
      if (response) {
        setCategorias(prev => {
          const nuevasCategorias = prev.map(cat =>
            cat.idCategoria === id ? { ...cat, estado: response.estado } : cat
          );
          setCounters({
            total: nuevasCategorias.length,
            activas: nuevasCategorias.filter(cat => cat.estado).length,
            inactivas: nuevasCategorias.filter(cat => !cat.estado).length
          });
          return nuevasCategorias;
        });
        notify.success(`Categoría ${!estadoActual ? 'activada' : 'desactivada'} correctamente`);
      }
    } catch {
      notify.error('Error al cambiar el estado de la categoría');
    }
  };

  const handleDelete = async (id) => {
    import('../../../shared/components/ConfirmDeleteToast').then(({ showConfirmDeleteToast }) => {
      showConfirmDeleteToast({
        message: '¿Estás seguro de que quieres eliminar esta categoría?',
        onConfirm: async () => {
          try {
            await categoriaAPI.eliminarCategoria(id);
            setCategorias(categorias.filter(cat => cat.idCategoria !== id));
            notify.success('Categoría eliminada correctamente');
          } catch {
            notify.error('Error al eliminar la categoría');
          }
        },
      });
    });
  };
  
  const handleEdit = (categoria) => {
    setFormData({
      id: categoria.idCategoria,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      estado: categoria.estado
    });    
    setIsModalOpen(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }
    if (!formData.descripcion.trim()) {
      errors.descripcion = 'La descripción es requerida';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (formData.id) {
        // Actualizar categoría existente
        const categoriaData = {
          idCategoria: formData.id,
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          estado: formData.estado
        };
        
        const response = await categoriaAPI.actualizarCategoria(categoriaData);
        
        if (response) {
          // Actualizar la lista con la respuesta del servidor
          setCategorias(categorias.map(cat => 
            cat.idCategoria === formData.id ? response : cat
          ));
          notify.success('Categoría actualizada correctamente');
        }
      } else {
        // Crear nueva categoría
        const categoriaData = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          estado: formData.estado
        };
        
        const response = await categoriaAPI.guardarCategoria(categoriaData);
        
        if (response) {
          // Añadir la nueva categoría a la lista
          setCategorias([...categorias, response]);
          notify.success('Categoría creada correctamente');
        }
      }
      
      resetForm();
    } catch {
      notify.error('Error al guardar la categoría');
    }
  };
    const resetForm = () => {
    setFormData({
      id: null,
      nombre: '',
      descripcion: '',
      estado: true
    });
    setFormErrors({});
    setIsModalOpen(false);
  };
  
  const filteredCategorias = categorias.filter(cat => {
    const matchSearch = cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    switch (activeTab) {
      case 'activas':
        return matchSearch && cat.estado === true;
      case 'inactivas':
        return matchSearch && cat.estado === false;
      default:
        return matchSearch;
    }
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
          onClick={fetchCategorias}
          className="mt-2 flex items-center text-sm bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded"
        >
          <RefreshCw size={14} className="mr-1" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion de Categorías</h1>
          <p className="text-gray-500">Administra las categorías de productos del gimnasio</p>
        </div>
        <Button 
          icon={PlusCircle} 
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white" // Igual que EspecialidadesPage
        >
          Nueva Categoría
        </Button>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title>Lista de Categorías</Title>
          <div className="w-64">
            <TextInput
              icon={Search}
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabGroup
          className="mb-6"
          onIndexChange={(index) => {
            const tabs = ['todas', 'activas', 'inactivas'];
            setActiveTab(tabs[index]);
          }}
        >
          <TabList variant="solid">
            <Tab className={activeTab === 'todas' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}>
              Todas <Badge size="xs" color="blue">{counters.total}</Badge>
            </Tab>
            <Tab className={activeTab === 'activas' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}>
              Activas <Badge size="xs" color="green">{counters.activas}</Badge>
            </Tab>
            <Tab className={activeTab === 'inactivas' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}>
              Inactivas <Badge size="xs" color="red">{counters.inactivas}</Badge>
            </Tab>
          </TabList>
        </TabGroup>

        <CategoriaModal
          isOpen={isModalOpen}
          onClose={resetForm}
          formData={formData}
          formErrors={formErrors}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
        
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Nombre</TableHeaderCell>
              <TableHeaderCell>Descripción</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCategorias.length > 0 ? (
              filteredCategorias.map((categoria) => (
                <TableRow key={categoria.idCategoria}>
                  <TableCell>{categoria.nombre}</TableCell>
                  <TableCell>{categoria.descripcion}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleEstado(categoria.idCategoria, categoria.estado)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none ${
                        categoria.estado ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          categoria.estado ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="ml-2 text-sm">
                      {categoria.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell>


                    <div className="flex gap-2">
                      <button
                        type="button"
                        aria-label="Editar"
                        className="px-2 py-2 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 hover:border-orange-600 font-medium bg-transparent flex items-center justify-center"
                        onClick={() => handleEdit(categoria)}
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        type="button"
                        aria-label="Eliminar"
                        className="px-2 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-700 font-medium bg-transparent flex items-center justify-center"
                        onClick={() => handleDelete(categoria.idCategoria)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  {searchTerm ? 'No se encontraron categorías' : 'No hay categorías disponibles'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default CategoriasPage;
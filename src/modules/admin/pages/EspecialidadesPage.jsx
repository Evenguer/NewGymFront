import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../shared/hooks/useNotification';
import {
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Title,
  Badge,
  Button,
  TextInput,
  TabGroup,
  TabList,
  Tab,
} from '@tremor/react';
import { ActionButtons } from '../components/common/ActionButtons';
import { PlusCircle, Search, Edit, Trash2 } from 'react-feather';
import { useAuth } from '../../../shared/hooks/useAuth';
import * as especialidadAPI from '../../../shared/services/especialidadAPI';
import EspecialidadModal from '../components/Especialidades/EspecialidadModal';

const EspecialidadesPage = () => {
  const notify = useNotification();
  const { user } = useAuth();
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [selectedEspecialidad, setSelectedEspecialidad] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [counters, setCounters] = useState({
    total: 0,
    activas: 0,
    inactivas: 0
  });

  const fetchEspecialidades = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await especialidadAPI.listEspecialidades(token);
      setEspecialidades(data);
      
      setCounters({
        total: data.length,
        activas: data.filter(esp => esp.estado).length,
        inactivas: data.filter(esp => !esp.estado).length
      });
    } catch (error) {
      console.error('Error al cargar especialidades:', error);
      setError('Error al cargar las especialidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  const handleToggleStatus = async (id, estadoActual) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        notify.error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
        return;
      }

      await especialidadAPI.cambiarEstadoEspecialidad(id, !estadoActual, token);
      
      // Actualizar estado local solo si la petición fue exitosa
      setEspecialidades(especialidades.map(esp => 
        esp.id === id ? { ...esp, estado: !estadoActual } : esp
      ));
      
      // Actualizar contadores
      setCounters(prev => ({
        ...prev,
        activas: estadoActual ? prev.activas - 1 : prev.activas + 1,
        inactivas: estadoActual ? prev.inactivas + 1 : prev.inactivas - 1
      }));

      // Eliminar toast de carga y mostrar éxito
      notify.success('Estado actualizado correctamente');
    } catch (error) {
      // Manejar errores específicos
      if (error.message.includes('No tienes permisos')) {
        notify.error('No tienes permisos para realizar esta acción');
      } else if (error.message.includes('Sesión expirada')) {
        notify.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        // Opcional: redirigir al login
        // navigate('/login');
      } else {
        notify.error(error.message || 'Error al actualizar el estado');
      }
      
      console.error('Error al cambiar estado:', error);
    }
  };

  const handleCreateEspecialidad = () => {
    setSelectedEspecialidad(null);
    setIsModalOpen(true);
  };

  const handleEditEspecialidad = (especialidad) => {
    setSelectedEspecialidad(especialidad);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEspecialidad(null);
  };

  const handleSaveEspecialidad = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      if (selectedEspecialidad) {
        await especialidadAPI.actualizarEspecialidad({ ...formData, id: selectedEspecialidad.id }, token);
        notify.success('Especialidad actualizada correctamente');
      } else {
        await especialidadAPI.crearEspecialidad(formData, token);
        notify.success('Especialidad creada correctamente');
      }
      await fetchEspecialidades();
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
      notify.error(selectedEspecialidad ? 
        'Error al actualizar la especialidad' : 
        'Error al crear la especialidad'
      );
    }
  };

  // Función auxiliar para verificar si el usuario es administrador
  const isAdmin = () => {
    if (!user?.roles) return false;
    return user.roles.some(role => 
      typeof role === 'string' 
        ? role.includes('ADMIN') || role === 'ROLE_ADMIN'
        : (role.authority?.includes('ADMIN') || role.nombre?.includes('ADMIN'))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchEspecialidades}>Reintentar</Button>
      </div>
    );
  }

  const filteredEspecialidades = especialidades.filter(esp => {
    if (activeTab === 'activas' && !esp.estado) return false;
    if (activeTab === 'inactivas' && esp.estado) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        esp.nombre.toLowerCase().includes(searchLower) ||
        esp.descripcion.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion de Especialidades</h1>
          <p className="text-gray-500">Administra las especialidades del gimnasio</p>
        </div>
        {isAdmin() && (
          <Button
            icon={PlusCircle}
            onClick={handleCreateEspecialidad}
            className="bg-red-600 hover:bg-red-700 text-white"
            size="sm"
          >
            Nueva Especialidad
          </Button>
        )}
      </div>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title>Lista de Especialidades</Title>
          <div className="w-64">
            <TextInput
              icon={Search}
              placeholder="Buscar especialidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabGroup
          className="mb-6"
          onIndexChange={(index) => {
            const tabs = ['todos', 'activas', 'inactivas'];
            setActiveTab(tabs[index]);
          }}
        >
          <TabList variant="solid">
            <Tab>Todas <Badge size="xs">{counters.total}</Badge></Tab>
            <Tab>Activas <Badge size="xs" color="green">{counters.activas}</Badge></Tab>
            <Tab>Inactivas <Badge size="xs" color="red">{counters.inactivas}</Badge></Tab>
          </TabList>
        </TabGroup>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Especialidad</TableHeaderCell>
              <TableHeaderCell>Descripción</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEspecialidades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No se encontraron especialidades
                </TableCell>
              </TableRow>
            ) : (
              filteredEspecialidades.map((especialidad) => (
                <TableRow key={especialidad.id}>
                  <TableCell>
                    <div className="text-gray-500">{especialidad.nombre}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-gray-500">{especialidad.descripcion}</div>
                  </TableCell>
                  <TableCell>
                    {isAdmin() ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(especialidad.id, especialidad.estado)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            especialidad.estado ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span className="sr-only">Cambiar estado</span>
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              especialidad.estado ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-sm text-gray-500">
                          {especialidad.estado ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    ) : (
                      <Badge color={especialidad.estado ? 'green' : 'red'}>
                        {especialidad.estado ? 'Activa' : 'Inactiva'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {isAdmin() && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditEspecialidad(especialidad)}
                          className="px-2 py-2 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 hover:border-orange-600 font-medium bg-transparent flex items-center justify-center"
                          title="Editar"
                          aria-label="Editar"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => {
                            import('../../../shared/components/ConfirmDeleteToast').then(({ showConfirmDeleteToast }) => {
                              showConfirmDeleteToast({
                                message: '¿Estás seguro de que quieres eliminar esta especialidad?',
                                onConfirm: async () => {
                                  try {
                                    const token = localStorage.getItem('token');
                                    await especialidadAPI.eliminarEspecialidad(especialidad.id, token);
                                    notify.success('Especialidad eliminada correctamente');
                                    await fetchEspecialidades();
                                  } catch (error) {
                                    notify.error(error.message || 'Error al eliminar la especialidad');
                                  }
                                },
                              });
                            });
                          }}
                          className="px-2 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-700 font-medium bg-transparent flex items-center justify-center"
                          title="Eliminar"
                          aria-label="Eliminar"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {isModalOpen && (
        <EspecialidadModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveEspecialidad}
          especialidad={selectedEspecialidad}
        />
      )}
    </div>
  );
};

export default EspecialidadesPage;

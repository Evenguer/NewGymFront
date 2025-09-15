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
  Select,
  SelectItem,
  TabGroup,
  TabList,
  Tab,
} from '@tremor/react';

import { PlusCircle, Search, CreditCard, Edit, Trash2 } from 'react-feather';
import { useAuth } from '../../../shared/hooks/useAuth';
import { listPlanes, cambiarEstadoPlan, eliminarPlan } from '../../../shared/services/planAPI';
import PlanModal from '../components/Planes/PlanModal';

const PlanesPage = () => {
  useAuth();
  const notify = useNotification();
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [counters, setCounters] = useState({
    total: 0,
    activos: 0,
    inactivos: 0
  });

  const fetchPlanes = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await listPlanes(token);
      setPlanes(data);
      
      // Actualizar contadores
      setCounters({
        total: data.length,
        activos: data.filter(plan => plan.estado).length,
        inactivos: data.filter(plan => !plan.estado).length
      });
    } catch (error) {
      console.error('Error al cargar planes:', error);
      notify.error('Error al cargar la lista de planes');
      setError('Error al cargar los planes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  const handleToggleStatus = async (id, estadoActual) => {
    try {
      const token = localStorage.getItem('token');
      await cambiarEstadoPlan(id, !estadoActual, token);

      // Actualizar estado local y contadores
      setPlanes(prevPlanes => {
        const nuevosPlanes = prevPlanes.map(plan =>
          plan.idPlan === id ? { ...plan, estado: !estadoActual } : plan
        );
        setCounters({
          total: nuevosPlanes.length,
          activos: nuevosPlanes.filter(p => p.estado).length,
          inactivos: nuevosPlanes.filter(p => !p.estado).length
        });
        return nuevosPlanes;
      });

      notify.success('Estado del plan actualizado correctamente');
    } catch (error) {
      if (error.message && error.message.includes('permisos')) {
        notify.error('No tienes permisos para cambiar el estado del plan');
      } else if (error.message && error.message.includes('expirada')) {
        notify.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      } else {
        notify.error(error.message || 'Error al actualizar el estado del plan');
      }
      console.error('Error al cambiar estado:', error);
    }
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleSavePlan = async () => {
    await fetchPlanes();
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const filteredPlanes = planes.filter(plan => {
    const matchesSearch = searchTerm === '' || 
      plan.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (activeTab) {
      case 'activos':
        return matchesSearch && plan.estado;
      case 'inactivos':
        return matchesSearch && !plan.estado;
      default:
        return matchesSearch;
    }
  });

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion de Planes</h1>
          <p className="text-gray-500">Administra los planes del gimnasio</p>
        </div>
        <Button variant="primary" icon={PlusCircle} onClick={handleCreatePlan} className="bg-red-600 hover:bg-red-700 text-white">
          Nuevo Plan
        </Button>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title>Lista de planes</Title>
          <div className="w-64">
            <TextInput
              icon={Search}
              placeholder="Buscar planes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabGroup className="mt-4" onIndexChange={(index) => {
          setActiveTab(['todos', 'activos', 'inactivos'][index]);
        }}>
          <TabList variant="solid">
            <Tab>Todos <Badge size="xs">{counters.total}</Badge></Tab>
            <Tab>Activos <Badge size="xs" color="green">{counters.activos}</Badge></Tab>
            <Tab>Inactivos <Badge size="xs" color="red">{counters.inactivos}</Badge></Tab>
          </TabList>
        </TabGroup>

        <Table className="mt-6">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Nombre</TableHeaderCell>
              <TableHeaderCell>Descripción</TableHeaderCell>
              <TableHeaderCell>Precio</TableHeaderCell>
              <TableHeaderCell>Duración</TableHeaderCell>
              <TableHeaderCell>Tipo</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPlanes.map((plan) => (
              <TableRow key={plan.idPlan}>
                <TableCell>{plan.nombre}</TableCell>
                <TableCell>{plan.descripcion}</TableCell>
                <TableCell>S/ {plan.precio}</TableCell>
                <TableCell>{`${plan.duracion} ${plan.duracion === 1 ? 'día' : 'días'}`}</TableCell>
                <TableCell>
                  <Badge color={plan.tipoPlan === 'PREMIUM' ? 'red' : 'blue'}>
                    {plan.tipoPlan}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => handleToggleStatus(plan.idPlan, plan.estado)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${plan.estado ? 'bg-green-500' : 'bg-gray-300'}`}
                      title="Cambiar estado"
                    >
                      <span className="sr-only">Cambiar estado</span>
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${plan.estado ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                    <span className={`ml-2 text-xs font-medium ${plan.estado ? 'text-green-700' : 'text-gray-600'}`}>{plan.estado ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 items-center">

                    <button
                      type="button"
                      aria-label="Editar"
                      className="px-2 py-2 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 hover:border-orange-600 font-medium bg-transparent flex items-center justify-center"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      type="button"
                      aria-label="Eliminar"
                      className="px-2 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-700 font-medium bg-transparent flex items-center justify-center"
                      onClick={() => {
                        import('../../../shared/components/ConfirmDeleteToast').then(({ showConfirmDeleteToast }) => {
                          showConfirmDeleteToast({
                            message: '¿Estás seguro de que quieres eliminar este plan?',
                            onConfirm: async () => {
                              try {
                                const token = localStorage.getItem('token');
                                await eliminarPlan(plan.idPlan, token);
                                notify.success('Plan eliminado correctamente');
                                await fetchPlanes();
                              } catch (error) {
                                notify.error(error.message || 'Error al eliminar el plan');
                              }
                            },
                          });
                        });
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <PlanModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePlan}
        plan={selectedPlan}
      />
    </div>
  );
};

export default PlanesPage;

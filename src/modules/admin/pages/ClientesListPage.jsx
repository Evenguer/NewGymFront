import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, Table, TableHead, TableRow, TableHeaderCell,
  TableBody, TableCell, TextInput, Title, Flex,
  TabGroup, TabList, Tab, Badge
} from '@tremor/react';
import { Search } from 'react-feather';
import { ActionButtons } from '../components/common/ActionButtons';
import EditClientModal from '../components/UserManagement/EditClientModal';
import { useAuth } from '../../../shared/hooks/useAuth';
import { listClients, toggleClientStatus, updateClient } from '../../../shared/services/authAPI';
import { useNotification } from '../../../shared/hooks/useNotification';

const ClientesListPage = () => {
  const { user } = useAuth();
  const notify = useNotification();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [counts, setCounts] = useState({
    todos: 0,
    activos: 0,
    inactivos: 0
  });
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await listClients(token);
      setClients(data);
      
      // Actualizar contadores para las pestañas
      const clientCounts = {
        todos: data.length,
        activos: data.filter(client => client.estado).length,
        inactivos: data.filter(client => !client.estado).length
      };
      setCounts(clientCounts);
      
      setLoading(false);
    } catch (error) {
      setError('Error al cargar la lista de clientes');
      setLoading(false);
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleToggleStatus = async (client, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        notify.error('Sesión no válida. Por favor, inicie sesión nuevamente.');
        return;
      }

      const clientId = client.idCliente || client.id;
      if (user?.role !== 'ADMIN' && user?.role !== 'RECEPCIONISTA') {
        notify.error('Solo administradores y recepcionistas pueden cambiar el estado del usuario');
        return;
      }

      await toggleClientStatus(clientId, !currentStatus, token);
      await fetchClients();
      notify.success(`Cliente ${currentStatus ? 'desactivado' : 'activado'} correctamente`);
    } catch (error) {
      notify.error(error.response?.status === 403 
        ? 'No tienes permiso para cambiar el estado del usuario'
        : error.response?.data?.message || 'Error al cambiar el estado del usuario'
      );
    }
  };

  const handleEditClick = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedClient(null);
    setIsModalOpen(false);
  };  const handleSaveChanges = async (changedData) => {
    try {
      const token = localStorage.getItem('token');
      const clientId = selectedClient.idCliente || selectedClient.id_cliente || selectedClient.id;

      if (user?.role !== 'ADMIN' && user?.role !== 'RECEPCIONISTA') {
        notify.error('Solo administradores y recepcionistas pueden actualizar datos de clientes');
        return;
      }

      await updateClient(clientId, changedData, token);
      await fetchClients();
      handleCloseModal();
      notify.success('Cliente actualizado correctamente');

    } catch (error) {
      notify.error(error.message || 'Error al actualizar el cliente');
    }
  };
  const filteredClients = clients.filter(client => {
    // Filtrar por pestaña activa
    if (activeTab === 'activos' && !client.estado) {
      return false;
    }
    if (activeTab === 'inactivos' && client.estado) {
      return false;
    }
    
    // Filtrar por término de búsqueda
    if (!searchTerm) return true;
    
    return (
      client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.dni.includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  if (error) {
    notify.error(error, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-500">Administra los clientes del gimnasio</p>
        </div>
      </div>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Para crear un nuevo cliente, por favor utiliza la opción <strong>"Nuevo Usuario"</strong> en la sección de <Link to="/admin/usuarios" className="font-medium underline">Gestión de Usuarios</Link>.
            </p>
          </div>
        </div>
      </div>

      <Card>        <Flex justifyContent="between" className="mb-4">
          <Title>Lista de Clientes</Title>
          <div className="flex space-x-2">
            <div className="w-64">
              <TextInput
                icon={Search}
                placeholder="Buscar por nombre o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </Flex>
        
        <TabGroup className="mb-6" onIndexChange={(index) => {
          const tabs = ['todos', 'activos', 'inactivos'];
          setActiveTab(tabs[index]);
        }}>
          <TabList variant="solid">
            <Tab>
              Todos <Badge size="xs" color="blue">{counts.todos}</Badge>
            </Tab>
            <Tab>
              Activos <Badge size="xs" color="green">{counts.activos}</Badge>
            </Tab>
            <Tab>
              Inactivos <Badge size="xs" color="red">{counts.inactivos}</Badge>
            </Tab>
          </TabList>
        </TabGroup>
        
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Información del Cliente</TableHeaderCell>
              <TableHeaderCell>Contacto</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-600 font-medium text-sm">
                            {client.nombre[0]}{client.apellidos[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {client.nombre} {client.apellidos}
                        </div>
                        <div className="text-sm text-gray-500">
                          DNI: {client.dni}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{client.correo}</p>
                      <p className="text-gray-500 text-sm">{client.celular || 'No registrado'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleToggleStatus(client, client.estado)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          client.estado ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            client.estado ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="ml-2 text-xs">
                        {client.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <ActionButtons
                        onEdit={() => handleEditClick(client)}
                        showDelete={false}
                        showView={false}
                        hideText={true}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No se encontraron clientes con los criterios de búsqueda
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {selectedClient && (
        <EditClientModal
          client={selectedClient}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );
};

export default ClientesListPage;

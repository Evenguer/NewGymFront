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
import { maquinariaAPI } from '../../services/maquinariaAPI';
import { showConfirmDeleteToast } from '../../../../shared/components/ConfirmDeleteToast';
import MaquinariaModal from '../../components/receptionist/MaquinariaModal';

const MaquinariaPage = () => {
  const notify = useNotification();
  const [piezas, setPiezas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPieza, setSelectedPieza] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Contadores para tabs
  const [counters, setCounters] = useState({
    total: 0,
    activos: 0,
    inactivos: 0
  });
  const [activeTab, setActiveTab] = useState('todos');

  const fetchPiezas = async () => {
    try {
      setLoading(true);
      const response = await maquinariaAPI.listarPiezas();
      setPiezas(response);
      setCounters({
        total: response.length,
        activos: response.filter(p => p.estado).length,
        inactivos: response.filter(p => !p.estado).length
      });
      // No mostrar notificación de éxito al cargar la página
    } catch (err) {
      setError('Error al cargar las máquinas');
      console.error('Error:', err.message);
      notify.error('Error al cargar las máquinas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPiezas();
  }, []);

  const handleToggleEstado = async (id, estadoActual) => {
    try {
      await maquinariaAPI.cambiarEstadoPieza(id, !estadoActual);
      const nuevos = piezas.map(pieza =>
        pieza.idPieza === id ? { ...pieza, estado: !estadoActual } : pieza
      );
      setPiezas(nuevos);
      setCounters({
        total: nuevos.length,
        activos: nuevos.filter(p => p.estado).length,
        inactivos: nuevos.filter(p => !p.estado).length
      });
      notify.success('Estado de la pieza actualizado correctamente');
    } catch (err) {
      console.error('Error al cambiar el estado de la pieza:', err);
      notify.error('Error al cambiar el estado de la pieza. Por favor, intenta nuevamente.');
    }
  };

  const handleDelete = async (id) => {
    showConfirmDeleteToast({
      message: '¿Estás seguro de que quieres eliminar esta máquina?',
      onConfirm: async () => {
        try {
          await maquinariaAPI.eliminarPieza(id);
          const nuevos = piezas.filter(pieza => pieza.idPieza !== id);
          setPiezas(nuevos);
          setCounters({
            total: nuevos.length,
            activos: nuevos.filter(p => p.estado).length,
            inactivos: nuevos.filter(p => !p.estado).length
          });
          notify.success('Máquina eliminada correctamente');
        } catch (err) {
          console.error('Error al eliminar la máquina:', err.message);
          notify.error('Error al eliminar la máquina');
        }
      }
    });
  };

  const handleEdit = (pieza) => {
    setSelectedPieza(pieza);
    setIsModalOpen(true);
  };

  const handleOpenModal = () => {
    setSelectedPieza(null);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setSelectedPieza(null);
    setIsModalOpen(false);
  };

  const handlePiezaSuccess = (updatedPieza) => {
    let nuevos;
    if (selectedPieza) {
      nuevos = piezas.map(pieza =>
        pieza.idPieza === updatedPieza.idPieza ? updatedPieza : pieza
      );
    } else {
      nuevos = [...piezas, updatedPieza];
    }
    setPiezas(nuevos);
    setCounters({
      total: nuevos.length,
      activos: nuevos.filter(p => p.estado).length,
      inactivos: nuevos.filter(p => !p.estado).length
    });
    if (selectedPieza) {
      notify.success('Pieza actualizada correctamente');
    } else {
      notify.success('Pieza agregada correctamente');
    }
    handleCloseModal();
  };

  const filteredPiezas = piezas.filter(pieza => {
    const matchesSearch = pieza.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'activos') return matchesSearch && pieza.estado;
    if (activeTab === 'inactivos') return matchesSearch && !pieza.estado;
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
          onClick={fetchPiezas}
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Maquinaria</h1>
          <p className="text-sm sm:text-base text-gray-500">Administra las piezas/maquinaria del gimnasio</p>
        </div>
        <Button
          icon={PlusCircle}
          size="sm"
          variant="primary"
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
          onClick={handleOpenModal}
        >
          Nueva Pieza
        </Button>
      </div>
      <Card className="overflow-hidden">
        <Flex justifyContent="between" className="flex-col sm:flex-row gap-4 sm:gap-0 mb-4">
          <Title className="text-base sm:text-lg">Lista de Maquinaria</Title>
          <div className="w-full sm:w-64">
            <TextInput
              icon={Search}
              placeholder="Buscar pieza..."
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
          {filteredPiezas.length > 0 ? (
            <div className="space-y-3">
              {filteredPiezas.map((pieza) => (
                <div key={pieza.idPieza} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{pieza.nombre}</p>
                      <p className="text-sm text-gray-500">Stock: {pieza.stock}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(pieza)}
                        className="p-1.5 bg-amber-100 text-amber-600 rounded hover:bg-amber-200"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(pieza.idPieza)}
                        className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Peso:</p>
                      <p>{pieza.peso} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Precio Alquiler:</p>
                      <p>S/ {pieza.precioAlquiler}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500 mb-1">Estado:</p>
                      <button
                        onClick={() => handleToggleEstado(pieza.idPieza, pieza.estado)}
                        className="flex items-center gap-2"
                      >
                        <div className={`relative inline-flex h-5 w-9 items-center rounded-full ${
                          pieza.estado ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                            pieza.estado ? 'translate-x-5' : 'translate-x-1'
                          }`} />
                        </div>
                        <span className="text-xs">
                          {pieza.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No se encontraron piezas
            </div>
          )}
        </div>

        {/* Vista desktop - Tabla */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nombre</TableHeaderCell>
                <TableHeaderCell>Stock</TableHeaderCell>
                <TableHeaderCell>Peso (kg)</TableHeaderCell>
                <TableHeaderCell>Precio Alquiler (S/.)</TableHeaderCell>
                <TableHeaderCell>Estado</TableHeaderCell>
                <TableHeaderCell>Acciones</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPiezas.length > 0 ? (
                filteredPiezas.map((pieza) => (
                  <TableRow key={pieza.idPieza}>
                    <TableCell className="font-medium">{pieza.nombre}</TableCell>
                    <TableCell>{pieza.stock}</TableCell>
                    <TableCell>{pieza.peso}</TableCell>
                    <TableCell>{pieza.precioAlquiler}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleEstado(pieza.idPieza, pieza.estado)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          pieza.estado ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            pieza.estado ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="ml-2 text-xs">
                        {pieza.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(pieza)}
                          className="p-1.5 bg-amber-100 text-amber-600 rounded hover:bg-amber-200"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(pieza.idPieza)}
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
                  <TableCell colSpan={6} className="text-center py-4">
                    No se encontraron piezas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <MaquinariaModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        pieza={selectedPieza}
        onSuccess={handlePiezaSuccess}
      />
    </div>
  );
};

export default MaquinariaPage;

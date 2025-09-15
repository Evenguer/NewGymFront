import React, { useState, useEffect, useCallback, memo } from 'react';
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
    Flex,
    TabGroup,
    TabList,
    Tab
} from '@tremor/react';
import { Search, PlusCircle } from 'react-feather';
import { ActionButtons } from '../components/common/ActionButtons';
import horarioEmpleadoAPI from '../services/horarioEmpleadoAPI';
import { getEmployees } from '../services/personaAPI';
import { useNotification } from '../../../shared/hooks/useNotification';
import HorarioModal from '../components/Horarios/HorarioModal';

// Componente de fila memorizado
const HorarioRow = memo(({ horario, onToggleEstado, onEdit, onDelete, loadingId }) => {
    const isLoading = loadingId === horario.idHorarioEmpleado;
    
    return (
        <TableRow key={horario.idHorarioEmpleado}>
            <TableCell>
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                        {horario.empleado?.nombre} {horario.empleado?.apellidos}
                    </span>
                    <Badge 
                        className="mt-1 w-fit" 
                        color={
                            horario.empleado?.rol === 'ENTRENADOR' ? 'blue' : 
                            horario.empleado?.rol === 'ADMIN' ? 'red' : 
                            horario.empleado?.rol === 'RECEPCIONISTA' ? 'orange' : 
                            'gray'
                        }
                    >
                        {horario.empleado?.rol || 'No asignado'}
                    </Badge>
                </div>
            </TableCell>
            <TableCell>{horario.dia}</TableCell>
            <TableCell>{horario.turno}</TableCell>
            <TableCell>{horario.horaInicio}</TableCell>
            <TableCell>{horario.horaFin}</TableCell>
            <TableCell>
                <button
                    onClick={() => onToggleEstado(horario.idHorarioEmpleado, horario.estado)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none ${
                        isLoading ? 'opacity-50 cursor-not-allowed' :
                        horario.estado ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    disabled={isLoading}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            horario.estado ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>                <span className="ml-2 text-sm">
                    {horario.estado ? 'Activo' : 'Inactivo'}
                </span>
            </TableCell>
            <TableCell>
                <div className="flex gap-2">
                    <ActionButtons
                        onEdit={() => onEdit(horario)}
                        onDelete={() => onDelete(horario.idHorarioEmpleado)}
                        showView={false}
                        hideText={true}
                    />
                </div>
            </TableCell>
        </TableRow>
    );
});

const DIAS_SEMANA = [
    'LUNES',
    'MARTES',
    'MIERCOLES',
    'JUEVES',
    'VIERNES',
    'SABADO',
    'DOMINGO'
];

const TURNOS = ['MAÑANA', 'TARDE', 'NOCHE'];

const HorarioPage = () => {
    const notify = useNotification();
    const [horarios, setHorarios] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedHorario, setSelectedHorario] = useState(null);
    const [empleados, setEmpleados] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingId, setLoadingId] = useState(null);
    const [activeTab, setActiveTab] = useState('todos');
    const [tabCounters, setTabCounters] = useState({
        todos: 0,
        administrador: 0,
        recepcionista: 0,
        entrenador: 0
    });

    const fetchHorarios = async () => {
        setIsLoading(true);
        try {
            const data = await horarioEmpleadoAPI.listarHorarios();
            setHorarios(data);
            // Contadores por rol
            setTabCounters({
                todos: data.length,
                administrador: data.filter(h => h.empleado?.rol?.toUpperCase() === 'ADMIN').length,
                recepcionista: data.filter(h => h.empleado?.rol?.toUpperCase() === 'RECEPCIONISTA').length,
                entrenador: data.filter(h => h.empleado?.rol?.toUpperCase() === 'ENTRENADOR').length
            });
        } catch (error) {
            console.error('Error al cargar horarios:', error);
            notify.error('Error al cargar los horarios');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEmpleados = async () => {
        try {
            const data = await getEmployees();
            setEmpleados(data);
        } catch (error) {
            console.error('Error al cargar empleados:', error);
            notify.error('Error al cargar los empleados');
        }
    };

    useEffect(() => {
        fetchHorarios();
        fetchEmpleados();
    }, []);

    const handleToggleEstado = useCallback(async (id, estadoActual) => {
        if (!id) {
            console.error('ID no válido:', id);
            notify.error('Error: ID de horario no válido');
            return;
        }
        setLoadingId(id);
        try {
            await horarioEmpleadoAPI.cambiarEstadoHorario(id, !estadoActual);
            setHorarios(prevHorarios => {
                const nuevos = prevHorarios.map(h =>
                    h.idHorarioEmpleado === id ? { ...h, estado: !estadoActual } : h
                );
                setTabCounters({
                    todos: nuevos.length,
                    administrador: nuevos.filter(h => h.empleado?.rol?.toUpperCase() === 'ADMIN').length,
                    recepcionista: nuevos.filter(h => h.empleado?.rol?.toUpperCase() === 'RECEPCIONISTA').length,
                    entrenador: nuevos.filter(h => h.empleado?.rol?.toUpperCase() === 'ENTRENADOR').length
                });
                return nuevos;
            });
            notify.success('Estado actualizado exitosamente');
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            notify.error(error.message || 'Error al cambiar el estado');
        } finally {
            setTimeout(() => {
                setLoadingId(null);
            }, 500);
        }
    }, []);

    const handleSave = async (empleadoId, horarioData) => {
        try {
            if (selectedHorario) {
                await horarioEmpleadoAPI.actualizarHorario(selectedHorario.idHorarioEmpleado, horarioData);
                notify.success('Horario actualizado exitosamente');
            } else {
                await horarioEmpleadoAPI.agregarHorario(empleadoId, horarioData);
                notify.success('Horario creado exitosamente');
            }
            await fetchHorarios();
            setShowModal(false);
            setSelectedHorario(null);
        } catch (error) {
            console.error('Error al guardar horario:', error);
            notify.error(error.message || 'Error al procesar el horario');
        }
    };

    const handleDelete = async (id) => {
        import('../../../shared/components/ConfirmDeleteToast').then(({ showConfirmDeleteToast }) => {
            showConfirmDeleteToast({
                message: '¿Está seguro de eliminar este horario?',
                onConfirm: async () => {
                    try {
                        await horarioEmpleadoAPI.eliminarHorario(id);
                        notify.success('Horario eliminado exitosamente');
                        await fetchHorarios();
                    } catch (error) {
                        notify.error(error.message || 'Error al eliminar el horario');
                    }
                },
            });
        });
    };

    const filteredHorarios = horarios.filter(horario => {
        const rol = horario.empleado?.rol?.toUpperCase() || '';
        // Ocultar horarios de empleados con rol CLIENTE
        if (rol === 'CLIENTE') return false;
        if (activeTab !== 'todos') {
            if (activeTab === 'administrador' && rol !== 'ADMIN') return false;
            if (activeTab === 'recepcionista' && rol !== 'RECEPCIONISTA') return false;
            if (activeTab === 'entrenador' && rol !== 'ENTRENADOR') return false;
        }
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            (horario.empleado?.nombre + ' ' + horario.empleado?.apellidos)
                .toLowerCase()
                .includes(searchLower) ||
            horario.dia.toLowerCase().includes(searchLower) ||
            horario.turno.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion de Horarios</h1>
                    <p className="text-gray-500">Administra los horarios de los empleados del gimnasio</p>
                </div>
                <Button
                    size="sm"
                    variant="primary"
                    icon={PlusCircle}
                    onClick={() => {
                        setSelectedHorario(null);
                        setShowModal(true);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    Nuevo Horario
                </Button>
            </div>
            <Card>
                <Flex justifyContent="between" className="mb-6">
                    <Title>Lista de Horarios</Title>
                    <div className="w-64">
                        <TextInput
                            icon={Search}
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>
                </Flex>
                <TabGroup
                    className="mb-6"
                    onIndexChange={(index) => {
                        const tabs = ['todos', 'administrador', 'recepcionista', 'entrenador'];
                        setActiveTab(tabs[index]);
                    }}
                >
                    <TabList variant="solid">
                        <Tab className={activeTab === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}>
                            Todos <Badge size="xs" color="blue">{tabCounters.todos}</Badge>
                        </Tab>
                        <Tab className={activeTab === 'administrador' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}>
                            Administrador <Badge size="xs" color="red">{tabCounters.administrador}</Badge>
                        </Tab>
                        <Tab className={activeTab === 'recepcionista' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}>
                            Recepcionista <Badge size="xs" color="orange">{tabCounters.recepcionista}</Badge>
                        </Tab>
                        <Tab className={activeTab === 'entrenador' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}>
                            Entrenador <Badge size="xs" color="blue">{tabCounters.entrenador}</Badge>
                        </Tab>
                    </TabList>
                </TabGroup>
                <Table>                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>
                                <div>
                                    <span>Empleado</span>
                                    <span className="block text-xs font-normal text-gray-500">Nombre y Rol</span>
                                </div>
                            </TableHeaderCell>
                            <TableHeaderCell>Día</TableHeaderCell>
                            <TableHeaderCell>Turno</TableHeaderCell>
                            <TableHeaderCell>Hora Inicio</TableHeaderCell>
                            <TableHeaderCell>Hora Fin</TableHeaderCell>
                            <TableHeaderCell>Estado</TableHeaderCell>
                            <TableHeaderCell>Acciones</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    Cargando...
                                </TableCell>
                            </TableRow>
                        ) : filteredHorarios.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    No hay horarios disponibles
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredHorarios.map((horario) => (
                                <HorarioRow
                                    key={horario.idHorarioEmpleado}
                                    horario={horario}
                                    onToggleEstado={handleToggleEstado}
                                    onEdit={(h) => {
                                        setSelectedHorario(h);
                                        setShowModal(true);
                                    }}
                                    onDelete={handleDelete}
                                    loadingId={loadingId}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>            <HorarioModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                horario={selectedHorario}
                empleados={empleados}
                isLoading={isLoading}
                onSuccess={() => {
                    fetchHorarios();
                    setShowModal(false);
                }}
                onSave={handleSave}
            />
        </div>
    );
};

export default HorarioPage;

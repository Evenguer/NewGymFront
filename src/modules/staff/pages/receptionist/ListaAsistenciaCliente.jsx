import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../../shared/hooks/useNotification';
import {
    Card,
    Title,
    Badge,
    TextInput,
    Grid,
    Text,
    Flex,
    Metric,
    Button,
    DatePicker
} from '@tremor/react';
import { Search, User, Clock, Calendar, RefreshCw } from 'react-feather';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { asistenciaClienteAPI } from '../../services/AsistenciaClienteAPI';

const ListaAsistenciaCliente = () => {
    const notify = useNotification();
    const [asistencias, setAsistencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroTurno, setFiltroTurno] = useState('');
    const [filtroFecha, setFiltroFecha] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState(''); // '', 'asistio', 'noasistio'

    const fetchAsistencias = async () => {
        try {
            setLoading(true);
            const response = await asistenciaClienteAPI.listarAsistenciasClientes();
            console.log('Respuesta completa:', response);
            
            // El response puede venir directamente como array o envuelto en un objeto
            const asistenciasData = Array.isArray(response) ? response : response.data || [];
            setAsistencias(asistenciasData);
            setError(null);
        } catch (err) {
            setError('Error al cargar las asistencias de clientes');
            console.error('Error:', err.message);
            notify.error('Error al cargar las asistencias de clientes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAsistencias();
    }, []);

    // Filtrar asistencias basado en el término de búsqueda, turno, estado y fecha seleccionada
    const filteredAsistencias = asistencias.filter(asistencia => {
        const matchSearch = 
            asistencia.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asistencia.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asistencia.fecha?.toString().includes(searchTerm) ||
            asistencia.planNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asistencia.turno?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchTurno = !filtroTurno || asistencia.turno?.toLowerCase() === filtroTurno.toLowerCase();

        let matchFecha = true;
        if (filtroFecha && asistencia.fecha) {
            const fechaAsistenciaStr = format(new Date(asistencia.fecha + 'T00:00:00'), 'yyyy-MM-dd');
            const filtroFechaStr = format(filtroFecha, 'yyyy-MM-dd');
            matchFecha = fechaAsistenciaStr === filtroFechaStr;
        }

        let matchEstado = true;
        if (filtroEstado === 'asistio') matchEstado = asistencia.estado === true;
        if (filtroEstado === 'noasistio') matchEstado = asistencia.estado === false;

        return matchSearch && matchTurno && matchFecha && matchEstado;
    });

    // Para clientes, mostramos "Asistió" o "No asistió" según el estado
    const getEstadoBadge = (estado) => {
        if (estado === false) {
            return <Badge color="red">No asistió</Badge>;
        }
        return <Badge color="green">Asistió</Badge>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        // Asegurarnos de que la fecha se interprete correctamente
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'America/Lima'
        });
    };

    const formatTime = (timeString, estado) => {
        if (estado === false) return '--';
        if (!timeString) return '';
        return timeString.substring(0, 5); // Mostrar solo HH:mm
    };

    const formatTurno = (turno, estado) => {
        if (estado === false) return '--';
        if (!turno) return '';
        
        switch (turno.toLowerCase()) {
            case 'mañana':
                return 'Mañana';
            case 'tarde':
                return 'Tarde';
            case 'noche':
                return 'Noche';
            default:
                return turno;
        }
    };

    const getTurnoBadgeColor = (turno, estado) => {
        if (estado === false) return 'gray';
        if (!turno) return 'gray';
        
        switch (turno.toLowerCase()) {
            case 'mañana':
                return 'yellow';
            case 'tarde':
                return 'orange';
            case 'noche':
                return 'blue';
            default:
                return 'gray';
        }
    };

    const handleRefresh = () => {
        fetchAsistencias();
    };

    return (
        <div className="p-4 space-y-4">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <Title>Lista de Asistencias de Clientes</Title>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="xs"
                            variant={filtroEstado === 'asistio' ? 'primary' : 'secondary'}
                            onClick={() => setFiltroEstado(filtroEstado === 'asistio' ? '' : 'asistio')}
                            color="green"
                        >
                            Asistió
                        </Button>
                        <Button
                            size="xs"
                            variant={filtroEstado === 'noasistio' ? 'primary' : 'secondary'}
                            onClick={() => setFiltroEstado(filtroEstado === 'noasistio' ? '' : 'noasistio')}
                            color="red"
                        >
                            No asistió
                        </Button>
                        <Button
                            size="xs"
                            variant={filtroTurno === '' ? 'primary' : 'secondary'}
                            onClick={() => setFiltroTurno('')}
                            color="blue"
                        >
                            Todos
                        </Button>
                        <Button
                            size="xs"
                            variant={filtroTurno === 'mañana' ? 'primary' : 'secondary'}
                            onClick={() => setFiltroTurno(filtroTurno === 'mañana' ? '' : 'mañana')}
                            color="yellow"
                        >
                            Mañana
                        </Button>
                        <Button
                            size="xs"
                            variant={filtroTurno === 'tarde' ? 'primary' : 'secondary'}
                            onClick={() => setFiltroTurno(filtroTurno === 'tarde' ? '' : 'tarde')}
                            color="orange"
                        >
                            Tarde
                        </Button>
                        <Button
                            size="xs"
                            variant={filtroTurno === 'noche' ? 'primary' : 'secondary'}
                            onClick={() => setFiltroTurno(filtroTurno === 'noche' ? '' : 'noche')}
                            color="blue"
                        >
                            Noche
                        </Button>
                    </div>
                </div>
            </div>
            
            <div className="mb-6 flex flex-col sm:flex-row gap-2 items-center justify-between">
                <div className="relative max-w-md flex-1">
                    <TextInput
                        icon={Search}
                        placeholder="Buscar registros..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-8"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                            onClick={() => setSearchTerm('')}
                            aria-label="Limpiar filtro nombre"
                            tabIndex={-1}
                        >
                            ×
                        </button>
                    )}
                </div>
                <div className="relative">
                    <DatePicker
                        value={filtroFecha}
                        onValueChange={date => {
                            const hoy = new Date();
                            hoy.setHours(0, 0, 0, 0);
                            if (date && date > hoy) return;
                            setFiltroFecha(date);
                        }}
                        locale={es}
                        className="w-[180px] pr-4 text-xs"
                        maxDate={new Date()}
                        placeholder="Fecha"
                        enableClear={false}
                    />
                    {filtroFecha && (
                        <button
                            type="button"
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                            onClick={() => setFiltroFecha(null)}
                            aria-label="Limpiar filtro fecha"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="animate-spin" size={20} />
                        <Text>Cargando asistencias...</Text>
                    </div>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <Text className="text-red-500">{error}</Text>
                    <Button
                        variant="secondary"
                        className="mt-4"
                        onClick={handleRefresh}
                    >
                        Reintentar
                    </Button>
                </div>
            ) : filteredAsistencias.length === 0 ? (
                <div className="text-center py-8">
                    <Text>
                        {searchTerm 
                            ? 'No se encontraron asistencias que coincidan con la búsqueda' 
                            : 'No hay asistencias de clientes disponibles'
                        }
                    </Text>
                    {searchTerm && (
                        <Button
                            variant="secondary"
                            className="mt-4"
                            onClick={() => setSearchTerm('')}
                        >
                            Limpiar búsqueda
                        </Button>
                    )}
                </div>
            ) : (
                <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
                        {filteredAsistencias.map((asistencia, index) => (
                            <Card 
                                key={asistencia.idAsistenciaCliente || `asistencia-${index}`} 
                                decoration="top" 
                                decorationColor={asistencia.estado === false ? 'red' : 'green'}
                            >
                                <div className="space-y-4">
                                    <Flex alignItems="center" justifyContent="between">
                                        <div className="flex items-center space-x-2">
                                            <User size={20} className="text-gray-500" />
                                            <Metric className="text-lg">
                                                {asistencia.nombre} {asistencia.apellidos}
                                            </Metric>
                                        </div>
                                        {getEstadoBadge(asistencia.estado)}
                                    </Flex>
                                    
                                    <div className="space-y-2">
                                        <Flex alignItems="center" className="space-x-2">
                                            <Calendar size={16} className="text-gray-500" />
                                            <Text>{formatDate(asistencia.fecha)}</Text>
                                        </Flex>
                                        
                                        <Flex alignItems="center" className="space-x-2">
                                            <Clock size={16} className="text-gray-500" />
                                            <Text>
                                                {formatTime(asistencia.horaRegistro, asistencia.estado) || 
                                                 formatTime(asistencia.hora, asistencia.estado) || 
                                                 (asistencia.estado === false ? '--' : 'Hora no disponible')}
                                            </Text>
                                        </Flex>

                                        {(asistencia.turno || asistencia.estado === false) && (
                                            <Flex alignItems="center" className="space-x-2">
                                                <div className="flex items-center space-x-2">
                                                    <Text className="text-xs text-gray-500">Turno:</Text>
                                                    <Badge color={getTurnoBadgeColor(asistencia.turno, asistencia.estado)}>
                                                        {formatTurno(asistencia.turno, asistencia.estado)}
                                                    </Badge>
                                                </div>
                                            </Flex>
                                        )}

                                        {asistencia.planNombre && (
                                            <div className="pt-2">
                                                <Text className="text-xs text-gray-500">Plan:</Text>
                                                <Text className="font-medium">{asistencia.planNombre}</Text>
                                            </div>
                                        )}

                                        {asistencia.inscripcionId && (
                                            <div className="pt-1">
                                                <Text className="text-xs text-gray-500">
                                                    ID Inscripción: {asistencia.inscripcionId}
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                </Grid>
            )}
        </div>
    );
};

export default ListaAsistenciaCliente;

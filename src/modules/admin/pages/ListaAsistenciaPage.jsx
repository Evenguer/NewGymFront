import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../shared/hooks/useNotification';
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
import { Search, User, Clock, Calendar } from 'react-feather';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { asistenciaEmpleadoAPI } from '../services/asistenciaEmpleadoAPI';

const ListaAsistenciaPage = () => {
    const notify = useNotification();
    const [asistencias, setAsistencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroFecha, setFiltroFecha] = useState(null); // No marcar día actual
    const [filtroEstado, setFiltroEstado] = useState('');

    const fetchAsistencias = async () => {
        try {
            setLoading(true);
            const response = await asistenciaEmpleadoAPI.listarAsistencias();
            if (response.success) {
                setAsistencias(response.data);
                setError(null);
            } else {
                setError(response.message);
                notify.error(response.message);
            }
        } catch (err) {
            setError('Error al cargar las asistencias');
            console.error('Error:', err.message);
            notify.error('Error al cargar las asistencias');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAsistencias();
    }, []);

    // Filtrar asistencias basado en el término de búsqueda, estado y fecha seleccionada
    const filteredAsistencias = asistencias.filter(asistencia => {
        const matchSearch = 
            asistencia.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asistencia.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asistencia.fecha?.toString().includes(searchTerm);

        const matchEstado = !filtroEstado || asistencia.estadoPuntualidad === filtroEstado;

        let matchFecha = true;
        if (filtroFecha && asistencia.fecha) {
            const fechaAsistenciaStr = format(new Date(asistencia.fecha + 'T00:00:00'), 'yyyy-MM-dd');
            const filtroFechaStr = format(filtroFecha, 'yyyy-MM-dd');
            matchFecha = fechaAsistenciaStr === filtroFechaStr;
        }

        return matchSearch && matchEstado && matchFecha;
    });

    const getEstadoPuntualidadBadge = (estado) => {
        switch (estado?.toUpperCase()) {
            case 'PUNTUAL':
                return <Badge color="green">Puntual</Badge>;
            case 'TARDANZA':
                return <Badge color="yellow">Tardanza</Badge>;
            case 'TARDANZA_GRAVE':
                return <Badge color="red">Tardanza Grave</Badge>;
            case 'FALTO':
                return <Badge color="slate">No Asistió</Badge>;
            default:
                return <Badge color="gray">{estado || 'No definido'}</Badge>;
        }
    };const formatDate = (dateString) => {
        if (!dateString) return '';
        // Asegurarnos de que la fecha se interprete en la zona horaria local
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'America/Lima' // Asegurarnos de usar la zona horaria correcta
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.substring(0, 5); // Mostrar solo HH:mm
    };


    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-center mb-6">
                <Title>Lista de Asistencias</Title>
                <div className="flex space-x-2">
                    <Button
                        size="xs"
                        variant={filtroEstado === '' ? 'primary' : 'secondary'}
                        onClick={() => setFiltroEstado('')}
                        color="blue"
                    >
                        Todos
                    </Button>
                    <Button
                        size="xs"
                        variant={filtroEstado === 'PUNTUAL' ? 'primary' : 'secondary'}
                        onClick={() => setFiltroEstado(filtroEstado === 'PUNTUAL' ? '' : 'PUNTUAL')}
                        color="green"
                    >
                        Puntual
                    </Button>
                    <Button
                        size="xs"
                        variant={filtroEstado === 'TARDANZA' ? 'primary' : 'secondary'}
                        onClick={() => setFiltroEstado(filtroEstado === 'TARDANZA' ? '' : 'TARDANZA')}
                        color="yellow"
                    >
                        Tardanza
                    </Button>
                    <Button
                        size="xs"
                        variant={filtroEstado === 'TARDANZA_GRAVE' ? 'primary' : 'secondary'}
                        onClick={() => setFiltroEstado(filtroEstado === 'TARDANZA_GRAVE' ? '' : 'TARDANZA_GRAVE')}
                        color="red"
                    >
                        Tardanza Grave
                    </Button>
                    <Button
                        size="xs"
                        variant={filtroEstado === 'FALTO' ? 'primary' : 'secondary'}
                        onClick={() => setFiltroEstado(filtroEstado === 'FALTO' ? '' : 'FALTO')}
                        color="slate"
                    >
                        No Asistió
                    </Button>
                </div>
            </div>

            {/* Filtros avanzados: buscador, calendario y actualizar */}
            <div className="flex flex-col sm:flex-row gap-2 mb-6 items-center justify-between">
                <div className="flex-1 relative max-w-sm">
                    <TextInput
                        icon={Search}
                        placeholder="Buscar asistencias..."
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
                    <Text>Cargando asistencias...</Text>
                </div>
            ) : error ? (
                <div className="text-center py-8 text-red-500">
                    <Text>{error}</Text>
                </div>
            ) : filteredAsistencias.length === 0 ? (
                <div className="text-center py-8">
                    <Text>
                        {searchTerm
                            ? 'No se encontraron asistencias que coincidan con la búsqueda'
                            : 'No hay asistencias disponibles'}
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
                    {filteredAsistencias.map((asistencia) => (                        <Card key={asistencia.idAsistenciaEmpleado} decoration="top" decorationColor={
                            asistencia.estadoPuntualidad?.toUpperCase() === 'PUNTUAL' ? 'green' :
                            asistencia.estadoPuntualidad?.toUpperCase() === 'TARDANZA' ? 'yellow' :
                            asistencia.estadoPuntualidad?.toUpperCase() === 'FALTO' ? 'slate' : 'red'
                        }>
                            <div className="space-y-4">
                                <Flex alignItems="center" justifyContent="between">
                                    <div className="flex items-center space-x-2">
                                        <User size={20} className="text-gray-500" />
                                        <Metric className="text-lg">{asistencia.nombre} {asistencia.apellidos}</Metric>
                                    </div>
                                    {getEstadoPuntualidadBadge(asistencia.estadoPuntualidad)}
                                </Flex>
                                
                                <div className="space-y-2">
                                    <Flex alignItems="center" className="space-x-2">
                                        <Calendar size={16} className="text-gray-500" />
                                        <Text>{formatDate(asistencia.fecha)}</Text>
                                    </Flex>
                                    
                                    <Flex alignItems="center" className="space-x-2">
                                        <Clock size={16} className="text-gray-500" />
                                        <Text>{formatTime(asistencia.horaEntrada)}</Text>
                                    </Flex>
                                </div>
                            </div>
                        </Card>
                    ))}
                </Grid>
            )}
        </div>
    );
};

export default ListaAsistenciaPage;
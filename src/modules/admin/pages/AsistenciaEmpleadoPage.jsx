import React, { useState, useEffect } from 'react';
import {
    Card,
    Title,
    Text,
    TextInput,
    Badge,
    Button,
    Table,
    TableHead,
    TableHeaderCell,
    TableBody,
    TableRow,
    TableCell,
    Select,
    SelectItem,
} from '@tremor/react';
import { Search, Clock } from 'react-feather';
import { getEmployees } from '../services/personaAPI';
import { asistenciaEmpleadoAPI } from '../services/asistenciaEmpleadoAPI';
import toast from 'react-hot-toast';
import { useNotification } from '../../../shared/hooks/useNotification';

const DIAS_SEMANA = [
    { value: 'LUNES', label: 'Lunes' },
    { value: 'MARTES', label: 'Martes' },
    { value: 'MIERCOLES', label: 'Miércoles' },
    { value: 'JUEVES', label: 'Jueves' },
    { value: 'VIERNES', label: 'Viernes' },
    { value: 'SABADO', label: 'Sábado' },
    { value: 'DOMINGO', label: 'Domingo' }
];

const AsistenciaEmpleadoPage = () => {
    const [dni, setDni] = useState('');
    const [empleados, setEmpleados] = useState([]);
    const [empleadoEncontrado, setEmpleadoEncontrado] = useState(null);
    const [horariosDia, setHorariosDia] = useState([]);
    const [diaSeleccionado, setDiaSeleccionado] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const notify = useNotification();

    useEffect(() => {
        fetchEmpleados();
        // Establecer el día actual al cargar la página
        const hoy = new Date().toLocaleString('es-ES', { weekday: 'long' }).toUpperCase();
        setDiaSeleccionado(normalizarDia(hoy));
    }, []);

    // Función para normalizar el día (sin tildes y en mayúsculas)
    const normalizarDia = (dia) => {
        return dia.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase();
    };

    const fetchEmpleados = async () => {
        try {
            const data = await getEmployees();
            setEmpleados(data);
        } catch (error) {
            console.error('Error al cargar empleados:', error);
            notify.error('Error al cargar la lista de empleados');
        }
    };

    const fetchHorariosPorDia = async (idEmpleado, dia) => {
        if (!idEmpleado) {
            console.error('ID de empleado no proporcionado');
            return;
        }

        if (!dia) {
            console.error('Día no proporcionado');
            notify.error('Error: Debe seleccionar un día');
            return;
        }

        console.log('Consultando horarios con:', { idEmpleado, dia });
        try {
            setIsLoading(true);
            const response = await asistenciaEmpleadoAPI.obtenerHorariosPorEmpleadoYDia(
                parseInt(idEmpleado),
                dia
            );
            console.log('Respuesta de horarios:', response);
            
            if (response.success) {
                // Se elimina el toast.info ya que no existe esa función en react-hot-toast
                setHorariosDia(Array.isArray(response.data) ? response.data : []);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error al cargar horarios del día:', error);
            notify.error('Error al cargar los horarios: ' + (error.message || 'Error desconocido'));
            setHorariosDia([]);
        } finally {
            setIsLoading(false);
        }
    };

    const buscarEmpleadoPorDNI = async () => {
        if (!dni.trim()) {
            notify.error('Por favor, ingrese un DNI válido');
            return;
        }

        setIsLoading(true);
        try {
            const empleado = empleados.find(emp => emp.dni === dni);
            
            if (!empleado) {
                setEmpleadoEncontrado(null);
                setHorariosDia([]);
                notify.error('No se encontró ningún empleado con ese DNI');
                return;
            }

            console.log('Empleado encontrado:', empleado);
            setEmpleadoEncontrado(empleado);

            // Solo si encontramos el empleado, buscamos sus horarios
            if (diaSeleccionado) {
                console.log('Buscando horarios para:', {
                    idEmpleado: empleado.idPersona,
                    dia: diaSeleccionado
                });
                await fetchHorariosPorDia(empleado.idPersona, diaSeleccionado);
            } else {
                notify.error('Por favor, seleccione un día de la semana');
            }
        } catch (error) {
            console.error('Error en la búsqueda:', error);
            notify.error('Error al buscar el empleado: ' + (error.message || 'Error desconocido'));
            setEmpleadoEncontrado(null);
            setHorariosDia([]);
        } finally {
            setIsLoading(false);
        }
    };    const handleDiaChange = async (dia) => {
        setDiaSeleccionado(dia);
        if (empleadoEncontrado && empleadoEncontrado.idEmpleado) {
            console.log('Cambiando día para empleado:', {
                id: empleadoEncontrado.idEmpleado,
                dia: dia
            });
            await fetchHorariosPorDia(empleadoEncontrado.idEmpleado, dia);
        } else {
            console.log('No hay empleado seleccionado o falta ID');
        }
    };    const handleMarcarAsistencia = async () => {
        if (!empleadoEncontrado) {
            toast.error('No hay empleado seleccionado');
            return;
        }

        setIsLoading(true);
        try {
            const result = await asistenciaEmpleadoAPI.marcarAsistencia(empleadoEncontrado.idEmpleado);
            if (result.success) {
                toast.success(
                    <div className="space-y-2">
                        <p className="font-semibold">¡Asistencia registrada con éxito!</p>
                        <p>Empleado: {empleadoEncontrado.nombre} {empleadoEncontrado.apellidos}</p>
                        <p>Fecha: {new Date().toLocaleDateString('es-ES')}</p>
                        <p>Hora: {new Date().toLocaleTimeString('es-ES')}</p>
                    </div>,
                    {
                        duration: 5000,
                        style: {
                            background: '#22c55e',
                            color: 'white',
                        }
                    }
                );
                // Limpiar después de marcar asistencia
                setDni('');
                setEmpleadoEncontrado(null);
                setHorariosDia([]);
            } else {
                // Mostrar alerta de error
                if (result.message?.includes('Ya has marcado asistencia')) {
                    toast.error(result.message, {
                        duration: 5000,
                        style: {
                            background: '#EF4444',
                            color: 'white',
                        }
                    });
                } else {
                    toast.error(
                        <div className="space-y-2">
                            <p className="font-semibold">Error al marcar asistencia</p>
                            <p>{result.message || 'No se pudo registrar la asistencia'}</p>
                            <p className="text-sm">Por favor, intente nuevamente o contacte al administrador</p>
                        </div>,
                        {
                            duration: 5000,
                            style: {
                                background: '#EF4444',
                                color: 'white',
                            }
                        }
                    );
                }
            }
        } catch (error) {
            console.error('Error al marcar asistencia:', error);
            // Mostrar alerta de error en caso de excepción
            toast.error(
                <div className="space-y-2">
                    <p className="font-semibold">Error inesperado</p>
                    <p>{error.message || 'No se pudo procesar la solicitud'}</p>
                    <p className="text-sm">Por favor, verifique su conexión e intente nuevamente</p>
                </div>,
                {
                    duration: 5000,
                    style: {
                        background: '#EF4444',
                        color: 'white',
                    }
                }
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            buscarEmpleadoPorDNI();
        }
    };

    return (
        <div className="p-4 space-y-6">
            <Title>Control de Asistencia de Empleados</Title>
            
            {/* Sección de búsqueda */}
            <Card>
                <div className="space-y-4">
                    <Title>Buscar Empleado</Title>
                    <div className="flex gap-4">
                        <TextInput
                            icon={Search}
                            placeholder="Ingrese DNI del empleado"
                            value={dni}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            onChange={(e) => {
                                // Permitir solo números
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setDni(value);
                            }}
                            onKeyPress={(e) => {
                                // Bloquear letras en el input
                                if (!/[0-9]/.test(e.key)) {
                                    e.preventDefault();
                                } else {
                                    handleKeyPress(e);
                                }
                            }}
                            className="max-w-xs"
                        />
                        <Button
                            onClick={buscarEmpleadoPorDNI}
                            loading={isLoading}
                            disabled={!dni.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Buscar
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Sección de información del empleado */}
            {empleadoEncontrado && (
                <Card>
                    <div className="space-y-6">
                        {/* Información básica del empleado */}
                        <div className="flex justify-between items-start">
                            <div>
                                <Title className="mb-2">Información del Empleado</Title>
                                <Text className="text-lg font-medium">
                                    {empleadoEncontrado.nombre} {empleadoEncontrado.apellidos}
                                </Text>
                                <Text>DNI: {empleadoEncontrado.dni}</Text>
                            </div>
                            <Badge 
                                size="xl"
                                color={
                                    empleadoEncontrado.rol === 'ADMIN' ? 'red' :
                                    empleadoEncontrado.rol === 'ENTRENADOR' ? 'blue' :
                                    'orange'
                                }
                            >
                                {empleadoEncontrado.rol}
                            </Badge>
                        </div>

                        {/* Selector de día */}
                        <div className="flex items-center gap-4">
                            <Text>Día:</Text>
                            <Select
                                value={diaSeleccionado}
                                onValueChange={handleDiaChange}
                                className="max-w-xs"
                            >
                                {DIAS_SEMANA.map((dia) => (
                                    <SelectItem key={dia.value} value={dia.value}>
                                        {dia.label}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        {/* Horarios del empleado */}
                        {horariosDia.length > 0 ? (
                            <div>
                                <Title className="text-lg mb-2">Horarios del {
                                    DIAS_SEMANA.find(d => d.value === diaSeleccionado)?.label
                                }</Title>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeaderCell>Turno</TableHeaderCell>
                                            <TableHeaderCell>Hora Inicio</TableHeaderCell>
                                            <TableHeaderCell>Hora Fin</TableHeaderCell>
                                            <TableHeaderCell>Estado</TableHeaderCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {horariosDia.map((horario, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{horario.turno}</TableCell>
                                                <TableCell>{horario.horaInicio}</TableCell>
                                                <TableCell>{horario.horaFin}</TableCell>
                                                <TableCell>
                                                    <Badge color={horario.estado ? 'green' : 'red'}>
                                                        {horario.estado ? 'Activo' : 'Inactivo'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <Text className="text-amber-500">
                                No hay horarios asignados para este día
                            </Text>
                        )}

                        {/* Botón de marcar asistencia */}
                        <div className="flex justify-end">
                            <Button
                                size="lg"
                                icon={Clock}
                                loading={isLoading}
                                onClick={handleMarcarAsistencia}
                                disabled={horariosDia.length === 0}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Marcar Asistencia
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default AsistenciaEmpleadoPage;

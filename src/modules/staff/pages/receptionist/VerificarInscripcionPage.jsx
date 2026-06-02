import React, { useEffect, useRef, useState } from 'react';
import {
    Card,
    Title,
    Text,
    TextInput,
    Badge,
    Button,
} from '@tremor/react';
import { Camera, Search, Square, UserCheck } from 'react-feather';
import Webcam from 'react-webcam';
import QrScanner from 'qr-scanner';
import { asistenciaClienteAPI } from '../../services/AsistenciaClienteAPI';
import { inscripcionAPI } from '../../services/InscripcionAPI';
import toast from 'react-hot-toast';

const VerificarInscripcionPage = () => {
    const [modoBusqueda, setModoBusqueda] = useState('dni');
    const [dni, setDni] = useState('');
    const [clienteEncontrado, setClienteEncontrado] = useState(null);
    const [inscripcionEncontrada, setInscripcionEncontrada] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [webcamReady, setWebcamReady] = useState(false);
    const [videoConstraints, setVideoConstraints] = useState({
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user',
        aspectRatio: 4 / 3,
    });

    const webcamRef = useRef(null);
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);

    const limpiarEstados = () => {
        setDni('');
        setClienteEncontrado(null);
        setInscripcionEncontrada(null);
    };

    const handleDniChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 8);
        setDni(value);
    };

    const onUserMedia = () => {
        setWebcamReady(true);
    };

    const onUserMediaError = (error) => {
        console.error('Error al acceder a la webcam:', error);
        toast.error('Error al acceder a la cámara. Verifique los permisos.');
        setIsScanning(false);
        setWebcamReady(false);
    };

    const detenerEscanerQR = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        setIsScanning(false);
        setWebcamReady(false);
    };

    const cambiarCamara = () => {
        const newConstraints = {
            ...videoConstraints,
            facingMode: videoConstraints.facingMode === 'user' ? 'environment' : 'user',
        };

        setVideoConstraints(newConstraints);
        setWebcamReady(false);
        toast.info(`Cambiando a cámara ${newConstraints.facingMode === 'user' ? 'frontal' : 'trasera'}...`);
    };

    const normalizarInscripcion = (data) => ({
        ...data,
        idInscripcion: data?.idInscripcion ?? data?.id ?? data?.inscripcionId,
        clienteNombre: data?.clienteNombre ?? data?.nombre ?? '',
        clienteApellido: data?.clienteApellido ?? data?.apellidos ?? '',
        clienteDni: data?.clienteDni ?? data?.dni ?? '',
        nombrePlan: data?.nombrePlan ?? data?.plan ?? 'N/A',
        estado: data?.estado ?? data?.estadoInscripcion ?? 'N/A',
    });

    const registrarAsistenciaPorDni = async (dniIngresado) => {
        const dniValido = String(dniIngresado || '').replace(/\D/g, '');

        if (!dniValido || dniValido.length !== 8) {
            toast.error('Ingrese un DNI válido de 8 dígitos');
            return;
        }

        setIsLoading(true);
        try {
            const result = await asistenciaClienteAPI.registrarAsistenciaPorDNI(dniValido);

            if (result.success) {
                toast.success('✅ Asistencia registrada exitosamente', {
                    duration: 3000,
                    position: 'top-center',
                });

                setClienteEncontrado({
                    nombre: result.clienteNombre,
                    apellidos: result.clienteApellido,
                    plan: result.nombrePlan,
                    fechaRegistro: new Date().toLocaleString('es-ES'),
                });

                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }

                timeoutRef.current = setTimeout(() => {
                    limpiarEstados();
                }, 5000);
            }
        } catch (error) {
            console.error('Error al registrar asistencia:', error);
            toast.error(error.message || 'Error al registrar asistencia');
        } finally {
            setIsLoading(false);
        }
    };

    const buscarInscripcion = async (idBusqueda) => {
        const id = String(idBusqueda || '').trim();

        if (!id) {
            toast.error('Por favor, ingrese un ID de inscripción válido');
            return null;
        }

        setIsLoading(true);
        try {
            const response = await inscripcionAPI.obtenerDetalleInscripcion(parseInt(id, 10));
            const detalle = normalizarInscripcion(response);

            if (detalle && (detalle.idInscripcion || detalle.id)) {
                setInscripcionEncontrada(detalle);
                toast.success('Inscripción encontrada');
                return detalle;
            }

            setInscripcionEncontrada(null);
            toast.error('No se encontró ninguna inscripción con ese ID');
            return null;
        } catch (error) {
            console.error('Error al buscar inscripción:', error);
            setInscripcionEncontrada(null);
            toast.error('Error al buscar la inscripción: ' + (error.message || 'Error desconocido'));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const registrarAsistenciaDesdeInscripcion = async (detalleInscripcion) => {
        const detalle = normalizarInscripcion(detalleInscripcion);
        const dniCliente = String(detalle.clienteDni || '').replace(/\D/g, '');

        if (!dniCliente || dniCliente.length !== 8) {
            throw new Error('No se pudo obtener un DNI válido desde la inscripción');
        }

        setIsLoading(true);
        try {
            const result = await asistenciaClienteAPI.registrarAsistenciaPorDNI(dniCliente);

            if (result.success) {
                toast.success('✅ Asistencia registrada exitosamente desde QR', {
                    duration: 3000,
                    position: 'top-center',
                });

                setClienteEncontrado({
                    nombre: detalle.clienteNombre || result.clienteNombre,
                    apellidos: detalle.clienteApellido || result.clienteApellido,
                    plan: detalle.nombrePlan || result.nombrePlan,
                    fechaRegistro: new Date().toLocaleString('es-ES'),
                });

                setInscripcionEncontrada(detalle);

                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }

                timeoutRef.current = setTimeout(() => {
                    limpiarEstados();
                }, 5000);
            }
        } catch (error) {
            console.error('Error al registrar asistencia desde QR:', error);
            toast.error(error.message || 'Error al registrar asistencia');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const procesarQRResult = async (resultado) => {
        try {
            detenerEscanerQR();

            let idInscripcionQR = null;

            if (!Number.isNaN(Number(resultado))) {
                idInscripcionQR = Number(resultado);
            } else if (String(resultado).startsWith('{')) {
                try {
                    const data = JSON.parse(resultado);
                    idInscripcionQR = data.idInscripcion || data.id;
                } catch (error) {
                    toast.error('Formato de QR no válido');
                    return;
                }
            } else {
                const match = String(resultado).match(/\d+/);
                idInscripcionQR = match ? Number(match[0]) : null;
            }

            if (!idInscripcionQR) {
                toast.error('No se pudo extraer el ID de inscripción del código QR');
                return;
            }

            const detalle = await buscarInscripcion(idInscripcionQR.toString());

            if (detalle) {
                await registrarAsistenciaDesdeInscripcion(detalle);
            }
        } catch (error) {
            console.error('Error al procesar QR:', error);
            toast.error('Error al procesar el código QR');
        }
    };

    const capturarYEscanear = async () => {
        if (!webcamRef.current || !isScanning || !webcamReady) {
            return;
        }

        try {
            const imageSrc = webcamRef.current.getScreenshot();

            if (!imageSrc) {
                return;
            }

            const img = new Image();
            img.onload = async () => {
                try {
                    const result = await QrScanner.scanImage(img, { returnDetailedScanResult: true });

                    if (result && result.data) {
                        await procesarQRResult(result.data);
                    }
                } catch (error) {
                    // No encontrar QR en una captura es normal durante el escaneo.
                }
            };

            img.src = imageSrc;
        } catch (error) {
            console.error('Error al capturar imagen:', error);
        }
    };

    const iniciarEscanerQR = async () => {
        try {
            limpiarEstados();
            setModoBusqueda('qr');
            setIsScanning(true);
            setWebcamReady(false);
            toast.success('Iniciando escáner QR...');
        } catch (error) {
            console.error('Error al iniciar el escáner QR:', error);
            toast.error(`Error al acceder a la cámara: ${error.message}`);
            setIsScanning(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading && modoBusqueda === 'dni') {
            registrarAsistenciaPorDni(dni);
        }
    };

    const esInscripcionActiva = (estado) => {
        const estadoNormalizado = estado?.toLowerCase();
        return estadoNormalizado === 'activo' || estadoNormalizado === 'activa';
    };

    const getBadgeColor = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'activo':
            case 'activa':
                return 'green';
            case 'vencido':
            case 'vencida':
                return 'red';
            case 'suspendido':
            case 'suspendida':
                return 'yellow';
            default:
                return 'gray';
        }
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isScanning && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, [isScanning]);

    useEffect(() => {
        if (modoBusqueda !== 'qr') {
            detenerEscanerQR();
        }
    }, [modoBusqueda]);

    useEffect(() => {
        if (webcamReady && isScanning && !intervalRef.current) {
            intervalRef.current = setInterval(capturarYEscanear, 1000);
            toast.success('Escáner QR listo. Apunte a un código QR');
        }
    }, [webcamReady, isScanning]);

    return (
        <div className="p-4 space-y-6">
            <div className="space-y-2">
                <Title>Registrar Asistencia de Cliente</Title>
                <Text className="text-gray-600">Seleccione si desea registrar por DNI o por QR.</Text>
            </div>

            <Card className="max-w-4xl mx-auto">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button
                            onClick={() => setModoBusqueda('dni')}
                            className={modoBusqueda === 'dni' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                        >
                            Buscar por DNI
                        </Button>
                        <Button
                            onClick={() => {
                                setModoBusqueda('qr');
                                iniciarEscanerQR();
                            }}
                            className={modoBusqueda === 'qr' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                        >
                            Buscar por QR
                        </Button>
                    </div>

                    {modoBusqueda === 'dni' ? (
                        <div className="space-y-6">
                            <div>
                                <Title className="mb-2">Ingrese DNI del Cliente</Title>
                                <Text className="text-gray-600">
                                    Digite el número de DNI del cliente para registrar su asistencia
                                </Text>
                            </div>

                            <div className="flex gap-4">
                                <TextInput
                                    type="text"
                                    placeholder="Ingrese DNI"
                                    value={dni}
                                    onChange={handleDniChange}
                                    onKeyDown={handleKeyPress}
                                    maxLength={8}
                                    icon={Search}
                                    disabled={isLoading}
                                    className="flex-1"
                                />
                                <Button
                                    icon={UserCheck}
                                    onClick={() => registrarAsistenciaPorDni(dni)}
                                    loading={isLoading}
                                    disabled={isLoading || dni.length !== 8}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Registrar Asistencia
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-center">
                                <Title className="mb-2">Escanear Código QR</Title>
                                <Text className="text-gray-600 mb-4">
                                    Use la cámara para escanear el código QR de la inscripción del cliente
                                </Text>

                                <Button
                                    icon={isScanning ? Square : Camera}
                                    onClick={isScanning ? detenerEscanerQR : iniciarEscanerQR}
                                    disabled={isLoading}
                                    size="lg"
                                    className={isScanning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}
                                >
                                    {isScanning ? 'Detener Escáner' : 'Iniciar Escáner QR'}
                                </Button>
                            </div>

                            {isScanning && (
                                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <div className="relative">
                                        <Webcam
                                            audio={false}
                                            ref={webcamRef}
                                            screenshotFormat="image/jpeg"
                                            videoConstraints={videoConstraints}
                                            onUserMedia={onUserMedia}
                                            onUserMediaError={onUserMediaError}
                                            className="w-full max-w-md mx-auto rounded-lg"
                                            style={{
                                                width: '100%',
                                                maxWidth: '640px',
                                                height: 'auto',
                                                minHeight: '300px',
                                                backgroundColor: '#000',
                                            }}
                                            mirrored={true}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="border-2 border-red-500 border-dashed w-48 h-48 rounded-lg"></div>
                                        </div>
                                        {!webcamReady && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                                                <Text className="text-white">Iniciando cámara...</Text>
                                            </div>
                                        )}
                                    </div>

                                    <Text className="text-gray-600 mt-4">
                                        {webcamReady
                                            ? 'Coloque el código QR frente a la cámara (dentro del marco rojo)'
                                            : 'Esperando acceso a la cámara de la laptop...'}
                                    </Text>
                                    <Text className="text-sm text-gray-500 mt-2">
                                        {webcamReady
                                            ? 'Asegúrese de que haya buena iluminación'
                                            : 'Permita el acceso a la cámara cuando el navegador lo solicite'}
                                    </Text>

                                    <div className="mt-4 flex gap-2 justify-center">
                                    </div>
                                </div>
                            )}

                            {!isScanning && (
                                <div className="border-t pt-4">
                                    <Text className="text-sm text-gray-500">
                                        Presione “Iniciar Escáner QR” para activar la cámara.
                                    </Text>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            {inscripcionEncontrada && (
                <Card>
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <Title className="mb-2">Información de la Inscripción</Title>
                                <Text className="text-lg font-medium">
                                    {inscripcionEncontrada.clienteNombre} {inscripcionEncontrada.clienteApellido}
                                </Text>
                                <Text>DNI: {inscripcionEncontrada.clienteDni || 'N/A'}</Text>
                                <Text>Plan: {inscripcionEncontrada.nombrePlan}</Text>
                                <Text>ID Inscripción: {inscripcionEncontrada.idInscripcion}</Text>
                            </div>
                            <Badge
                                size="xl"
                                color={getBadgeColor(inscripcionEncontrada.estado)}
                            >
                                {inscripcionEncontrada.estado}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Text className="font-medium">Fecha de Inicio</Text>
                                <Text>{inscripcionEncontrada.fechaInicio ? new Date(inscripcionEncontrada.fechaInicio).toLocaleDateString('es-ES') : 'N/A'}</Text>
                            </div>
                            <div>
                                <Text className="font-medium">Fecha de Fin</Text>
                                <Text>{inscripcionEncontrada.fechaFin ? new Date(inscripcionEncontrada.fechaFin).toLocaleDateString('es-ES') : 'N/A'}</Text>
                            </div>
                            <div>
                                <Text className="font-medium">Duración</Text>
                                <Text>{inscripcionEncontrada.duracionPlan === 1 ? '1 día' : `${inscripcionEncontrada.duracionPlan} días`}</Text>
                            </div>
                        </div>

                        {clienteEncontrado && (
                            <div className={`rounded-lg border p-6 text-center ${esInscripcionActiva(inscripcionEncontrada.estado) ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <Title className={`${esInscripcionActiva(inscripcionEncontrada.estado) ? 'text-green-800' : 'text-red-800'} mb-2`}>
                                    {esInscripcionActiva(inscripcionEncontrada.estado)
                                        ? '✓ Asistencia marcada con éxito'
                                        : '❌ No tienes permiso para usar las instalaciones del gimnasio'}
                                </Title>
                                <Text className={`text-lg font-medium ${esInscripcionActiva(inscripcionEncontrada.estado) ? 'text-green-700' : 'text-red-700'}`}>
                                    {clienteEncontrado.nombre} {clienteEncontrado.apellidos}
                                </Text>
                                <Text className={`text-sm mt-2 ${esInscripcionActiva(inscripcionEncontrada.estado) ? 'text-green-600' : 'text-red-600'}`}>
                                    Fecha: {new Date().toLocaleDateString('es-ES')} - Hora: {new Date().toLocaleTimeString('es-ES')}
                                </Text>
                                <Badge color={esInscripcionActiva(inscripcionEncontrada.estado) ? 'green' : 'red'} size="lg" className="mt-3">
                                    {esInscripcionActiva(inscripcionEncontrada.estado)
                                        ? 'Asistencia Registrada Correctamente'
                                        : 'Acceso denegado'}
                                </Badge>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default VerificarInscripcionPage;

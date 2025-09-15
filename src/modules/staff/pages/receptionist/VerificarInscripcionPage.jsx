import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Card,
    Title,
    Text,
    TextInput,
    Badge,
    Button,
} from '@tremor/react';
import { Search, Square, UserCheck, Camera } from 'react-feather';
import Webcam from 'react-webcam';
import QrScanner from 'qr-scanner';
import { asistenciaClienteAPI } from '../../services/AsistenciaClienteAPI';
import { inscripcionAPI } from '../../services/InscripcionAPI';
import toast from 'react-hot-toast';

const VerificarInscripcionPage = () => {
    const [idInscripcion, setIdInscripcion] = useState('');
    const [inscripcionEncontrada, setInscripcionEncontrada] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [webcamReady, setWebcamReady] = useState(false);

    // Referencias para el escáner QR y webcam
    const webcamRef = useRef(null);
    const qrScannerRef = useRef(null);
    const intervalRef = useRef(null);

    // Estados adicionales para el manejo de la cámara
    const [videoConstraints, setVideoConstraints] = useState({
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user", // Forzar cámara frontal (la de la laptop)
        aspectRatio: 4/3
    });

    // Callbacks para la webcam
    const onUserMedia = () => {
        console.log('Webcam iniciada correctamente');
        setWebcamReady(true);
    };

    const onUserMediaError = (error) => {
        console.error('Error al acceder a la webcam:', error);
        toast.error('Error al acceder a la cámara. Verifique los permisos.');
        setIsScanning(false);
        setWebcamReady(false);
    };

    // Función para cambiar de cámara (si hay múltiples disponibles)
    const cambiarCamara = () => {
        const newConstraints = {
            ...videoConstraints,
            facingMode: videoConstraints.facingMode === "user" ? "environment" : "user"
        };
        setVideoConstraints(newConstraints);
        setWebcamReady(false);
        toast.info(`Cambiando a cámara ${newConstraints.facingMode === "user" ? "frontal" : "trasera"}...`);
    };
    const capturarYEscanear = useCallback(async () => {
        if (webcamRef.current && isScanning) {
            try {
                const imageSrc = webcamRef.current.getScreenshot();
                if (imageSrc) {
                    // Crear imagen para QrScanner
                    const img = new Image();
                    img.onload = async () => {
                        try {
                            // Usar la nueva API con returnDetailedScanResult: true
                            const result = await QrScanner.scanImage(img, { returnDetailedScanResult: true });
                            if (result && result.data) {
                                await procesarQRResult(result.data);
                            }
                        } catch (scanError) {
                            // No hacer nada si no encuentra QR, es normal durante el escaneo
                        }
                    };
                    img.src = imageSrc;
                }
            } catch (error) {
                console.error('Error al capturar imagen:', error);
            }
        }
    }, [isScanning]);

    // Función para inicializar el escáner de QR
    const iniciarEscanerQR = async () => {
        try {
            // Limpiar datos anteriores al iniciar un nuevo escaneo
            setInscripcionEncontrada(null);
            setIdInscripcion('');
            
            setIsScanning(true);
            setWebcamReady(false);
            toast.success('Iniciando escáner QR...');
            
        } catch (error) {
            console.error('Error al iniciar el escáner QR:', error);
            toast.error(`Error al acceder a la cámara: ${error.message}`);
            setIsScanning(false);
        }
    };

    // Función para detener el escáner
    const detenerEscanerQR = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsScanning(false);
        setWebcamReady(false);
    };

    // Procesar resultado del QR escaneado y registrar asistencia directamente
    const procesarQRResult = async (result) => {
        try {
            console.log('QR escaneado:', result);
            
            // Detener el escáner primero
            detenerEscanerQR();
            
            // Extraer el ID de la inscripción del QR
            let idInscripcionQR;
            
            // Si el resultado es un número directo
            if (!isNaN(result)) {
                idInscripcionQR = result;
            } 
            // Si viene en formato JSON
            else if (result.startsWith('{')) {
                try {
                    const data = JSON.parse(result);
                    idInscripcionQR = data.idInscripcion || data.id;
                } catch (e) {
                    toast.error('Formato de QR no válido');
                    return;
                }
            }
            // Si viene como URL o texto con ID
            else {
                const match = result.match(/\d+/);
                idInscripcionQR = match ? match[0] : null;
            }

            if (!idInscripcionQR) {
                toast.error('No se pudo extraer el ID de inscripción del código QR');
                return;
            }
            
            // Actualizar el campo de entrada para mostrar el ID
            setIdInscripcion(idInscripcionQR.toString());
            toast.success(`QR escaneado: ID ${idInscripcionQR}`);
            
            // Registrar asistencia directamente
            await registrarAsistenciaDirecta(parseInt(idInscripcionQR));
            
        } catch (error) {
            console.error('Error al procesar QR:', error);
            toast.error('Error al procesar el código QR');
        }
    };

    // Función para registrar asistencia directamente con el ID del QR
    const registrarAsistenciaDirecta = async (idInscripcionQR) => {
        setIsLoading(true);
        try {
            // Registrar asistencia usando directamente el API
            const result = await asistenciaClienteAPI.registrarAsistenciaPorQR(idInscripcionQR);
            if (result.success) {
                // Mostrar notificación visual en vez de alert
                setInscripcionEncontrada({
                    clienteNombre: result.clienteNombre || '',
                    clienteApellido: result.clienteApellido || '',
                    estado: 'ACTIVO',
                    idInscripcion: idInscripcionQR,
                    clienteDni: result.clienteDni || '',
                    nombrePlan: result.nombrePlan || '',
                    fechaInicio: result.fechaInicio || null,
                    fechaFin: result.fechaFin || null,
                    duracionPlan: result.duracionPlan || 0,
                    asistenciaRegistrada: true,
                    fechaAsistencia: new Date(),
                });
            } else {
                toast.error(result.message || 'No se pudo registrar la asistencia');
            }
        } catch (error) {
            console.error('Error al registrar asistencia:', error);
            // Mostrar mensaje de error directo sin buscar inscripción
            const inscripcionError = {
                clienteNombre: 'Usuario',
                clienteApellido: 'No Autorizado',
                estado: 'INVALIDO',
                idInscripcion: idInscripcionQR,
                clienteDni: 'N/A',
                nombrePlan: 'N/A',
                fechaInicio: null,
                fechaFin: null,
                duracionPlan: 0
            };
            setInscripcionEncontrada(inscripcionError);
            const errorMessage = error.message || 'Error inesperado al registrar asistencia';
            if (errorMessage.includes('❌')) {
                toast.error(errorMessage, {
                    duration: 4000,
                    style: {
                        background: '#EF4444',
                        color: 'white',
                    }
                });
            } else {
                toast.error('No tienes permiso para usar las instalaciones del gimnasio', {
                    duration: 4000,
                    style: {
                        background: '#EF4444',
                        color: 'white',
                    }
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Función para buscar inscripción por ID
    const buscarInscripcion = async (id = idInscripcion) => {
        if (!id.trim()) {
            toast.error('Por favor, ingrese un ID de inscripción válido');
            return;
        }

        setIsLoading(true);
        try {
            const response = await inscripcionAPI.obtenerDetalleInscripcion(parseInt(id));
            
            // El backend devuelve directamente el objeto
            if (response && (response.idInscripcion || response.id)) {
                setInscripcionEncontrada(response);
                toast.success('Inscripción encontrada');
            } else {
                setInscripcionEncontrada(null);
                toast.error('No se encontró ninguna inscripción con ese ID');
            }
        } catch (error) {
            console.error('Error al buscar inscripción:', error);
            setInscripcionEncontrada(null);
            toast.error('Error al buscar la inscripción: ' + (error.message || 'Error desconocido'));
        } finally {
            setIsLoading(false);
        }
    };

    // Función para registrar asistencia
    const registrarAsistencia = async () => {
        if (!inscripcionEncontrada) {
            toast.error('No hay inscripción seleccionada');
            return;
        }

        setIsLoading(true);
        try {
            const result = await asistenciaClienteAPI.registrarAsistenciaPorQR(inscripcionEncontrada.idInscripcion);
            
            if (result.success) {
                // Mostrar alerta de éxito
                alert(`¡Asistencia registrada con éxito!\n\nCliente: ${inscripcionEncontrada.clienteNombre} ${inscripcionEncontrada.clienteApellido}\nPlan: ${inscripcionEncontrada.nombrePlan}\nFecha: ${new Date().toLocaleDateString('es-ES')}\nHora: ${new Date().toLocaleTimeString('es-ES')}`);
                
                // Limpiar después de registrar asistencia
                setIdInscripcion('');
                setInscripcionEncontrada(null);
            } else {
                toast.error(result.message || 'No se pudo registrar la asistencia');
            }
        } catch (error) {
            console.error('Error al registrar asistencia:', error);
            
            // Mostrar mensaje de error específico del servidor
            const errorMessage = error.message || 'Error inesperado al registrar asistencia';
            
            if (errorMessage.includes('❌')) {
                // El mensaje ya viene formateado del servidor
                alert(errorMessage);
            } else {
                toast.error(
                    <div className="space-y-2">
                        <p className="font-semibold">Error al registrar asistencia</p>
                        <p>{errorMessage}</p>
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
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            buscarInscripcion();
        }
    };

    // Limpiar escáner al desmontar el componente
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Efecto para iniciar escaneo automático cuando la webcam esté lista
    useEffect(() => {
        if (webcamReady && isScanning && !intervalRef.current) {
            // Iniciar el escaneo periódico cada 1 segundo
            intervalRef.current = setInterval(capturarYEscanear, 1000);
            toast.success('Escáner QR listo. Apunte a un código QR');
        }
    }, [webcamReady, isScanning, capturarYEscanear]);

    // Función para obtener el color del badge según el estado
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

    return (
        <div className="p-4 space-y-6">
            <Title>Registrar Asistencia con QR</Title>
            {/* Sección principal de QR */}
            <Card>
                <div className="space-y-4">
                    <div className="text-center">
                        <Title className="mb-2">Escanear Código QR</Title>
                        <Text className="text-gray-600 mb-4">
                            Use la cámara para escanear el código QR de la inscripción del cliente
                        </Text>
                        <button
                            type="button"
                            onClick={isScanning ? detenerEscanerQR : iniciarEscanerQR}
                            disabled={isLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-lg font-medium"
                        >
                            {isScanning ? 'Detener Escáner' : 'Iniciar Escáner QR'}
                        </button>
                    </div>
                    {/* Área del escáner QR */}
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
                                        backgroundColor: '#000'
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
                                {webcamReady ? 
                                    'Coloque el código QR frente a la cámara (dentro del marco rojo)' : 
                                    'Esperando acceso a la cámara de la laptop...'
                                }
                            </Text>
                            <Text className="text-sm text-gray-500 mt-2">
                                {webcamReady ? 
                                    'Asegúrese de que haya buena iluminación. La imagen aparece espejada para facilitar el posicionamiento' :
                                    'Permita el acceso a la cámara cuando el navegador lo solicite'
                                }
                            </Text>
                            <div className="mt-4 flex gap-2 justify-center">
                                <button
                                    type="button"
                                    onClick={capturarYEscanear}
                                    disabled={!webcamReady}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:bg-gray-400"
                                >
                                    Escanear Manualmente
                                </button>
                                <button
                                    type="button"
                                    onClick={cambiarCamara}
                                    disabled={!webcamReady}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:bg-gray-400"
                                >
                                    Cambiar Cámara
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Sección de información de la inscripción */}
                    {inscripcionEncontrada && inscripcionEncontrada.clienteNombre && inscripcionEncontrada.clienteDni && inscripcionEncontrada.nombrePlan && inscripcionEncontrada.fechaInicio && inscripcionEncontrada.fechaFin && (
                        <Card>
                            <div className="space-y-6">
                                {/* Información básica de la inscripción */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Title className="mb-2">Información de la Inscripción</Title>
                                        <Text className="text-lg font-medium">
                                            {inscripcionEncontrada.clienteNombre} {inscripcionEncontrada.clienteApellido}
                                        </Text>
                                        <Text>DNI: {inscripcionEncontrada.clienteDni}</Text>
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
                                {/* Fechas de la inscripción */}
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
                                {/* Resultado de asistencia condicional */}
                                {inscripcionEncontrada.estado?.toLowerCase() === 'activo' || inscripcionEncontrada.estado?.toLowerCase() === 'activa' ? (
                                    /* Notificación visual de asistencia registrada (verde) */
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                                        <Title className="text-green-800 mb-2">✓ Asistencia registrada con éxito</Title>
                                        <Text className="text-green-700 text-lg font-medium">
                                            {inscripcionEncontrada.clienteNombre} {inscripcionEncontrada.clienteApellido}
                                        </Text>
                                        <Text className="text-green-600 text-sm mt-2">
                                            ID Inscripción: {inscripcionEncontrada.idInscripcion}<br />
                                            Fecha: {inscripcionEncontrada.fechaAsistencia ? inscripcionEncontrada.fechaAsistencia.toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES')}<br />
                                            Hora: {inscripcionEncontrada.fechaAsistencia ? inscripcionEncontrada.fechaAsistencia.toLocaleTimeString('es-ES') : new Date().toLocaleTimeString('es-ES')}
                                        </Text>
                                        {/* Botón oculto pero manteniendo el espacio */}
                                        <button
                                            type="button"
                                            style={{ visibility: 'hidden' }}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-medium"
                                        >
                                            Botón oculto
                                        </button>
                                    </div>
                                ) : (
                                    /* Mensaje de error para inscripciones inválidas/inactivas */
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                        <Title className="text-red-800 mb-2">❌ No tienes permiso para usar las instalaciones del gimnasio</Title>
                                        <Text className="text-red-700 text-lg font-medium">
                                            {inscripcionEncontrada.clienteNombre} {inscripcionEncontrada.clienteApellido}
                                        </Text>
                                        <Text className="text-red-600 text-sm mt-2">
                                            {inscripcionEncontrada.estado === 'INVALIDO' ? 
                                                'Código QR inválido o inscripción no encontrada' : 
                                                `Estado de inscripción: ${inscripcionEncontrada.estado}`
                                            }
                                        </Text>
                                        {/* Botón oculto pero manteniendo el espacio */}
                                        <button
                                            type="button"
                                            style={{ visibility: 'hidden' }}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-lg font-medium"
                                        >
                                            Botón oculto
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default VerificarInscripcionPage;
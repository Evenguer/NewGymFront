import React, { useState } from 'react';
import {
    Card,
    Title,
    Text,
    TextInput,
    Badge,
    Button,
} from '@tremor/react';
import { Search, UserCheck } from 'react-feather';
import { asistenciaClienteAPI } from '../../services/AsistenciaClienteAPI';
import toast from 'react-hot-toast';

const VerificarInscripcionPage = () => {
    const [dni, setDni] = useState('');
    const [clienteEncontrado, setClienteEncontrado] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    // Eliminado: asistenciaRegistrada ya que no se utiliza

    const handleDniChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 8);
        setDni(value);
    };

    const registrarAsistencia = async () => {
        if (!dni || dni.length !== 8) {
            toast.error('Ingrese un DNI válido de 8 dígitos');
            return;
        }

        setIsLoading(true);
        try {
            const result = await asistenciaClienteAPI.registrarAsistenciaPorDNI(dni);
            
            if (result.success) {
                toast.success('✅ Asistencia registrada exitosamente', {
                    duration: 3000,
                    position: 'top-center',
                });
                // Mostrar información del cliente
                setClienteEncontrado({
                    nombre: result.clienteNombre,
                    apellidos: result.clienteApellido,
                    plan: result.nombrePlan,
                    fechaRegistro: new Date().toLocaleString('es-ES')
                });

                // Limpiar después de 5 segundos
                setTimeout(() => {
                    setDni('');
                    setClienteEncontrado(null);
                }, 5000);
            }
        } catch (error) {
            console.error('Error al registrar asistencia:', error);
            toast.error(error.message || 'Error al registrar asistencia');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            registrarAsistencia();
        }
    };

    return (
        <div className="p-4 space-y-6">
            <Title>Registrar Asistencia de Cliente</Title>
            
            <Card className="max-w-2xl mx-auto">
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
                            onKeyPress={handleKeyPress}
                            maxLength={8}
                            icon={Search}
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button
                            icon={UserCheck}
                            onClick={registrarAsistencia}
                            loading={isLoading}
                            disabled={isLoading || dni.length !== 8}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Registrar Asistencia
                        </Button>
                    </div>

                    {clienteEncontrado && (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <Title className="text-green-700 mb-2">Asistencia Registrada</Title>
                            <div className="space-y-2">
                                <Text><strong>Cliente:</strong> {clienteEncontrado.nombre} {clienteEncontrado.apellidos}</Text>
                                <Text><strong>Plan:</strong> {clienteEncontrado.plan}</Text>
                                <Text><strong>Fecha y Hora:</strong> {clienteEncontrado.fechaRegistro}</Text>
                                <Badge color="green" size="lg">
                                    Asistencia Registrada Correctamente
                                </Badge>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default VerificarInscripcionPage;

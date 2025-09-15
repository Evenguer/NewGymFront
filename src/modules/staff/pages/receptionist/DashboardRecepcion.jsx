

import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Metric, Flex, Badge } from '@tremor/react';
import { Users, DollarSign, Home, UserCheck, UserX, TrendingUp } from 'react-feather';
import { dashboardRecepcionistaAPI } from '../../services/DashboardRecepcionistaAPI';

const DashboardRecepcion = () => {
  // Estados para datos del dashboard
  const [dashboardData, setDashboardData] = useState({
    gananciaDiariaVentasProductos: 0,
    gananciaDiariaAlquileres: 0,
    gananciaDiariaInscripciones: 0,
    clientesActivos: 0,
    ultimasInscripciones: [],
    ultimasVentas: [],
    clientesAsistieronHoy: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos del dashboard al montar el componente
  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Cargando datos del dashboard de recepcionista...');
        const datos = await dashboardRecepcionistaAPI.obtenerDatosDashboard();
        
        console.log('Datos del dashboard cargados:', datos);
        setDashboardData(datos);
        
      } catch (error) {
        console.error('Error al cargar dashboard:', error);
        setError(error.message);
        
        // Mantener datos por defecto en caso de error
        setDashboardData({
          gananciaDiariaVentasProductos: 0,
          gananciaDiariaAlquileres: 0,
          gananciaDiariaInscripciones: 0,
          clientesActivos: 0,
          ultimasInscripciones: [],
          ultimasVentas: [],
          clientesAsistieronHoy: []
        });
      } finally {
        setLoading(false);
      }
    };

    cargarDashboard();
  }, []);

  // Calcular ganancia total del día
  const gananciaTotal = parseFloat(dashboardData.gananciaDiariaVentasProductos || 0) + 
                       parseFloat(dashboardData.gananciaDiariaAlquileres || 0) + 
                       parseFloat(dashboardData.gananciaDiariaInscripciones || 0);

  // Formatear fecha para mostrar
  const fechaHoy = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
        <span className="ml-2 text-gray-600">Cargando datos del día...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Recepción</h1>
        <p className="text-gray-500">Resumen del día actual - {fechaHoy}</p>
        {gananciaTotal > 0 && (
          <div className="mt-2">
            <Badge color="emerald" size="lg">
              <TrendingUp size={16} className="mr-1" />
              Ganancia total del día: S/ {gananciaTotal.toFixed(2)}
            </Badge>
          </div>
        )}
      </div>

      {/* Tarjetas de estadísticas del día actual */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card decoration="top" decorationColor="emerald">
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-2 bg-emerald-100 rounded-md">
              <DollarSign size={20} className="text-emerald-500" />
            </div>
            <div>
              <Text>Ventas de productos (hoy)</Text>
              <Metric>S/ {parseFloat(dashboardData.gananciaDiariaVentasProductos || 0).toFixed(2)}</Metric>
            </div>
          </Flex>
        </Card>
        
        <Card decoration="top" decorationColor="blue">
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-2 bg-blue-100 rounded-md">
              <Home size={20} className="text-blue-500" />
            </div>
            <div>
              <Text>Alquileres (hoy)</Text>
              <Metric>S/ {parseFloat(dashboardData.gananciaDiariaAlquileres || 0).toFixed(2)}</Metric>
            </div>
          </Flex>
        </Card>
        
        <Card decoration="top" decorationColor="purple">
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-2 bg-purple-100 rounded-md">
              <UserCheck size={20} className="text-purple-500" />
            </div>
            <div>
              <Text>Inscripciones (hoy)</Text>
              <Metric>S/ {parseFloat(dashboardData.gananciaDiariaInscripciones || 0).toFixed(2)}</Metric>
            </div>
          </Flex>
        </Card>
        
        <Card decoration="top" decorationColor="indigo">
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-2 bg-indigo-100 rounded-md">
              <Users size={20} className="text-indigo-500" />
            </div>
            <div>
              <Text>Clientes activos</Text>
              <Metric>{dashboardData.clientesActivos}</Metric>
            </div>
          </Flex>
        </Card>
      </div>

      {/* Últimos movimientos del día */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Title>Últimas Inscripciones</Title>
          <div className="mt-4 space-y-3">
            {dashboardData.ultimasInscripciones.length === 0 ? (
              <Text className="text-gray-500 text-center py-4">No hay inscripciones recientes</Text>
            ) : dashboardData.ultimasInscripciones.map((inscripcion, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{inscripcion.nombreCompleto}</p>
                  <p className="text-xs text-gray-500">
                    Vence: {new Date(inscripcion.fechaDevolucion).toLocaleDateString('es-PE')}
                  </p>
                </div>
                <Badge color="purple">S/ {parseFloat(inscripcion.montoPagado || 0).toFixed(2)}</Badge>
              </div>
            ))}
          </div>
        </Card>
        
        <Card>
          <Title>Últimas Ventas</Title>
          <div className="mt-4 space-y-3">
            {dashboardData.ultimasVentas.length === 0 ? (
              <Text className="text-gray-500 text-center py-4">No hay ventas recientes</Text>
            ) : dashboardData.ultimasVentas.map((venta, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{venta.cliente}</p>
                  <p className="text-xs text-gray-500">
                    {venta.productos && venta.productos.length > 0 
                      ? venta.productos.slice(0, 2).join(', ') + (venta.productos.length > 2 ? '...' : '')
                      : 'Sin productos'
                    }
                  </p>
                  <p className="text-xs text-gray-400">
                    {(() => {
                      // Mostrar la fecha exactamente como viene de la base de datos (YYYY-MM-DD)
                      if (typeof venta.fecha === 'string' && venta.fecha.length >= 10) {
                        // Extraer solo la parte de la fecha (YYYY-MM-DD)
                        const fechaStr = venta.fecha.substring(0, 10);
                        // Formatear a DD/MM/YYYY para Perú
                        const [year, month, day] = fechaStr.split('-');
                        return `${day}/${month}/${year}`;
                      }
                      return venta.fecha;
                    })()}
                  </p>
                </div>
                <Badge color="emerald">
                  {venta.productos?.length || 0} item{venta.productos?.length === 1 ? '' : 's'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Asistencia de clientes hoy */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <Title>Clientes que asistieron hoy</Title>
            <Badge color="blue" size="lg">
              {dashboardData.clientesAsistieronHoy.length} clientes
            </Badge>
          </div>
          <div className="mt-4">
            {dashboardData.clientesAsistieronHoy.length === 0 ? (
              <div className="text-center py-8">
                <UserX size={48} className="text-gray-300 mx-auto mb-2" />
                <Text className="text-gray-500">No hay registro de asistencia para hoy</Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {dashboardData.clientesAsistieronHoy.map((cliente, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <UserCheck size={16} className="text-green-500" />
                    <span className="font-medium text-green-700">{cliente}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardRecepcion;

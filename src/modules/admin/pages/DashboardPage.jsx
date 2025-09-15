import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Tab, TabList, TabGroup, TabPanel, TabPanels, Metric, Flex, ProgressBar } from '@tremor/react';
import { AreaChart, DonutChart, BarChart } from '@tremor/react';
import { Calendar, Users, DollarSign, Package, AlertTriangle, Clock, TrendingUp, BarChart2 } from 'react-feather';
import dashboardAdminAPI from '../services/DashboardAdminAPI';
import { ENDPOINTS } from '../../../shared/services/endpoints';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    empleados: 0,
    clientes: 0,
    ventasHoy: 0,
    ventasTotales: 0,
    productosAgotados: 0,
    nuevasInscripciones: 0
  });
  
  const [chartData, setChartData] = useState({
    ventasPorMes: [],
    inscripcionesPorMes: [],
    productosMasVendidos: [],
    ventasPorCategoria: [],
    asistenciasPorDia: [],
    clientesPorPlan: [],
    productosBajoStock: [],
    ultimasVentas: [],
    ultimasInscripciones: [],
    empleadosHoy: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Formato de peso peruano
  const formatoPeso = (valor) => {
    if (typeof valor !== 'number') valor = parseFloat(valor) || 0;
    return `S/ ${valor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Cargar datos del backend
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      console.log('🔄 Iniciando carga de datos del dashboard...');
      // Cargar datos básicos del dashboard (métricas principales)
      const dashboardData = await dashboardAdminAPI.obtenerDatosDashboard();
      setStats(dashboardData);
      // Cargar estadísticas para gráficos en paralelo
      const [estadisticasVentas, estadisticasClientes, productosBajoStock, actividadesRecientes, horariosHoy, piezasBajoStockResp, topPiezasMasAlquiladas] = await Promise.all([
        dashboardAdminAPI.obtenerEstadisticasVentas(),
        dashboardAdminAPI.obtenerEstadisticasClientes(),
        dashboardAdminAPI.obtenerProductosBajoStock(),
        dashboardAdminAPI.obtenerActividadesRecientes(),
        dashboardAdminAPI.obtenerHorariosHoy(),
        dashboardAdminAPI.obtenerPiezasBajoStock(),
        // Servicio para top 10 piezas más alquiladas del mes actual
        fetch(ENDPOINTS.REPORTES_ALQUILERES.TOP10_PIEZAS_MES_ACTUAL, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json())
      ]);
      // ...procesamiento de datos productos y clientes...
      const ventasChartData = estadisticasVentas.ventasPorMes?.map(item => ({
        date: item.nombreMes?.substring(0, 3) || 'Sin fecha',
        mes: item.mes || '',
        Ventas: parseFloat(item.totalVentas) || 0,
        CantidadVentas: parseInt(item.cantidadVentas) || 0
      })) || [];
      const inscripcionesChartData = estadisticasVentas.inscripcionesPorMes?.map(item => ({
        date: item.nombreMes?.substring(0, 3) || 'Sin fecha',
        mes: item.mes || '',
        Inscripciones: parseFloat(item.montoTotal) || 0
      })) || [];
      const combinedChartData = ventasChartData.map((venta) => {
        const inscripcionCorrespondiente = inscripcionesChartData.find(
          insc => insc.mes === venta.mes
        ) || { Inscripciones: 0 };
        return {
          date: venta.date,
          Ventas: venta.Ventas,
          Inscripciones: inscripcionCorrespondiente.Inscripciones
        };
      });
      const categoriasData = estadisticasVentas.ventasPorCategoria?.map(item => ({
        name: item.categoria || 'Sin categoría',
        value: parseFloat(item.totalVentas) || 0,
        cantidadVendida: parseInt(item.cantidadVendida) || 0
      })) || [];
      const productosMasVendidos = estadisticasVentas.productosMasVendidos?.map(item => ({
        name: item.nombreProducto || 'Sin nombre',
        value: parseInt(item.cantidadVendida) || 0,
        ingresos: parseFloat(item.totalVentas) || 0
      })) || [];
      const asistenciasData = estadisticasClientes.asistenciasPorDia?.map(item => ({
        name: item.diaSemana || 'Sin día',
        value: parseInt(item.cantidadAsistencias) || 0
      })) || [];
      const clientesPlanData = estadisticasClientes.clientesPorPlan?.map(item => ({
        name: item.nombrePlan || 'Sin plan',
        value: parseInt(item.cantidadClientes) || 0,
        porcentaje: parseFloat(item.porcentaje) || 0
      })) || [];
      setChartData({
        ventasPorMes: combinedChartData,
        productosPorCategoria: categoriasData,
        asistenciasPorDia: asistenciasData,
        clientesPorPlan: clientesPlanData,
        productosMasVendidos: productosMasVendidos,
        productosBajoStock: productosBajoStock.productosBajoStock || [],
        ultimasVentas: actividadesRecientes.ultimasVentas || [],
        ultimasInscripciones: actividadesRecientes.ultimasInscripciones || [],
        empleadosHoy: horariosHoy.empleadosHoy || actividadesRecientes.empleadosHoy || [],
        // Nuevos datos para análisis de equipamiento
        piezasBajoStock: piezasBajoStockResp.piezasBajoStock || [],
        topPiezasMasAlquiladas: Array.isArray(topPiezasMasAlquiladas) ? topPiezasMasAlquiladas : (topPiezasMasAlquiladas?.data || [])
      });
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      console.error('❌ Error al cargar datos del dashboard:', err);
      setError('Error al cargar los datos del dashboard: ' + err.message);
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const handleRefresh = () => {
    fetchDashboardData();
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
        <Text>Cargando datos del dashboard...</Text>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">Error al cargar el dashboard</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-500">Bienvenido al panel de administración de Busster GYM</p>
        </div>
      </div>
      
      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card decoration="top" decorationColor="indigo" className="overflow-hidden relative">
          {refreshing && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>}
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-3 bg-indigo-100 rounded-lg flex-shrink-0">
              <Users size={24} className="text-indigo-600" />
            </div>
            <div className="min-w-0">
              <Text className="truncate text-indigo-600">Clientes Activos</Text>
              <Metric className="text-2xl font-bold text-gray-900">{stats.clientes.toLocaleString()}</Metric>
              <Text className="text-xs text-gray-500 mt-1">Total registrados y activos</Text>
            </div>
          </Flex>
        </Card>
        
        <Card decoration="top" decorationColor="emerald" className="overflow-hidden relative">
          {refreshing && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
          </div>}
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-3 bg-emerald-100 rounded-lg flex-shrink-0">
              <BarChart2 size={24} className="text-emerald-600" />
            </div>
            <div className="min-w-0">
              <Text className="truncate text-emerald-600">Ventas Hoy</Text>
              <Metric className="text-2xl font-bold text-gray-900">{stats.ventasHoy.toLocaleString()}</Metric>
              <Text className="text-xs text-gray-500 mt-1">Transacciones completadas</Text>
            </div>
          </Flex>
        </Card>
        
        <Card decoration="top" decorationColor="amber" className="overflow-hidden relative">
          {refreshing && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
          </div>}
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-3 bg-amber-100 rounded-lg flex-shrink-0">
              <Calendar size={24} className="text-amber-600" />
            </div>
            <div className="min-w-0">
              <Text className="truncate text-amber-600">Nuevas Inscripciones</Text>
              <Metric className="text-2xl font-bold text-gray-900">{stats.nuevasInscripciones.toLocaleString()}</Metric>
              <Text className="text-xs text-gray-500 mt-1">Registradas hoy</Text>
            </div>
          </Flex>
        </Card>
        
        <Card decoration="top" decorationColor="rose" className="overflow-hidden relative">
          {refreshing && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-600"></div>
          </div>}
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-3 bg-rose-100 rounded-lg flex-shrink-0">
              <AlertTriangle size={24} className="text-rose-600" />
            </div>
            <div className="min-w-0">
              <Text className="truncate text-rose-600">Productos con Bajo Stock</Text>
              <Metric className="text-2xl font-bold text-gray-900">{stats.productosAgotados.toLocaleString()}</Metric>
              <Text className="text-xs text-gray-500 mt-1">Requieren reabastecimiento</Text>
            </div>
          </Flex>
        </Card>
        
        <Card decoration="top" decorationColor="blue" className="overflow-hidden relative">
          {refreshing && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>}
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <Clock size={24} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <Text className="truncate text-blue-600">Empleados Activos</Text>
              <Metric className="text-2xl font-bold text-gray-900">{stats.empleados.toLocaleString()}</Metric>
              <Text className="text-xs text-gray-500 mt-1">Personal registrado</Text>
            </div>
          </Flex>
        </Card>
        
        <Card decoration="top" decorationColor="green" className="overflow-hidden relative">
          {refreshing && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>}
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <div className="min-w-0">
              <Text className="truncate text-green-600">Ingresos Totales</Text>
              <Metric className="text-2xl font-bold text-gray-900">{formatoPeso(stats.ventasTotales)}</Metric>
              <Text className="text-xs text-gray-500 mt-1">Total de ventas, inscripciones y alquileres</Text>
            </div>
          </Flex>
        </Card>
      </div>
      
      {/* Sección de gráficos y análisis */}
      <TabGroup>
        <TabList className="mb-4 overflow-x-auto flex-nowrap">
          <Tab className="whitespace-nowrap">📈 Tendencias de Ventas</Tab>
          <Tab className="whitespace-nowrap">📦 Análisis de Productos</Tab>
          <Tab className="whitespace-nowrap">🔧 Análisis de Equipamiento</Tab>
          <Tab className="whitespace-nowrap">👨🏻‍💼 Actividad de Clientes</Tab>
          <Tab className="whitespace-nowrap">⚡ Actividades Recientes</Tab>
        </TabList>
        
        <TabPanels>
          {/* Panel 1: Tendencias de Ventas e Inscripciones */}
          <TabPanel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="h-auto min-h-[420px] pb-6 relative">
                {refreshing && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>}
                <Title>📈 Tendencia de Ventas e Inscripciones</Title>
                <Text>Comparativa mensual de ingresos y nuevos miembros</Text>
                <div className="mt-4 h-72">
                  {chartData.ventasPorMes.length > 0 ? (
                    <AreaChart
                      className="h-full w-full" 
                      data={chartData.ventasPorMes}
                      index="date"
                      categories={["Ventas", "Inscripciones"]}
                      colors={["indigo", "emerald"]}
                      minValue={0}
                      showLegend
                      showGridLines
                      showAnimation
                      valueFormatter={(value) => value.toLocaleString()}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <Text>No hay datos de tendencias disponibles</Text>
                    </div>
                  )}
                </div>
              </Card>
              
              <Card className="h-auto min-h-[420px] pb-6 relative">
                {refreshing && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>}
                <Title>🎯 Ventas por Categoría</Title>
                <Text>Distribución de ingresos por tipo de producto</Text>
                <div className="mt-4 h-72 flex items-center justify-center">
                  {chartData.productosPorCategoria.length > 0 ? (
                    <DonutChart
                      className="h-full max-w-full"
                      data={chartData.productosPorCategoria}
                      category="value"
                      index="name"
                      colors={["indigo", "emerald", "amber", "sky", "rose", "violet"]}
                      showAnimation
                      showLabel
                      valueFormatter={(value) => formatoPeso(value)}
                    />
                  ) : (
                    <div className="flex items-center justify-center text-gray-500">
                      <Text>No hay datos de categorías disponibles</Text>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabPanel>
          
          {/* Panel 2: Análisis de Productos */}
          <TabPanel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="h-auto min-h-[420px] pb-6 relative">
                {refreshing && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>}
                <Title>🏆 Productos Más Vendidos</Title>
                <Text>Top productos por cantidad vendida</Text>
                <div className="mt-4 h-72 overflow-hidden">
                  {chartData.productosMasVendidos.length > 0 ? (
                    <BarChart
                      className="h-full w-full"
                      data={chartData.productosMasVendidos}
                      index="name"
                      categories={["value"]}
                      colors={["indigo"]}
                      showAnimation
                      showLegend={false}
                      valueFormatter={(value) => `${value} unidades`}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <Text>No hay datos de productos vendidos</Text>
                    </div>
                  )}
                </div>
              </Card>
              <Card className="h-auto min-h-[420px] pb-6 overflow-auto relative">
                {refreshing && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                </div>}
                <Title>⚠️ Nivel de Inventario</Title>
                <Text>Productos que requieren reabastecimiento</Text>
                <div className="mt-4 space-y-4 max-h-72 overflow-auto pr-2">
                  {chartData.productosBajoStock.length > 0 ? (
                    chartData.productosBajoStock.map((producto, index) => (
                      <div key={index} className="mb-4 p-3 border rounded-lg bg-gray-50">
                        <Flex className="flex-wrap mb-2">
                          <Text className="truncate max-w-[70%] font-medium">{producto.nombreProducto}</Text>
                          <Text className="text-sm text-gray-600">{producto.categoria}</Text>
                        </Flex>
                        <Flex className="flex-wrap mb-2">
                          <Text className="text-sm">Stock: {producto.stockActual} / Mínimo: {producto.stockMinimo}</Text>
                          <Text className={`text-sm font-medium ${
                            producto.porcentajeStock < 20 ? 'text-red-600' : 
                            producto.porcentajeStock < 50 ? 'text-amber-600' : 'text-green-600'
                          }`}>
                            {producto.porcentajeStock}% del stock mínimo
                          </Text>
                        </Flex>
                        <ProgressBar 
                          value={Math.min(producto.porcentajeStock, 100)} 
                          color={producto.porcentajeStock < 20 ? "red" : producto.porcentajeStock < 50 ? "amber" : "emerald"} 
                          className="mt-2" 
                        />
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Package size={48} className="mx-auto mb-2 text-gray-400" />
                        <Text>¡Excelente! No hay productos con bajo stock</Text>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabPanel>

          {/* Panel 3: Análisis de Equipamiento */}
          <TabPanel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="h-auto min-h-[420px] pb-6 relative">
                {refreshing && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>}
                <Title>🏆 Piezas Más Alquiladas</Title>
                <Text>Top piezas por cantidad alquilado</Text>
                <div className="mt-4 h-72 overflow-hidden">
                  {chartData.topPiezasMasAlquiladas?.length > 0 ? (
                    <BarChart
                      className="h-full w-full"
                      data={chartData.topPiezasMasAlquiladas.map(p => ({ name: p.pieza, Cantidad: p.unidadesAlquiladas }))}
                      index="name"
                      categories={["Cantidad"]}
                      colors={["indigo"]}
                      showAnimation
                      showLegend={false}
                      valueFormatter={v => `${v} alquileres`}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <Text>No hay datos de piezas alquiladas</Text>
                    </div>
                  )}
                </div>
              </Card>
              <Card className="h-auto min-h-[420px] pb-6 overflow-auto relative">
                {refreshing && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                </div>}
                <Title>📦 Stock de Equipamiento</Title>
                <Text>Piezas que requieren reabastecimiento</Text>
                <div className="mt-4 space-y-4 max-h-72 overflow-auto pr-2">
                  {chartData.piezasBajoStock?.length > 0 ? (
                    chartData.piezasBajoStock.map((pieza, index) => (
                      <div key={index} className="mb-4 p-3 border rounded-lg bg-gray-50">
                        <Flex className="flex-wrap mb-2">
                          <Text className="truncate max-w-[70%] font-medium">{pieza.nombrePieza}</Text>
                          <Text className="text-sm text-gray-600">{pieza.categoria}</Text>
                        </Flex>
                        <Flex className="flex-wrap mb-2">
                          <Text className="text-sm">Stock: {pieza.stockActual} / Mínimo: {pieza.stockMinimo}</Text>
                          <Text className={`text-sm font-medium ${
                            pieza.porcentajeStock < 20 ? 'text-red-600' : 
                            pieza.porcentajeStock < 50 ? 'text-amber-600' : 'text-green-600'
                          }`}>
                            {pieza.porcentajeStock}% del stock mínimo
                          </Text>
                        </Flex>
                        <ProgressBar 
                          value={Math.min(pieza.porcentajeStock, 100)} 
                          color={pieza.porcentajeStock < 20 ? "red" : pieza.porcentajeStock < 50 ? "amber" : "emerald"} 
                          className="mt-2" 
                        />
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Package size={48} className="mx-auto mb-2 text-gray-400" />
                        <Text>¡Excelente! No hay piezas con bajo stock</Text>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabPanel>
          
          {/* Panel 3: Actividad de Clientes */}
          <TabPanel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="h-auto min-h-[420px] pb-6 relative">
                {refreshing && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>}
                <Title>📅 Asistencias por Día de la Semana</Title>
                <Text>Patrón de asistencia de los clientes</Text>
                <div className="mt-4 h-72">
                  {chartData.asistenciasPorDia.length > 0 ? (
                    <BarChart
                      className="h-full w-full"
                      data={chartData.asistenciasPorDia}
                      index="name"
                      categories={["value"]}
                      colors={["emerald"]}
                      showAnimation
                      showLegend={false}
                      valueFormatter={(value) => `${value} asistencias`}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <Text>No hay datos de asistencias disponibles</Text>
                    </div>
                  )}
                </div>
              </Card>
              
              <Card className="h-auto min-h-[420px] pb-6 relative">
                {refreshing && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                </div>}
                <Title>💪 Distribución de Clientes por Plan</Title>
                <Text>Popularidad de los planes de membresía</Text>
                <div className="mt-4 h-72 flex items-center justify-center">
                  {chartData.clientesPorPlan.length > 0 ? (
                    <DonutChart
                      className="h-full max-w-full"
                      data={chartData.clientesPorPlan}
                      category="value"
                      index="name"
                      colors={["indigo", "sky", "violet", "emerald", "amber", "rose"]}
                      showAnimation
                      showLabel
                      valueFormatter={(value) => `${value} clientes`}
                    />
                  ) : (
                    <div className="flex items-center justify-center text-gray-500">
                      <Text>No hay datos de planes disponibles</Text>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabPanel>
          {/* Panel 4: Actividades Recientes */}
          <TabPanel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="h-auto min-h-[420px] overflow-auto relative">
                {refreshing && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>}
                <Title>⚡ Actividades Recientes</Title>
                <Text>Últimas transacciones e inscripciones</Text>
                <div className="mt-4 space-y-4 max-h-[400px] overflow-auto pr-2">
                  {/* Últimas Ventas */}
                  {chartData.ultimasVentas.length > 0 && chartData.ultimasVentas.slice(0, 4).map((venta, index) => (
                    <div key={`venta-${index}`} className="flex gap-4 items-start border-b border-gray-100 pb-3 last:border-b-0">
                      <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                        <DollarSign size={16} className="text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900">💰 Nueva venta</p>
                        <p className="text-sm text-gray-600 truncate">
                          {venta.nombreCliente} {venta.apellidosCliente}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm font-semibold text-green-600">
                            {formatoPeso(venta.total)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(venta.fechaVenta).toLocaleDateString('es-ES', { 
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Últimas Inscripciones */}
                  {chartData.ultimasInscripciones.length > 0 && chartData.ultimasInscripciones.slice(0, 3).map((inscripcion, index) => (
                    <div key={`inscripcion-${index}`} className="flex gap-4 items-start border-b border-gray-100 pb-3 last:border-b-0">
                      <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                        <Users size={16} className="text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900">🎯 Nueva inscripción</p>
                        <p className="text-sm text-gray-600 truncate">
                          {inscripcion.nombreCliente} {inscripcion.apellidosCliente}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm font-medium text-blue-600">
                            {inscripcion.nombrePlan}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(inscripcion.fechaInscripcion).toLocaleDateString('es-ES', { 
                              day: '2-digit', month: 'short' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Alert de stock bajo */}
                  {stats.productosAgotados > 0 && (
                    <div className="flex gap-4 items-start border border-amber-200 rounded-lg p-3 bg-amber-50">
                      <div className="p-2 bg-amber-100 rounded-full flex-shrink-0">
                        <AlertTriangle size={16} className="text-amber-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-amber-800">⚠️ Alerta de inventario</p>
                        <p className="text-sm text-amber-700">
                          {stats.productosAgotados} producto{stats.productosAgotados > 1 ? 's' : ''} 
                          {stats.productosAgotados > 1 ? ' están' : ' está'} por debajo del stock mínimo
                        </p>
                        <span className="text-xs text-amber-600 block mt-1">Revisa la sección de inventario</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Mensaje si no hay actividades */}
                  {chartData.ultimasVentas.length === 0 && chartData.ultimasInscripciones.length === 0 && (
                    <div className="h-32 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Clock size={48} className="mx-auto mb-2 text-gray-400" />
                        <Text>No hay actividades recientes</Text>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              
              <Card className="h-auto min-h-[420px] overflow-auto relative">
                {refreshing && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>}
                <Title>🕒 Horarios de Empleados Hoy</Title>
                <Text>Personal programado para el día de hoy</Text>
                <div className="mt-4 space-y-4 max-h-[400px] overflow-auto pr-2">
                  {chartData.empleadosHoy.length > 0 ? (
                    chartData.empleadosHoy.map((empleado, index) => (
                      <div key={index} className="flex gap-4 items-start border-b border-gray-100 pb-3 last:border-b-0">
                        <div className="p-2 bg-purple-100 rounded-full flex-shrink-0">
                          <Clock size={16} className="text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-gray-900 truncate">
                              {empleado.nombreEmpleado} {empleado.apellidosEmpleado}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
                              empleado.estado === 'Activo' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {empleado.estado}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {empleado.tipoInstructor || 'Empleado'}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-indigo-600 font-medium">
                              {empleado.horaInicio} - {empleado.horaFin}
                            </span>
                            <span className="text-xs text-gray-500">
                              {empleado.diaSemana}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-32 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Clock size={48} className="mx-auto mb-2 text-gray-400" />
                        <Text>No hay empleados programados para hoy</Text>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default DashboardPage;
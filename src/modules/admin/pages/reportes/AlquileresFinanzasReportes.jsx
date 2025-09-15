// Utilidad para mostrar el nombre del mes
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

import React, { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  TabPanel,
  TabPanels,
  BarChart,
  DonutChart,
  LineChart,
  Grid,
  Flex,
  Metric,
  ProgressBar,
  Legend
} from '@tremor/react';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  BarChart2,
  PieChart,
  AlertTriangle
} from 'react-feather';
import * as reportesAlquilerAPI from '../../services/reportes/reportesFInancierosAlquilerAPI';

const formatoMoneda = (valor) => {
  const valorRedondeado = Math.round((valor || 0) * 100) / 100;
  return `S/ ${valorRedondeado.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const AlquileresFinanzasReportes = () => {
  const [periodo, setPeriodo] = useState('mensual');
  const [cargando, setCargando] = useState(true);
  const [recargando, setRecargando] = useState(false);
  const [error, setError] = useState(null);
  const [datos, setDatos] = useState(null);


  // Cargar datos según el periodo seleccionado
  const cargarDatos = async (periodoParam = periodo) => {
    setCargando(true);
    setRecargando(true);
    setError(null);
    try {
      let estado, top10, ingresos;
      if (periodoParam === 'mensual') {
        estado = await reportesAlquilerAPI.getEstadoAlquileresMesActual();
        top10 = await reportesAlquilerAPI.getTop10PiezasMasAlquiladasMesActual();
        ingresos = await reportesAlquilerAPI.getIngresosMesActual();
      } else if (periodoParam === 'trimestral') {
        estado = await reportesAlquilerAPI.getEstadoAlquileresTrimestreActual();
        top10 = await reportesAlquilerAPI.getTop10PiezasMasAlquiladasTrimestreActual();
        ingresos = await reportesAlquilerAPI.getIngresosTrimestreActual();
      } else {
        estado = await reportesAlquilerAPI.getEstadoAlquileresAnioActual();
        top10 = await reportesAlquilerAPI.getTop10PiezasMasAlquiladasAnioActual();
        ingresos = await reportesAlquilerAPI.getIngresosAnioActual();
      }
      const mora = await reportesAlquilerAPI.getAlquileresConPagosPendientesOMora();
      const tendencia = await reportesAlquilerAPI.getTendenciaAlquileresUltimosMeses(6);
      setDatos({
        estado,
        top10,
        mora,
        ingresos,
        tendencia
      });
    } catch (err) {
      setError('Error al cargar los reportes de alquileres.');
    } finally {
      setCargando(false);
      setRecargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const cambiarPeriodo = (nuevoPeriodo) => {
    if (periodo !== nuevoPeriodo) {
      setPeriodo(nuevoPeriodo);
      cargarDatos(nuevoPeriodo);
    }
  };

  const recargarDatos = () => cargarDatos(periodo);

  if (cargando) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <Text>Cargando reportes de alquileres...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <AlertTriangle size={48} className="text-amber-500" />
        <Title>No se pudieron cargar los reportes</Title>
        <Text>{error}</Text>
        <button 
          onClick={recargarDatos} 
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 mt-4"
        >
          Reintentar
        </button>
      </div>
    );
  }


  // Datos para gráficos según periodo
  const graficoEstado = datos.estado?.map(e => ({ name: e.estado, value: e.cantidad }));
  const graficoTop10 = datos.top10?.map((p, i) => ({
    name: p.pieza || `Pieza ${i + 1}`,
    value: p.unidadesAlquiladas || 0,
    ingresos: p.ingresos || 0
  }));
  // Para la gráfica de tendencias, mostrar nombre del mes y ganancia
  const graficoTendencia = datos.tendencia?.map((t, i) => ({
    mes: t.mes && MESES[t.mes - 1] ? MESES[t.mes - 1] : `Mes ${i + 1}`,
    alquileres: t.total || 0,
    ganancia: t.ganancia || t.total || 0
  }));

  return (
    <div className="p-4">

      <div className="mb-6">
        <Title className="text-2xl font-bold mb-2">Reportes de Alquileres y Finanzas</Title>
        <Text>Análisis de ingresos, piezas más alquiladas y tendencias de alquiler</Text>
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => cambiarPeriodo('mensual')}
              className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 ${periodo === 'mensual' ? '' : 'opacity-70'}`}
              disabled={periodo === 'mensual'}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => cambiarPeriodo('trimestral')}
              className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 ${periodo === 'trimestral' ? '' : 'opacity-70'}`}
              disabled={periodo === 'trimestral'}
            >
              Trimestral
            </button>
            <button
              type="button"
              onClick={() => cambiarPeriodo('anual')}
              className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 ${periodo === 'anual' ? '' : 'opacity-70'}`}
              disabled={periodo === 'anual'}
            >
              Anual
            </button>
          </div>
        </div>
      </div>

      <TabGroup>
        <TabList className="mb-4">
          <Tab icon={DollarSign}>Resumen</Tab>
          <Tab icon={PieChart}>Estado de Alquileres</Tab>
          <Tab icon={ShoppingBag}>Top 10 Piezas</Tab>
          <Tab icon={BarChart2}>Alquileres con Mora</Tab>
        </TabList>
        <TabPanels>

          {/* Resumen */}
          <TabPanel>
            <Grid numItems={1} numItemsSm={2} numItemsLg={2} className="gap-6 mb-6">
              <Card decoration="top" decorationColor="indigo">
                <Flex justifyContent="start" className="space-x-4">
                  <DollarSign size={28} className="text-indigo-500" />
                  <div>
                    <Text>Ingresos {periodo.charAt(0).toUpperCase() + periodo.slice(1)}</Text>
                    <Metric>{formatoMoneda(datos.ingresos)}</Metric>
                  </div>
                </Flex>
              </Card>
              <Card decoration="top" decorationColor="emerald">
                <Flex justifyContent="start" className="space-x-4">
                  <ShoppingBag size={28} className="text-emerald-500" />
                  <div>
                    <Text>Total de alquileres</Text>
                    <Metric>{Array.isArray(graficoEstado) && graficoEstado.length > 0
                      ? graficoEstado.reduce((acc, cur) => acc + (cur.value || 0), 0)
                      : 0}</Metric>
                  </div>
                </Flex>
              </Card>
            </Grid>
            {/* Ganancias por mes de alquileres finalizados */}
            <Card className="mt-6">
              <Title>Ganancias por Alquileres Finalizados</Title>
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganancia</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(datos.tendencia) && datos.tendencia.length > 0 ? (
                      datos.tendencia.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.mes && MESES[item.mes - 1] ? MESES[item.mes - 1] : `Mes ${idx + 1}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatoMoneda(item.ganancia || item.total || 0)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={2} className="text-center py-4 text-gray-500">No hay datos de ganancias</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabPanel>

          {/* Estado de alquileres */}
          <TabPanel>
            <Card className="mb-6">
              <Title>Estado de Alquileres (Mes Actual)</Title>
              <Text>Distribución de estados de los alquileres</Text>
              <DonutChart
                data={graficoEstado}
                category="value"
                index="name"
                valueFormatter={v => v}
                colors={["indigo", "emerald", "amber", "rose", "violet"]}
                className="h-80 mt-6"
              />
              <Legend
                categories={graficoEstado?.map(e => e.name)}
                colors={["indigo", "emerald", "amber", "rose", "violet"]}
                className="mt-3"
              />
            </Card>
          </TabPanel>

          {/* Top 10 piezas */}
          <TabPanel>
            <Card className="mb-6">
              <Title>Top 10 Piezas Más Alquiladas (Mes Actual)</Title>
              <Text>Piezas con mayor cantidad de alquileres e ingresos</Text>
              <BarChart
                data={graficoTop10?.map(({ name, value, ingresos }) => ({ name, Cantidad: value, ingresos }))}
                index="name"
                categories={["Cantidad"]}
                colors={["indigo"]}
                valueFormatter={v => v}
                yAxisWidth={80}
                className="h-80 mt-6"
              />
            </Card>
            <Card>
              <Title>Ingresos por Pieza</Title>
              <Text>Comparativa de ingresos generados por las piezas más alquiladas</Text>
              <BarChart
                data={graficoTop10}
                index="name"
                categories={["ingresos"]}
                colors={["emerald"]}
                valueFormatter={formatoMoneda}
                yAxisWidth={80}
                className="h-80 mt-6"
              />
            </Card>
          </TabPanel>

          {/* Tendencias eliminado por solicitud */}

          {/* Alquileres con mora */}
          <TabPanel>
            <Card className="mb-6">
              <Title>Alquileres con Pagos Pendientes o Mora</Title>
              <Text>Listado de piezas y montos en mora</Text>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pieza</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mora</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(datos.mora) && datos.mora.length > 0 ? (
                      datos.mora.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.pieza}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.estado}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatoMoneda(item.mora)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={3} className="text-center py-4 text-gray-500">No hay alquileres con mora</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default AlquileresFinanzasReportes;

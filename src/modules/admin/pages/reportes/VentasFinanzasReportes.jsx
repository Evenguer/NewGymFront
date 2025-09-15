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
  Select,
  SelectItem,
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
import reporteVentasAPI from '../../../../shared/services/reporteVentasAPI';

const formatoPeso = (valor) => {
  // Redondear a 2 decimales para moneda peruana
  const valorRedondeado = Math.round(valor * 100) / 100;
  return `S/ ${valorRedondeado.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Función para exportar el reporte actual como PDF
const exportarReportePDF = (datosFinancieros, periodo) => {
  import('jspdf').then(({ default: jsPDF }) => {
    import('jspdf-autotable').then(() => {
      const doc = new jsPDF();
      const fecha = new Date().toLocaleDateString('es-PE');
      const periodoTexto = periodo === 'mensual' ? 'Mensual' : 
                          periodo === 'trimestral' ? 'Trimestral' : 'Anual';
      
      // Título del reporte
      doc.setFontSize(18);
      doc.text('Reporte de Ventas y Finanzas', 15, 20);
      
      doc.setFontSize(12);
      doc.text(`Periodo: ${periodoTexto} - Generado el ${fecha}`, 15, 30);
      
      // Ingresos Totales
      doc.setFontSize(14);
      doc.text('Resumen Financiero', 15, 40);
      
      doc.setFontSize(11);
      doc.text(`Ingresos Totales: ${formatoPeso(datosFinancieros.ingresosTotales)}`, 20, 50);
      
      // Tabla de desglose de ingresos
      doc.autoTable({
        startY: 55,
        head: [['Categoría', 'Ingresos']],
        body: datosFinancieros.datosDesglosados.map(item => [
          item.categoria, 
          formatoPeso(item.valor)
        ]),
        headStyles: { fillColor: [30, 41, 59] },
        margin: { left: 15 },
      });
      
      // Productos más vendidos
      doc.setFontSize(14);
      doc.text('Top 5 Productos más Vendidos', 15, doc.lastAutoTable.finalY + 15);
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Producto', 'Unidades', 'Ingresos']],
        body: datosFinancieros.productosMasVendidos.slice(0, 5).map(item => [
          item.nombre, 
          item.unidades, 
          formatoPeso(item.ingresos)
        ]),
        headStyles: { fillColor: [30, 41, 59] },
        margin: { left: 15 },
      });
      
      // Análisis de Rentabilidad
      doc.setFontSize(14);
      doc.text('Análisis de Rentabilidad', 15, doc.lastAutoTable.finalY + 15);
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Producto', 'Costo', 'Precio Venta', 'Margen (%)']],
        body: datosFinancieros.analisisRentabilidad.map(item => [
          item.producto, 
          formatoPeso(item.costo), 
          formatoPeso(item.precio), 
          `${item.margen.toFixed(1)}%`
        ]),
        headStyles: { fillColor: [30, 41, 59] },
        margin: { left: 15 },
      });
      
      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`GymBuster - Página ${i} de ${pageCount}`, 15, doc.internal.pageSize.height - 10);
      }
      
      // Guardar el PDF
      doc.save(`Reporte_Ventas_Finanzas_${periodo}_${fecha.replace(/\//g, '-')}.pdf`);
    });
  });
};

const ReportesVentasFinanzas = () => {
  const [periodo, setPeriodo] = useState('mensual');
  const [datosFinancieros, setDatosFinancieros] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [recargando, setRecargando] = useState(false);

  // Función para transformar los datos del backend al formato esperado por los gráficos
  const transformarDatosParaGraficos = (datosBackend) => {
    try {
      console.log('Transformando datos del backend:', datosBackend);
      
      const datos = {
        periodo: datosBackend.periodo || 'mensual',
        
        // Ingresos totales
        ingresosTotales: datosBackend.ingresosTotales?.ingresosTotales || 0,
        ingresosEsteMes: datosBackend.ingresosTotales?.ingresosEsteMes || 0,
        
        // Crecimiento
        porcentajeCrecimiento: datosBackend.crecimiento?.porcentajeCrecimiento || 0,
        tendencia: datosBackend.crecimiento?.tendencia || 'neutral',
        tieneHistorial: datosBackend.crecimiento?.tieneHistorial || false,
        mensajeComparativa: datosBackend.crecimiento?.mensaje || 'Sin datos de comparación',
        fechaPrimeraVenta: datosBackend.crecimiento?.fechaPrimeraVenta || null,
        
        // Comparativa mensual
        comparativaMensual: Array.isArray(datosBackend.crecimiento?.comparativaMensual) && datosBackend.crecimiento.comparativaMensual.length > 0
          ? datosBackend.crecimiento.comparativaMensual.map(comp => ({
              mes: comp.nombreMes || comp.mes || 'Mes',
              cambio: comp.porcentajeCrecimiento || 0,
              positivo: (comp.porcentajeCrecimiento || 0) >= 0,
              ventasActuales: parseFloat(comp.ventasActuales) || 0,
              ventasAnteriores: parseFloat(comp.ventasAnteriores) || 0
            }))
          : [],
        
        // Transacciones
        totalTransacciones: datosBackend.totalTransacciones?.totalTransacciones || 0,
        ticketPromedio: datosBackend.totalTransacciones?.ticketPromedio || 0,
        
        // Datos para gráficos - Verificar si los arrays existen y tienen datos
        datosDesglosados: Array.isArray(datosBackend.analisisCategoria?.ventasPorCategoria) && datosBackend.analisisCategoria.ventasPorCategoria.length > 0
          ? datosBackend.analisisCategoria.ventasPorCategoria.map(cat => ({
              categoria: cat.categoria || cat.nombre || 'Sin categoría',
              valor: parseFloat(cat.totalVentas) || 0
            }))
          : [
              { categoria: 'Productos', valor: 0 },
              { categoria: 'Servicios', valor: 0 },
              { categoria: 'Membresías', valor: 0 }
            ],
        
        ventasPorCategoria: Array.isArray(datosBackend.analisisCategoria?.ventasPorCategoria) && datosBackend.analisisCategoria.ventasPorCategoria.length > 0
          ? datosBackend.analisisCategoria.ventasPorCategoria.map(cat => ({
              categoria: cat.categoria || cat.nombre || 'Sin categoría',
              valor: parseFloat(cat.totalVentas) || 0,
              porcentaje: parseFloat(cat.porcentajeContribucion) || 0
            }))
          : [
              { categoria: 'Productos', valor: 0, porcentaje: 0 },
              { categoria: 'Servicios', valor: 0, porcentaje: 0 },
              { categoria: 'Membresías', valor: 0, porcentaje: 0 }
            ],
        
        productosMasVendidos: Array.isArray(datosBackend.productosMasVendidos?.top10Productos) && datosBackend.productosMasVendidos.top10Productos.length > 0
          ? datosBackend.productosMasVendidos.top10Productos.map(prod => ({
              nombre: prod.nombreProducto || 'Producto sin nombre',
              unidades: parseInt(prod.cantidadVendida) || 0,
              ingresos: parseFloat(prod.totalVentas) || 0
            }))
          : [
              { nombre: 'Sin datos', unidades: 0, ingresos: 0 }
            ],
        
        tendenciaVentas: Array.isArray(datosBackend.tendencias?.evolucionVentas) && datosBackend.tendencias.evolucionVentas.length > 0
          ? datosBackend.tendencias.evolucionVentas.map(ev => ({
              mes: ev.nombreMes || ev.mes || 'Mes',
              ventas: parseFloat(ev.totalVentas) || 0
            }))
          : [
              { mes: 'Enero', ventas: 0 },
              { mes: 'Febrero', ventas: 0 },
              { mes: 'Marzo', ventas: 0 }
            ],
        
        analisisRentabilidad: Array.isArray(datosBackend.rentabilidad?.rentabilidadProductos) && datosBackend.rentabilidad.rentabilidadProductos.length > 0
          ? datosBackend.rentabilidad.rentabilidadProductos.map(rent => ({
              producto: rent.nombreProducto || 'Producto sin nombre',
              costo: parseFloat(rent.precioCompra) || 0,      // Precio unitario de compra
              precio: parseFloat(rent.precioVenta) || 0,      // Precio unitario de venta
              margen: parseFloat(rent.margenPorcentaje) || 0,
              ingresosTotales: parseFloat(rent.ingresos) || 0, // Total de ingresos calculado
              costosTotales: parseFloat(rent.costos) || 0,     // Total de costos calculado
              cantidadVendida: parseInt(rent.cantidadVendida) || 0 // Cantidad vendida
            }))
          : [
              { producto: 'Sin datos', costo: 0, precio: 0, margen: 0, ingresosTotales: 0, costosTotales: 0, cantidadVendida: 0 }
            ],
        
        // Métricas adicionales
        prediccionProximoMes: datosBackend.tendencias?.prediccion?.prediccionProximoMes || 0,
        prediccionesMeses: Array.isArray(datosBackend.tendencias?.prediccion?.prediccionesMeses) && datosBackend.tendencias.prediccion.prediccionesMeses.length > 0
          ? datosBackend.tendencias.prediccion.prediccionesMeses.map(pred => ({
              mes: pred.mes || 'Mes',
              prediccion: parseFloat(pred.prediccion) || 0,
              confianza: pred.confianza || 'Baja',
              tendencia: pred.tendencia || 'Estable'
            }))
          : [
              { mes: 'Agosto', prediccion: 0, confianza: 'Baja', tendencia: 'Estable' },
              { mes: 'Septiembre', prediccion: 0, confianza: 'Baja', tendencia: 'Estable' },
              { mes: 'Octubre', prediccion: 0, confianza: 'Baja', tendencia: 'Estable' }
            ],
        confiabilidadPrediccion: datosBackend.tendencias?.prediccion?.confiabilidad || 'Muy Baja',
        analisisTendencia: datosBackend.tendencias?.analisisTendencia || 'Sin datos',
        margenBruto: datosBackend.rentabilidad?.resumenRentabilidad?.margenBruto || 0,
        utilidadBruta: datosBackend.rentabilidad?.resumenRentabilidad?.utilidadBruta || 0
      };
      
      console.log('Datos transformados:', datos);
      return datos;
    } catch (error) {
      console.error('Error al transformar datos:', error);
      return {
        periodo: 'mensual',
        ingresosTotales: 0,
        ingresosEsteMes: 0,
        porcentajeCrecimiento: 0,
        tendencia: 'neutral',
        tieneHistorial: false,
        mensajeComparativa: 'Sin datos disponibles',
        fechaPrimeraVenta: null,
        comparativaMensual: [],
        prediccionesMeses: [
          { mes: 'Agosto', prediccion: 0, confianza: 'Muy Baja', tendencia: 'Estable' },
          { mes: 'Septiembre', prediccion: 0, confianza: 'Muy Baja', tendencia: 'Estable' },
          { mes: 'Octubre', prediccion: 0, confianza: 'Muy Baja', tendencia: 'Estable' }
        ],
        confiabilidadPrediccion: 'Muy Baja',
        totalTransacciones: 0,
        ticketPromedio: 0,
        datosDesglosados: [
          { categoria: 'Productos', valor: 0 },
          { categoria: 'Servicios', valor: 0 },
          { categoria: 'Membresías', valor: 0 }
        ],
        ventasPorCategoria: [
          { categoria: 'Productos', valor: 0, porcentaje: 0 },
          { categoria: 'Servicios', valor: 0, porcentaje: 0 },
          { categoria: 'Membresías', valor: 0, porcentaje: 0 }
        ],
        productosMasVendidos: [
          { nombre: 'Sin datos', unidades: 0, ingresos: 0 }
        ],
        tendenciaVentas: [
          { mes: 'Enero', ventas: 0 },
          { mes: 'Febrero', ventas: 0 },
          { mes: 'Marzo', ventas: 0 }
        ],
        analisisRentabilidad: [
          { producto: 'Sin datos', costo: 0, precio: 0, margen: 0, ingresosTotales: 0, costosTotales: 0, cantidadVendida: 0 }
        ]
      };
    }
  };
  const cargarDatos = async (periodoParam = periodo) => {
    if (!recargando) setRecargando(true);
    if (!cargando) setCargando(true);
    setError(null);
    
    try {
      console.log(`Cargando datos financieros para período: ${periodoParam}`);
      
      // Obtener todos los datos usando el nuevo API
      const datos = await reporteVentasAPI.obtenerDatosCompletos(periodoParam);
      
      // Transformar los datos para que coincidan con el formato esperado por los gráficos
      const datosTransformados = transformarDatosParaGraficos(datos);
      
      setDatosFinancieros(datosTransformados);
      console.log('Datos financieros cargados correctamente:', datosTransformados);
    } catch (error) {
      console.error('Error al cargar datos financieros:', error);
      setError(`Error al cargar los datos: ${error.message}`);
    } finally {
      setCargando(false);
      setRecargando(false);
    }
  };
  
  const cambiarPeriodo = (nuevoPeriodo) => {
    if (periodo !== nuevoPeriodo) {
      setPeriodo(nuevoPeriodo);
      cargarDatos(nuevoPeriodo);
    }
  };
  
  const recargarDatos = () => {
    cargarDatos();
  };

  useEffect(() => {
    cargarDatos();
    // Solo se ejecuta al montar el componente, ya que cambiarPeriodo maneja las recargas
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (cargando) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <Text>Cargando datos financieros...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <AlertTriangle size={48} className="text-amber-500" />
        <Title>No se pudieron cargar los datos financieros</Title>
        <Text>{error}</Text>
        <div className="flex space-x-3">
          <button 
            onClick={recargarDatos} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reintentar
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }
  
  if (!datosFinancieros) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <Text>Inicializando panel financiero...</Text>
      </div>
    );
  }

  // Datos para gráficos
  // Datos para gráficos con ajuste proporcional para el desglose
  const datosGraficaDesglose = datosFinancieros.datosDesglosados.map(item => ({
    name: item.categoria,
    value: item.valor
  }));

  // Ajustar el desglose para que coincida con ingresos totales
  const totalDesglose = datosGraficaDesglose.reduce((sum, item) => sum + item.value, 0);
  const factorAjuste = totalDesglose > 0 ? datosFinancieros.ingresosTotales / totalDesglose : 1;
  
  // Aplicar ajuste proporcional al desglose
  const datosGraficaDesgloseAjustado = datosGraficaDesglose.map(item => ({
    name: item.name,
    value: Math.round(item.value * factorAjuste * 100) / 100
  }));

  // Usar los mismos datos ajustados para ambos gráficos (consistencia total)
  const datosGraficaCategorias = datosGraficaDesgloseAjustado;

  // Calcular el total correcto para porcentajes de categorías (usar datos consistentes)
  const totalCategorias = datosGraficaCategorias.reduce((sum, item) => sum + item.value, 0);

  const datosTendencia = datosFinancieros.tendenciaVentas.map(item => ({
    date: item.mes,
    "Ventas": item.ventas
  }));

  // Componente para el overlay de carga
  const LoadingOverlay = () => {
    if (!recargando) return null;
    
    return (
      <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
        <div className="flex flex-col items-center p-4 rounded-lg bg-white shadow-md">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-3"></div>
          <Text className="text-indigo-600 font-medium">Actualizando datos...</Text>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Title className="text-2xl font-bold mb-2">Reportes de Ventas y Finanzas</Title>
          <Text>Análisis detallado de los ingresos, ventas y rentabilidad del negocio</Text>
        </div>
      </div>

      {/* Selector de Periodo */}
      <div className="mb-6">
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

      <TabGroup>
        <TabList className="mb-4">
          <Tab icon={DollarSign}>Resumen Financiero</Tab>
          <Tab icon={PieChart}>Análisis por Categoría</Tab>
          <Tab icon={ShoppingBag}>Productos más Vendidos</Tab>
          <Tab icon={TrendingUp}>Tendencias</Tab>
          <Tab icon={BarChart2}>Rentabilidad</Tab>
        </TabList>
        
        <TabPanels>
          {/* Pestaña 1: Resumen Financiero */}
          <TabPanel>
            <div className="relative">
              {recargando && <LoadingOverlay />}
              <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6 mb-6">
                <Card decoration="top" decorationColor="indigo">
                  <Flex justifyContent="start" className="space-x-4">
                    <DollarSign size={28} className="text-indigo-500" />
                    <div>
                      <Text>Ingresos Totales</Text>
                      <Metric>{formatoPeso(datosFinancieros.ingresosTotales)}</Metric>
                    </div>
                  </Flex>
                </Card>
                
                <Card decoration="top" decorationColor="emerald">
                  <Flex justifyContent="start" className="space-x-4">
                    <TrendingUp size={28} className="text-emerald-500" />
                    <div>
                      <Text>Crecimiento vs. Periodo Anterior</Text>
                      <Metric className={datosFinancieros.porcentajeCrecimiento >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                        {datosFinancieros.porcentajeCrecimiento >= 0 ? '+' : ''}{datosFinancieros.porcentajeCrecimiento?.toFixed(1)}%
                      </Metric>
                    </div>
                  </Flex>
                </Card>
                
                <Card decoration="top" decorationColor="amber">
                  <Flex justifyContent="start" className="space-x-4">
                    <ShoppingBag size={28} className="text-amber-500" />
                    <div>
                      <Text>Total de Transacciones</Text>
                      <Metric>{datosFinancieros.totalTransacciones?.toLocaleString('es-PE') || '0'}</Metric>
                    </div>
                  </Flex>
                </Card>
              </Grid>

              <Card className="mb-6 relative">
              <Title>Desglose de Ingresos</Title>
              <Text>Distribución de ingresos por tipo de operación</Text>
              <DonutChart
                data={datosGraficaDesgloseAjustado}
                category="value"
                index="name"
                valueFormatter={formatoPeso}
                colors={["indigo", "emerald", "amber"]}
                className="h-80 mt-6"
              />
              <Legend
                categories={datosFinancieros.datosDesglosados.map(item => item.categoria)}
                colors={["indigo", "emerald", "amber"]}
                className="mt-3"
              />
            </Card>
            </div>
          </TabPanel>

          {/* Pestaña 2: Análisis por Categoría */}
          <TabPanel>
            <div className="relative">
              {recargando && <LoadingOverlay />}
              <Card className="mb-6">
                <Title>Ventas por Categoría</Title>
                <Text>Distribución de ventas entre las diferentes categorías de productos</Text>
                <BarChart
                  data={datosGraficaCategorias}
                  index="name"
                  categories={["value"]}
                  colors={["indigo"]}
                  valueFormatter={formatoPeso}
                  yAxisWidth={80}
                className="h-80 mt-6"
              />
            </Card>

            <Grid numItems={1} numItemsSm={2} className="gap-6">
              <Card>
                <Title>Distribución Porcentual</Title>
                <Text>Contribución de cada categoría al total de ventas</Text>
                <DonutChart
                  data={datosGraficaCategorias}
                  category="value"
                  index="name"
                  valueFormatter={(value) => `${((value / totalCategorias) * 100).toFixed(1)}%`}
                  colors={["indigo", "violet", "emerald", "amber"]}
                  className="h-60 mt-6"
                />
              </Card>

              <Card>
                <Title>Rendimiento por Categoría</Title>
                <Text>Cumplimiento de objetivos por categoría</Text>
                {datosFinancieros.ventasPorCategoria.map((item, index) => (
                  <div key={index} className="mt-4">
                    <Flex>
                      <Text>{item.categoria}</Text>
                      <Text>{Math.round((item.valor / totalCategorias) * 100)}%</Text>
                    </Flex>
                    <ProgressBar
                      value={(item.valor / totalCategorias) * 100}
                      color={["indigo", "violet", "emerald", "amber"][index % 4]}
                      className="mt-2"
                    />
                  </div>
                ))}
              </Card>
            </Grid>
            </div>
          </TabPanel>

          {/* Pestaña 3: Productos más Vendidos */}
          <TabPanel>
            <div className="relative">
              {recargando && <LoadingOverlay />}
              <Card className="mb-6">
                <Title>Top 10 Productos más Vendidos</Title>
                <Text>Productos con mayor rotación e ingresos generados</Text>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidades Vendidas</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {datosFinancieros.productosMasVendidos.map((producto, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producto.nombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producto.unidades}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatoPeso(producto.ingresos)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <Title>Distribución de Ventas - Top Productos</Title>
              <Text>Comparativa de ingresos generados por los productos más vendidos</Text>
              <BarChart
                data={datosFinancieros.productosMasVendidos.slice(0, 5)}
                index="nombre"
                categories={["ingresos"]}
                colors={["indigo"]}
                valueFormatter={formatoPeso}
                yAxisWidth={80}
                className="h-80 mt-6"
              />
            </Card>
            </div>
          </TabPanel>

          {/* Pestaña 4: Tendencias */}
          <TabPanel>
            <div className="relative">
              {recargando && <LoadingOverlay />}
            <Card className="mb-6">
              <Title>Evolución de Ventas</Title>
              <Text>Tendencia de ventas durante los últimos 6 meses</Text>
              <LineChart
                data={datosTendencia}
                index="date"
                categories={["Ventas"]}
                colors={["indigo"]}
                valueFormatter={formatoPeso}
                yAxisWidth={80}
                className="h-80 mt-6"
              />
            </Card>

            <Grid numItems={1} numItemsSm={2} className="gap-6">
              <Card>
                <Title>Comparativa con Periodo Anterior</Title>
                <Text>Diferencia porcentual respecto al periodo anterior</Text>
                
                {datosFinancieros?.tieneHistorial ? (
                  <div className="mt-6">
                    {datosFinancieros.comparativaMensual.length > 0 ? (
                      datosFinancieros.comparativaMensual.map((item, index) => (
                        <div key={index} className="mb-4 flex items-center justify-between">
                          <Text>{item.mes}</Text>
                          <div className="text-right">
                            <Text className={`font-medium ${item.positivo ? 'text-emerald-500' : 'text-red-500'}`}>
                              {item.positivo ? '+' : ''}{item.cambio.toFixed(1)}%
                            </Text>
                            <Text className="text-xs text-gray-500">
                              ${formatoPeso(item.ventasActuales)} vs ${formatoPeso(item.ventasAnteriores)}
                            </Text>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="mt-6 text-center py-8">
                        <Text className="text-gray-500">
                          Datos de comparación en proceso de cálculo
                        </Text>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 text-center py-8">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <Text className="text-gray-600 font-medium mb-2">
                      {datosFinancieros?.mensajeComparativa || 'Sin datos de comparación disponibles'}
                    </Text>
                    {datosFinancieros?.fechaPrimeraVenta && (
                      <Text className="text-sm text-gray-500">
                        Primera venta registrada: {new Date(datosFinancieros.fechaPrimeraVenta).toLocaleDateString('es-ES')}
                      </Text>
                    )}
                    <Text className="text-sm text-gray-500 mt-2">
                      Se necesitan datos de al menos 2 períodos para mostrar comparativas
                    </Text>
                  </div>
                )}
              </Card>

              <Card>
                <Title>Predicción Próximo Periodo</Title>
                <Text>Proyección de ventas para los próximos meses</Text>
                
                {datosFinancieros?.prediccionesMeses && datosFinancieros.prediccionesMeses.length > 0 ? (
                  <div>
                    {/* Información de confiabilidad */}
                    <div className="mt-4 mb-6 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Text className="text-sm font-medium">Confiabilidad de la predicción:</Text>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          datosFinancieros.confiabilidadPrediccion === 'Alta' ? 'bg-green-100 text-green-800' :
                          datosFinancieros.confiabilidadPrediccion === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {datosFinancieros.confiabilidadPrediccion}
                        </span>
                      </div>
                    </div>

                    {/* Predicciones detalladas */}
                    <div className="mb-6 space-y-3">
                      {datosFinancieros.prediccionesMeses.map((prediccion, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <Text className="font-medium">{prediccion.mes}</Text>
                            <Text className="text-xs text-gray-500">{prediccion.tendencia}</Text>
                          </div>
                          <div className="text-right">
                            <Text className="font-semibold text-blue-600">
                              {formatoPeso(prediccion.prediccion)}
                            </Text>
                            <Text className={`text-xs ${
                              prediccion.confianza === 'Alta' ? 'text-green-600' :
                              prediccion.confianza === 'Media' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              Confianza: {prediccion.confianza}
                            </Text>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Gráfico de predicción */}
                    <LineChart
                      data={[
                        ...datosTendencia,
                        ...datosFinancieros.prediccionesMeses.map(pred => ({
                          date: pred.mes.substring(0, 3),
                          "Ventas": pred.prediccion,
                          "Predicción": pred.prediccion
                        }))
                      ]}
                      index="date"
                      categories={["Ventas", "Predicción"]}
                      colors={["indigo", "amber"]}
                      valueFormatter={formatoPeso}
                      className="h-60 mt-4"
                      connectNulls={false}
                    />
                  </div>
                ) : (
                  <div className="mt-6 text-center py-8">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <Text className="text-gray-600 font-medium mb-2">
                      Predicciones no disponibles
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Se necesitan al menos 2 meses de datos históricos para generar predicciones confiables
                    </Text>
                  </div>
                )}
              </Card>
            </Grid>
            </div>
          </TabPanel>

          {/* Pestaña 5: Rentabilidad */}
          <TabPanel>
            <div className="relative">
              {recargando && <LoadingOverlay />}
            <Card className="mb-6">
              <Title>Análisis de Rentabilidad por Producto</Title>
              <Text>Margen de ganancia de los productos más destacados</Text>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Venta</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margen (%)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {datosFinancieros.analisisRentabilidad.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.producto}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatoPeso(item.costo)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatoPeso(item.precio)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium
                              ${item.margen >= 50 ? 'bg-emerald-100 text-emerald-800' : 
                                item.margen >= 30 ? 'bg-blue-100 text-blue-800' : 
                                'bg-amber-100 text-amber-800'}`}
                          >
                            {item.margen.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Grid numItems={1} numItemsSm={2} className="gap-6">
              <Card>
                <Title>Margen por Producto</Title>
                <Text>Comparativa del margen de ganancia</Text>
                <BarChart
                  data={datosFinancieros.analisisRentabilidad}
                  index="producto"
                  categories={["margen"]}
                  colors={["indigo"]}
                  valueFormatter={(v) => `${v.toFixed(1)}%`}
                  className="h-60 mt-6"
                />
              </Card>

              <Card>
                <Title>Costos vs Ingresos</Title>
                <Text>Relación entre costos e ingresos por producto</Text>
                <BarChart
                  data={datosFinancieros.analisisRentabilidad}
                  index="producto"
                  categories={["costo", "precio"]}
                  colors={["amber", "indigo"]}
                  valueFormatter={formatoPeso}
                  stack={false}
                  className="h-60 mt-6"
                />
              </Card>
            </Grid>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default ReportesVentasFinanzas;

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@tremor/react';
import { Download } from 'react-feather';
const handleExportPDF = (planes) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Reporte de Planes', 14, 20);
  doc.setFontSize(11);
  // Fecha arriba a la derecha
  const fecha = new Date().toLocaleString('es-PE', { hour12: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(`Fecha de generación: ${fecha}`, pageWidth - 14, 14, { align: 'right' });
  autoTable(doc, {
    startY: 30,
    head: [['Nombre', 'Descripción', 'Estado']],
    body: planes.map(plan => [
      plan.nombre,
      plan.descripcion,
      plan.estado ? 'Activo' : 'Inactivo'
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [153, 27, 27] }, // rojo oscuro
    theme: 'striped',
  });
  doc.save(`planes_${new Date().toISOString().slice(0,10)}.pdf`);
};


import React, { useState, useEffect } from 'react';
import { Card, TextInput, Title, Badge, TabGroup, TabList, Tab, Grid, Flex } from '@tremor/react';
import { Search, RefreshCw, Tag, Check, XOctagon } from 'react-feather';
import { listPlanes } from '../../../../shared/services/planAPI';
import { useAuth } from '../../../../shared/hooks/useAuth';

const PlanesListaPage = () => {
  const { token } = useAuth() || {};
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [counters, setCounters] = useState({
    total: 0,
    activas: 0,
    inactivas: 0
  });

  const fetchPlanes = async () => {
    try {
      setLoading(true);
      const authToken = token || localStorage.getItem('token');
      const data = await listPlanes(authToken);
      setPlanes(data);
      setCounters({
        total: data.length,
        activas: data.filter(p => p.estado).length,
        inactivas: data.filter(p => !p.estado).length
      });
      setError(null);
    } catch (err) {
      setError('Error al cargar los planes');
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanes();
    // eslint-disable-next-line
  }, []);

  const filteredPlanes = planes.filter(plan => {
    const matchesSearch =
      plan.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    switch (activeTab) {
      case 'activas':
        return matchesSearch && plan.estado;
      case 'inactivas':
        return matchesSearch && !plan.estado;
      default:
        return matchesSearch;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
        <p className="font-medium">Error</p>
        <p>{error}</p>
        <button 
          onClick={fetchPlanes}
          className="mt-2 flex items-center text-sm bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded"
        >
          <RefreshCw size={14} className="mr-1" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planes</h1>
          <p className="text-gray-500">Lista de planes</p>
        </div>
        <Button 
          icon={Download} 
          variant="secondary" 
          onClick={() => handleExportPDF(planes)} 
          className="flex items-center gap-2 border-2 border-red-600 text-red-600 bg-white hover:bg-red-50 hover:border-red-700 hover:text-red-700 transition-colors"
        >
          Exportar PDF
        </Button>
      </div>
      <Card>
        <Flex justifyContent="between" className="mb-6">
          <Title>Lista de Planes</Title>
          <TextInput
            icon={Search}
            placeholder="Buscar planes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Flex>
        <TabGroup className="mt-4" onIndexChange={(index) => setActiveTab(['todos', 'activas', 'inactivas'][index])}>
          <TabList>
            <Tab>Todos <Badge size="xs">{counters.total}</Badge></Tab>
            <Tab>Activos <Badge size="xs" color="green">{counters.activas}</Badge></Tab>
            <Tab>Inactivos <Badge size="xs" color="red">{counters.inactivas}</Badge></Tab>
          </TabList>
        </TabGroup>
        {filteredPlanes.length > 0 ? (
          <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6 mt-6">
            {filteredPlanes.map((plan) => (
              <Card 
                key={plan.idPlan}
                className={`transition-all duration-300 ${
                  plan.estado 
                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                    : ''
                }`}
                style={!plan.estado ? { backgroundColor: '#ededed', borderColor: '#ededed', color: '#888', opacity: 1 } : {}}
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      plan.estado 
                        ? 'bg-green-100' 
                        : 'bg-gray-100'
                    }`}>
                      <Tag size={20} className={`${
                        plan.estado 
                          ? 'text-green-600' 
                          : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg ${
                        plan.estado ? 'text-green-900' : 'text-gray-700'
                      }`}>
                        {plan.nombre}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        plan.estado ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {plan.descripcion}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.estado ? (
                      <>
                        <Check size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-green-800 bg-green-100 px-2 py-1 rounded-full">
                          Plan Activo
                        </span>
                      </>
                    ) : (
                      <>
                        <XOctagon size={16} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded-full">
                          Plan Inactivo
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </Grid>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? 'No se encontraron planes' : 'No hay planes disponibles'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PlanesListaPage;

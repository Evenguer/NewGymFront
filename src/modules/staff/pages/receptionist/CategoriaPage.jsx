

import React, { useState, useEffect } from 'react';
import { Card, TextInput, Title, Badge, Button, TabGroup, TabList, Tab, Grid, Flex } from '@tremor/react';
import { Search, RefreshCw, Tag, Check, XOctagon, Download } from 'react-feather';
import { categoriaAPI } from '../../../admin/services/CategoriaAPI';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';



const handleExportPDF = (categorias) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Reporte de Categorías', 14, 20);
  doc.setFontSize(11);
  // Fecha arriba a la derecha
  const fecha = new Date().toLocaleString('es-PE', { hour12: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(`Fecha de generación: ${fecha}`, pageWidth - 14, 14, { align: 'right' });
  autoTable(doc, {
    startY: 30,
    head: [['Nombre', 'Descripción', 'Estado']],
    body: categorias.map(cat => [
      cat.nombre,
      cat.descripcion,
      cat.estado ? 'Activa' : 'Descontinuada'
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [153, 27, 27] }, // rojo oscuro
    theme: 'striped',
  });
  doc.save(`categorias_${new Date().toISOString().slice(0,10)}.pdf`);
};

const CategoriaPage = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [counters, setCounters] = useState({
    total: 0,
    activas: 0,
    inactivas: 0
  });

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const data = await categoriaAPI.listarCategorias();
      setCategorias(data);
      setCounters({
        total: data.length,
        activas: data.filter(c => c.estado).length,
        inactivas: data.filter(c => !c.estado).length
      });
      setError(null);
    } catch (err) {
      setError('Error al cargar las categorías');
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const filteredCategorias = categorias.filter(cat => {
    const matchesSearch =
      cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    switch (activeTab) {
      case 'activas':
        return matchesSearch && cat.estado;
      case 'inactivas':
        return matchesSearch && !cat.estado;
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
          onClick={fetchCategorias}
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
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-500">Lista de categorías</p>
        </div>
        <Button 
          icon={Download} 
          variant="secondary" 
          onClick={() => handleExportPDF(categorias)} 
          className="flex items-center gap-2 border-2 border-red-600 text-red-600 bg-white hover:bg-red-50 hover:border-red-700 hover:text-red-700 transition-colors"
        >
          Exportar PDF
        </Button>
      </div>
      <Card>
        <Flex justifyContent="between" className="mb-6">
          <Title>Lista de Categorías</Title>
          <TextInput
            icon={Search}
            placeholder="Buscar categorías..."
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
        {filteredCategorias.length > 0 ? (
          <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6 mt-6">
            {filteredCategorias.map((categoria) => (
              <Card 
                key={categoria.idCategoria}
                className={`transition-all duration-300 ${
                  categoria.estado 
                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                    : ''
                }`}
                style={!categoria.estado ? { backgroundColor: '#ededed', borderColor: '#ededed', color: '#888', opacity: 1 } : {}}
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      categoria.estado 
                        ? 'bg-green-100' 
                        : 'bg-gray-100'
                    }`}>
                      <Tag size={20} className={`${
                        categoria.estado 
                          ? 'text-green-600' 
                          : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg ${
                        categoria.estado ? 'text-green-900' : 'text-gray-700'
                      }`}>
                        {categoria.nombre}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        categoria.estado ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {categoria.descripcion}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {categoria.estado ? (
                      <>
                        <Check size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-green-800 bg-green-100 px-2 py-1 rounded-full">
                          Categoría Activa
                        </span>
                      </>
                    ) : (
                      <>
                        <XOctagon size={16} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded-full">
                          Categoría Descontinuada
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
              {searchTerm ? 'No se encontraron categorías' : 'No hay categorías disponibles'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CategoriaPage;

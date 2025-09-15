
import React, { useContext, useEffect, useState } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { AuthContext } from '../../../shared/context/AuthContext';
import { getDesempenoActual, getHistorialDesempeno } from '../services/desempenoAPI';
import axios from 'axios';
import { ENDPOINTS } from '../../../shared/services/endpoints';
import { useNavigate } from 'react-router-dom';

// Badge moderno animado
const Badge = ({ children, color = 'gray', icon }) => {
  const colorMap = {
    green: 'bg-emerald-100 text-emerald-700',
    yellow: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    gray: 'bg-gray-100 text-gray-700',
    orange: 'bg-orange-100 text-orange-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm ring-1 ring-inset ring-white/40 animate-fade-in ${colorMap[color] || colorMap.gray}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

const getIndicadorColor = (indicador) => {
  if (!indicador) return 'gray';
  if (indicador.toLowerCase().includes('normal')) return 'green';
  if (indicador.toLowerCase().includes('sobrepeso')) return 'yellow';
  if (indicador.toLowerCase().includes('obeso')) return 'red';
  if (indicador.toLowerCase().includes('bajo')) return 'blue';
  return 'gray';
};

const getNivelColor = (nivel) => {
  if (!nivel) return 'gray';
  if (nivel.toLowerCase().includes('alto')) return 'green';
  if (nivel.toLowerCase().includes('medio')) return 'yellow';
  if (nivel.toLowerCase().includes('bajo')) return 'red';
  return 'gray';
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60 p-8 mb-8 ${className}`}>{children}</div>
);

const InfoTooltip = ({ text }) => (
  <span className="ml-1 inline-block align-middle group relative cursor-pointer">
    <svg className="w-3 h-3 text-gray-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#888">i</text>
    </svg>
    <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-44 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 shadow-lg">{text}</span>
  </span>
);

const ClientPerformanceHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user || !user.id) throw new Error('No se pudo identificar al usuario.');
        // 1. Obtener el idCliente real usando el id de usuario
        const token = localStorage.getItem('token');
        const res = await axios.get(ENDPOINTS.GET_CLIENT_BY_USER(user.id), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const idCliente = res.data?.idCliente || res.data?.id || null;
        if (!idCliente) throw new Error('No se pudo obtener el ID de cliente.');
        // 2. Obtener desempeño actual (activo) para excluirlo del historial
        let actualDesempeno = null;
        let actualInscripcionId = null;
        try {
          const actual = await getDesempenoActual(idCliente);
          if (Array.isArray(actual)) {
            actualDesempeno = actual.length > 0 ? actual[0] : null;
          } else if (actual && typeof actual === 'object') {
            actualDesempeno = actual;
          }
          // Si el desempeño actual tiene idInscripcion, lo guardamos para filtrar
          if (actualDesempeno && (actualDesempeno.idInscripcion || actualDesempeno.inscripcion?.idInscripcion)) {
            actualInscripcionId = actualDesempeno.idInscripcion || actualDesempeno.inscripcion?.idInscripcion;
          }
        } catch {}
        // 3. Historial de desempeños (mostrar todos excepto el actual)
        const hist = await getHistorialDesempeno(idCliente);
        console.log('[HISTORIAL RAW]', hist);
        console.log('[ACTUAL DESEMPENO]', actualDesempeno);
        let filtered = Array.isArray(hist) ? hist : [];
        // Excluir solo el desempeño actual por idDesempeno
        filtered = filtered.filter(d => {
          if (actualDesempeno && d.idDesempeno && actualDesempeno.idDesempeno) {
            return d.idDesempeno !== actualDesempeno.idDesempeno;
          }
          return true;
        });
        console.log('[HISTORIAL FILTRADO]', filtered);
        setHistorial(filtered);
      } catch (err) {
        setError(
          typeof err === 'string' ? err : (err?.message || 'No se pudo cargar el historial de desempeños.')
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Header moderno con botón de navegación */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200/60 relative mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Historial de Desempeño
                  </h1>
                  <p className="text-sm text-gray-500">Evolución de tus mediciones físicas y progreso personal</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/client/inscripciones/desempeno')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              aria-label="Ir al desempeño actual"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Ver desempeño actual</span>
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <LoadingSpinner message="Cargando historial de desempeños..." />
        ) : error ? (
          <Card className="text-center text-red-600">{error}</Card>
        ) : (
          <div className="relative">
            {/* Timeline visual moderno y llamativo */}
            <div className="absolute left-10 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary-300 via-primary-400 to-primary-600 rounded-full opacity-30"></div>
            <div className="space-y-12 pl-24 pr-8">
              {historial.length > 0 ? (
                historial.map((d, idx) => (
                  <div key={d.idDesempeno || d.id || idx} className="relative group">
                    {/* Punto animado */}
                    <div className="absolute -left-16 top-8 w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-xl border border-gray-100 p-10 hover:shadow-2xl transition-all duration-200">
                      <div className="flex flex-wrap items-center gap-6 mb-4">
                        <Badge color={getIndicadorColor(d.indicador)} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /></svg>}>{d.indicador}</Badge>
                        <Badge color={getNivelColor(d.nivelFisico)} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}>{d.nivelFisico || '-'}</Badge>
                        <span className="text-sm text-gray-400 ml-2 flex items-center gap-1"><svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-7 4h8" /></svg>{d.fechaCreacion ? new Date(d.fechaCreacion).toLocaleDateString() : '-'}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-base font-medium mb-4">
                        <div className="flex flex-col items-center"><span className="text-gray-500 text-xs">Peso</span><span className="font-bold text-gray-900 text-2xl">{d.peso}</span></div>
                        <div className="flex flex-col items-center"><span className="text-gray-500 text-xs">Estatura</span><span className="font-bold text-gray-900 text-2xl">{d.estatura}</span></div>
                        <div className="flex flex-col items-center"><span className="text-gray-500 text-xs">IMC</span><span className="font-bold text-primary-700 text-2xl">{d.imc}</span></div>
                        <div className="flex flex-col items-center"><span className="text-gray-500 text-xs">Edad</span><span className="font-bold text-gray-900 text-2xl">{d.edad}</span></div>
                      </div>
                      <div className="flex flex-wrap gap-6 mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2"><svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2l4-4" /></svg>Diagnóstico: <span className="font-semibold text-gray-800">{d.diagnostico || '-'}</span></div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2"><svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2z" /></svg>Entrenador: <span className="font-semibold text-primary-700">{d.entrenadorNombre ? d.entrenadorNombre : (d.creadoPor || '-')}</span></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-600 text-center">No hay historial de desempeños registrados.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPerformanceHistoryPage;

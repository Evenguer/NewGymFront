import React, { useEffect, useState } from 'react';
import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getHistorialPlanes } from '../services/clientAPI';
import { useAuth } from '../../../shared/hooks/useAuth';
import { ENDPOINTS } from '../../../shared/services/endpoints';
import axios from 'axios';
import { ChevronLeft, CheckCircle, XCircle } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ClientPlanesAnteriores = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [planesAnteriores, setPlanesAnteriores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    
    axios.get(ENDPOINTS.GET_CLIENT_BY_USER(user.id), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const idCliente = res.data.id;
        if (!idCliente) throw new Error('No se encontró idCliente en la respuesta');
        return getHistorialPlanes(idCliente);
      })
      .then(data => {
        console.log('Historial de planes recibido:', data); // Para depuración
        // Filtrar solo planes cancelados y finalizados
        const planesInactivos = Array.isArray(data) ? data.filter(plan => {
          const estado = plan.estadoInscripcion || plan.estado || 'ACTIVO';
          return estado === 'CANCELADO' || estado === 'FINALIZADO';
        }) : [];
        setPlanesAnteriores(planesInactivos);
      })
      .catch((err) => {
        console.error('Error cargando historial:', err);
        setError('No se pudieron cargar los planes anteriores. Por favor, intenta nuevamente.');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const getEstadoBadgeColor = (estado) => {
    if (estado === 'FINALIZADO') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (estado === 'CANCELADO') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTipoPlanColor = (tipo) => {
    if (tipo === 'PREMIUM') return 'bg-primary-100 text-primary-800 border-primary-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  const calcularEstadisticas = (plan) => {
    const asistencias = plan.asistencias || [];
    const totalDias = asistencias.length;
    const diasAsistidos = asistencias.filter(a => a.estado === true).length;
    const porcentajeAsistencia = totalDias > 0 ? Math.round((diasAsistidos / totalDias) * 100) : 0;
    
    return {
      totalDias,
      diasAsistidos,
      porcentajeAsistencia
    };
  };

  if (loading) return <LoadingSpinner message="Cargando historial de planes..." />;
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-8 space-y-6">
          {/* Icono de error */}
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {/* Mensaje de error */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Oops, algo salió mal</h3>
            <p className="text-gray-600">{error}</p>
          </div>
          
          {/* Botón de reintento */}
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reintentar</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (selectedPlan) {
    // Vista detallada del plan seleccionado
    const stats = calcularEstadisticas(selectedPlan);
    const asistencias = selectedPlan.asistencias || [];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header con botón de regreso */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setSelectedPlan(null)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ChevronLeft size={20} />
              <span className="font-semibold">Volver a la lista</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Detalle del Plan
                </h1>
                <p className="text-sm text-gray-500">Información y estadísticas completas</p>
              </div>
            </div>
          </div>

          {/* Información del plan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                  {selectedPlan.nombrePlan}
                </h2>
                <div className="flex gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getTipoPlanColor(selectedPlan.tipoPlan || 'PREMIUM')}`}>
                    {selectedPlan.tipoPlan === 'PREMIUM' && (
                      <svg className="w-3 h-3 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                    {selectedPlan.tipoPlan || 'PREMIUM'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getEstadoBadgeColor(selectedPlan.estadoInscripcion)}`}>
                    {selectedPlan.estadoInscripcion}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold text-xs">Fecha inicio</span>
                      <p className="font-bold text-gray-900">{selectedPlan.fechaInicio}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold text-xs">Fecha fin</span>
                      <p className="font-bold text-gray-900">{selectedPlan.fechaFin}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Estadísticas */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 min-w-[300px] border border-gray-200/60">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span>Estadísticas de Asistencia</span>
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-600">{stats.totalDias}</div>
                    <div className="text-xs text-gray-600">Días totales</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">{stats.diasAsistidos}</div>
                    <div className="text-xs text-gray-600">Días asistidos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-600">{stats.porcentajeAsistencia}%</div>
                    <div className="text-xs text-gray-600">Asistencia</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendario de asistencias */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Historial de Asistencias</h3>
                <p className="text-sm text-gray-500">Registro completo de entrenamientos</p>
              </div>
            </div>
            <div className="grid gap-3">
              {asistencias.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">No hay registros</h4>
                  <p className="text-gray-500">No se encontraron registros de asistencia para este plan</p>
                </div>
              ) : (
                asistencias
                  .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                  .map((asistencia, index) => (
                    <div key={`asistencia-${asistencia.fecha}-${index}`} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/60">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${asistencia.estado ? 'bg-emerald-100' : 'bg-red-100'}`}>
                          {asistencia.estado ? (
                            <CheckCircle size={20} className="text-emerald-600" />
                          ) : (
                            <XCircle size={20} className="text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {format(parseISO(asistencia.fecha), "EEEE d 'de' MMMM yyyy", { locale: es })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {asistencia.estado ? 'Asistió al entrenamiento' : 'No asistió'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${asistencia.estado ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {asistencia.estado ? 'ASISTIÓ' : 'NO ASISTIÓ'}
                        </div>
                        {asistencia.horaAsistencia && (
                          <div className="text-xs text-gray-500 mt-1">
                            Hora: {asistencia.horaAsistencia}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista de lista de planes anteriores
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Planes Anteriores
                  </h1>
                  <p className="text-sm text-gray-500">Historial de tus planes finalizados y cancelados</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/client/inscripciones/planes-inscritos')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Ver Planes Actuales</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lista de planes */}
        {planesAnteriores.length === 0 ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-8 space-y-6">
                {/* Ilustración */}
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                {/* Mensaje principal */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">No tienes planes anteriores</h3>
                  <p className="text-gray-600">Aquí aparecerán tus planes finalizados o cancelados cuando completes tu journey de fitness.</p>
                </div>
                
                {/* Beneficios informativos */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">Historial completo de entrenamientos</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">Estadísticas de rendimiento</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">Progreso documentado</span>
                  </div>
                </div>
                
                {/* Botón de acción */}
                <div className="pt-4">
                  <button 
                    onClick={() => navigate('/client/inscripciones/planes-inscritos')}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Ver Planes Actuales</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {planesAnteriores.map((plan, index) => {
              const stats = calcularEstadisticas(plan);
              const tipoPlan = plan.tipoPlan || 'PREMIUM';
              
              return (
                <button
                  key={plan.id || `plan-${index}`}
                  className="w-full bg-white rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-lg transition-all duration-200 cursor-pointer group text-left"
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="p-6">
                    {/* Header de la tarjeta */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 mb-2">
                          {plan.nombrePlan}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getTipoPlanColor(tipoPlan)}`}>
                            {tipoPlan === 'PREMIUM' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            )}
                            {tipoPlan}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoBadgeColor(plan.estadoInscripcion)}`}>
                            {plan.estadoInscripcion}
                          </span>
                        </div>
                      </div>
                      
                      {/* Icono de flecha */}
                      <div className="ml-4 text-gray-400 group-hover:text-primary-500 transition-colors duration-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Información del plan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Inicio</p>
                          <p className="font-medium text-gray-900">{plan.fechaInicio}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Fin</p>
                          <p className="font-medium text-gray-900">{plan.fechaFin}</p>
                        </div>
                      </div>
                      
                      {tipoPlan === 'PREMIUM' && plan.entrenadorNombre && (
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Entrenador</p>
                            <p className="font-medium text-gray-900">{plan.entrenadorNombre} {plan.entrenadorApellido}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Total Días</p>
                          <p className="font-medium text-gray-900">{stats.totalDias}</p>
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas mejoradas */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200/60">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-900">{stats.porcentajeAsistencia}%</div>
                            <div className="text-sm text-gray-600">Asistencia general</div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-semibold text-emerald-600">{stats.diasAsistidos}</div>
                          <div className="text-xs text-gray-600">de {stats.totalDias} días</div>
                        </div>
                      </div>
                      
                      {/* Barra de progreso */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${stats.porcentajeAsistencia}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPlanesAnteriores;

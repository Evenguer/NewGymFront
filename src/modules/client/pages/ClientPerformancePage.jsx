import React, { useContext, useEffect, useState } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { AuthContext } from '../../../shared/context/AuthContext';
import { getDesempenoActual } from '../services/desempenoAPI';
import axios from 'axios';
import { ENDPOINTS } from '../../../shared/services/endpoints';
import { useNavigate } from 'react-router-dom';

// Card y Badge modernos
const Card = ({ children, className = '' }) => (
  <div className={`bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60 p-8 mb-8 ${className}`}>{children}</div>
);

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
}


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

const InfoTooltip = ({ text }) => (
  <span className="ml-1 inline-block align-middle group relative cursor-pointer">
    <svg className="w-3 h-3 text-gray-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#888">i</text>
    </svg>
    <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-44 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 shadow-lg">{text}</span>
  </span>
);

const ClientPerformancePage = () => {
  const { user } = useContext(AuthContext);
  const [desempeno, setDesempeno] = useState(null);
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
        // 2. Desempeño actual (de inscripción activa)
        const actual = await getDesempenoActual(idCliente);
        // El endpoint debe retornar el desempeño de la inscripción activa (si existe)
        // Puede ser objeto o array, adaptamos:
        let actualDesempeno = null;
        if (Array.isArray(actual)) {
          actualDesempeno = actual.length > 0 ? actual[0] : null;
        } else if (actual && typeof actual === 'object') {
          actualDesempeno = actual;
        }
        setDesempeno(actualDesempeno);
      } catch (err) {
        setError(
          typeof err === 'string' ? err : (err?.message || 'No se pudo cargar el desempeño.')
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  let mainContent;
  if (loading) {
    mainContent = <LoadingSpinner message="Cargando desempeño actual..." />;
  } else if (error) {
    mainContent = <Card className="text-center text-red-600">{error}</Card>;
  } else if (
    (desempeno && desempeno.tipoPlan && desempeno.tipoPlan.toUpperCase() === 'ESTANDAR') ||
    (!desempeno && !loading)
  ) {
    // Si el desempeño es null (no hay inscripción activa) o el tipo de plan es estándar, mostrar restricción
    mainContent = (
      <Card className="flex flex-col items-center justify-center py-12 text-center bg-gradient-to-br from-primary-50 to-white border-primary-200">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-700 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-primary-700">Acceso limitado a desempeño</h2>
        </div>
        <p className="text-lg text-primary-700 font-medium mb-2">Esta sección está disponible únicamente para clientes con un <span className="font-bold text-emerald-700">Plan Premium</span>.</p>
        <p className="text-base text-gray-700 mb-4">Tu plan actual no incluye el seguimiento personalizado de desempeño físico. Si deseas acceder a esta funcionalidad, consulta los beneficios y opciones de los planes Premium en recepción o con tu entrenador.</p>
        <div className="mt-6 flex flex-col items-center gap-2">
          <span className="inline-block bg-primary-100 text-primary-800 px-4 py-2 rounded-xl text-sm font-semibold shadow">¿Tienes dudas? ¡Estamos para ayudarte!</span>
          <span className="text-xs text-gray-500">Solicita más información sobre tu plan y cómo mejorar tu experiencia en el gimnasio.</span>
        </div>
      </Card>
    );
  } else {
    mainContent = (
      <>
        {/* Card principal de desempeño */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-7xl mx-auto mb-8">
            <Card className="bg-white/95 backdrop-blur-lg border border-gray-100 shadow-xl p-10 md:p-14">
              <div className="flex flex-col gap-8">
                {/* Cabecera refinada */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h2 className="text-2xl md:text-3xl font-bold text-primary-700">Mi Desempeño Actual</h2>
                  </div>
                  <div className="flex items-center gap-2 mt-1 md:mt-0">
                    <span className="text-xs text-gray-500">Última actualización:</span>
                    <span className="font-semibold text-sm text-primary-700">{desempeno?.fechaModificacion ? new Date(desempeno.fechaModificacion).toLocaleString() : '-'}</span>
                    <InfoTooltip text="Esta es la última vez que se actualizó tu desempeño físico." />
                  </div>
                </div>
                {/* Datos principales con gráfico IMC integrado */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
                  {/* Gráfico IMC con imagen sutil */}
                  <div className="flex flex-col items-center justify-center md:col-span-2">
                    <div className="relative flex flex-col items-center">
                      {(() => {
                        // Determinar color y estado textual del IMC
                        let imcColor = '#a3a3a3'; // gris por defecto
                        let imcText = 'text-gray-600';
                        let imcEstado = 'Desconocido';
                        let imcEstadoColor = 'text-gray-600';
                        const imc = Number(desempeno?.imc);
                        if (!isNaN(imc)) {
                          if (imc < 18.5) {
                            imcColor = '#3b82f6'; // blue-500 (bajo peso)
                            imcText = 'text-blue-600';
                            imcEstado = 'Bajo peso';
                            imcEstadoColor = 'text-blue-600';
                          } else if (imc >= 18.5 && imc < 25) {
                            imcColor = '#10b981'; // emerald-500 (normal)
                            imcText = 'text-emerald-600';
                            imcEstado = 'Normal';
                            imcEstadoColor = 'text-emerald-600';
                          } else if (imc >= 25 && imc < 30) {
                            imcColor = '#f59e42'; // amber-500 (sobrepeso)
                            imcText = 'text-amber-600';
                            imcEstado = 'Sobrepeso';
                            imcEstadoColor = 'text-amber-600';
                          } else if (imc >= 30) {
                            imcColor = '#ef4444'; // red-500 (obesidad)
                            imcText = 'text-red-600';
                            imcEstado = 'Obesidad';
                            imcEstadoColor = 'text-red-600';
                          }
                        }
                        return (
                          <>
                            <div className="flex flex-col items-center">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-primary-700 font-semibold tracking-wide">IMC</span>
                                <span className="ml-1"><InfoTooltip text="El Índice de Masa Corporal (IMC) es un indicador de la relación entre tu peso y tu estatura. Ayuda a identificar si tu peso es saludable." /></span>
                              </div>
                              <svg width="120" height="120" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="52" fill="#f8fafc" />
                                <circle
                                  cx="60" cy="60" r="52"
                                  fill="none"
                                  stroke={imcColor}
                                  strokeWidth="10"
                                  strokeDasharray={2 * Math.PI * 52}
                                  strokeDashoffset={2 * Math.PI * 52 * (1 - Math.min(imc / 40, 1))}
                                  strokeLinecap="round"
                                  style={{ transition: 'stroke-dashoffset 1s' }}
                                />
                                <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize="2em" fill={imcColor} fontWeight="bold">{desempeno.imc}</text>
                              </svg>
                              <span className={`mt-2 text-sm font-semibold ${imcEstadoColor}`}>{imcEstado}</span>
                            </div>
                            {/* Leyenda visual de rangos IMC */}
                            <div className="flex flex-row justify-center gap-2 mt-3 text-xs">
                              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{background:'#3b82f6'}}></span> <span>Bajo</span></div>
                              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{background:'#10b981'}}></span> <span>Normal</span></div>
                              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{background:'#f59e42'}}></span> <span>Sobrepeso</span></div>
                              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{background:'#ef4444'}}></span> <span>Obesidad</span></div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  {/* Datos principales con iconos más representativos */}
                  <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center bg-gradient-to-br from-primary-50 to-white rounded-2xl py-6 shadow-sm border border-primary-100 relative group">
                      <span className="absolute top-2 right-2"><InfoTooltip text="Tu peso actual en kilogramos." /></span>
                      <svg className="w-8 h-8 text-primary-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 21V7a2 2 0 012-2h8a2 2 0 012 2v14" /><circle cx="12" cy="17" r="2" /></svg>
                      <span className="text-xs text-primary-700">Peso</span>
                      <span className="font-bold text-2xl text-gray-900">{desempeno.peso} kg</span>
                    </div>
                    <div className="flex flex-col items-center bg-gradient-to-br from-primary-50 to-white rounded-2xl py-6 shadow-sm border border-primary-100 relative group">
                      <span className="absolute top-2 right-2"><InfoTooltip text="Tu estatura actual en centímetros." /></span>
                      <svg className="w-8 h-8 text-primary-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="8" y="4" width="8" height="16" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16" /></svg>
                      <span className="text-xs text-primary-700">Estatura</span>
                      <span className="font-bold text-2xl text-gray-900">{desempeno.estatura} cm</span>
                    </div>
                    <div className="flex flex-col items-center bg-gradient-to-br from-primary-50 to-white rounded-2xl py-6 shadow-sm border border-primary-100 relative group">
                      <span className="absolute top-2 right-2"><InfoTooltip text="Tu edad registrada." /></span>
                      <svg className="w-8 h-8 text-primary-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><text x="12" y="16" textAnchor="middle" fontSize="10" fill="#6366f1">{desempeno.edad}</text></svg>
                      <span className="text-xs text-primary-700">Edad</span>
                      <span className="font-bold text-2xl text-gray-900">{desempeno.edad}</span>
                    </div>
                  </div>
                </div>
                {/* Badges destacados de indicador y nivel físico */}
                <div className="flex flex-wrap gap-4 mt-2 justify-center">
                  <Badge color={getIndicadorColor(desempeno.indicador)} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /></svg>}>
                    <span className="font-semibold">Indicador:</span> {desempeno.indicador}
                  </Badge>
                  <Badge color={getNivelColor(desempeno.nivelFisico)} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}>
                    <span className="font-semibold">Nivel Físico:</span> {desempeno.nivelFisico || '-'}
                  </Badge>
                </div>
                {/* Información adicional con iconos y explicación */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="flex items-center gap-4 bg-white rounded-2xl px-6 py-5 shadow-sm border border-gray-100">
                    <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2l4-4" /></svg>
                    <div>
                      <div className="text-xs text-gray-500 font-semibold">Diagnóstico</div>
                      <div className="font-bold text-gray-800 text-lg">{desempeno.diagnostico || '-'}</div>
                      <div className="text-xs text-gray-400">Valoración general de tu estado físico.</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white rounded-2xl px-6 py-5 shadow-sm border border-gray-100">
                    <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2z" /></svg>
                    <div>
                      <div className="text-xs text-gray-500 font-semibold">Entrenador</div>
                      <div className="font-bold text-primary-700 text-lg">{desempeno.entrenadorNombre ? desempeno.entrenadorNombre : (desempeno.creadoPor || '-')}</div>
                      <div className="text-xs text-gray-400">Responsable de tu seguimiento.</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white rounded-2xl px-6 py-5 shadow-sm border border-gray-100">
                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                      <div className="text-xs text-gray-500 font-semibold">Fecha registro</div>
                      <div className="font-bold text-gray-800 text-lg">{desempeno.fechaCreacion ? new Date(desempeno.fechaCreacion).toLocaleString() : '-'}</div>
                      <div className="text-xs text-gray-400">Cuando se registró tu desempeño.</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white rounded-2xl px-6 py-5 shadow-sm border border-gray-100">
                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                      <div className="text-xs text-gray-500 font-semibold">Última actualización</div>
                      <div className="font-bold text-gray-800 text-lg">{desempeno.fechaModificacion ? new Date(desempeno.fechaModificacion).toLocaleString() : '-'}</div>
                      <div className="text-xs text-gray-400">Última vez que se modificó tu desempeño.</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
          {/* Consejos de Salud */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between min-h-[260px]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Consejos de Salud</h3>
                <p className="text-sm text-gray-500">Optimiza tu bienestar</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-emerald-50 rounded-xl border border-gray-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-emerald-800">Hidratación constante</p>
                  <p className="text-xs text-emerald-600">Bebe agua antes, durante y después del ejercicio</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-primary-50 rounded-xl border border-gray-100">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-primary-800">Calentamiento previo</p>
                  <p className="text-xs text-primary-600">Dedica 10-15 minutos a activar tus músculos</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Descanso adecuado</p>
                  <p className="text-xs text-gray-600">Permite recuperación entre entrenamientos intensos</p>
                </div>
              </div>
            </div>
          </div>
          {/* Metas Semanales */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between min-h-[260px]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Metas Semanales</h3>
                <p className="text-sm text-gray-500">Mantén el enfoque</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-sm">🎯</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-800">Consistencia</p>
                    <p className="text-xs text-primary-600">No faltes más de 1 día seguido</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-sm">💪</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-800">Intensidad</p>
                    <p className="text-xs text-emerald-600">Incrementa gradualmente la dificultad</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 font-bold text-sm">📈</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Progreso</p>
                    <p className="text-xs text-gray-600">Registra tus mejoras semanalmente</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Mi Desempeño
                  </h1>
                  <p className="text-sm text-gray-500">Seguimiento de tu progreso físico y estado actual</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/client/inscripciones/desempeno-historial')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              aria-label="Ir al historial de desempeños"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Ver historial</span>
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mainContent}
      </div>


    </div>
  );
}

export default ClientPerformancePage;

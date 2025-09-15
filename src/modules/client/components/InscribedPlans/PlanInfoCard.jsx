import React from 'react';

function getInitials(nombre, apellido) {
  return `${(nombre?.[0] || '').toUpperCase()}${(apellido?.[0] || '').toUpperCase()}`;
}

const PlanInfoCard = ({ plan }) => {
  try {
    if (!plan) return <div className="text-center text-[#d32f2f] font-bold">No hay información del plan.</div>;
    
    const estado = plan.estadoInscripcion || plan.estado || 'Activo';
    const tipoPlan = plan.tipoPlan || 'PREMIUM'; // Por defecto Premium para compatibilidad
    
    // Log defensivo para depuración
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log('PlanInfoCard plan:', plan);
    }

    // Función para renderizar entrenadores según el tipo de plan
    const renderEntrenadores = () => {
      if (tipoPlan === 'PREMIUM') {
        // Plan Premium: Un solo entrenador personalizado
        return (
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {getInitials(plan.entrenadorNombre, plan.entrenadorApellido)}
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-amber-800" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded-md">Personal</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900">{plan.entrenadorNombre} {plan.entrenadorApellido}</h4>
              <p className="text-sm text-gray-600">Tu entrenador dedicado</p>
            </div>
          </div>
        );
      } else {
        // Plan Estándar: Múltiples entrenadores
        const entrenadores = plan.entrenadores || [];
        return (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-600 flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Equipo de entrenadores ({entrenadores.length})</span>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {entrenadores.length > 0 ? entrenadores.map((entrenador) => (
                <div key={`${entrenador.nombre}-${entrenador.apellido}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {getInitials(entrenador.nombre, entrenador.apellido)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{entrenador.nombre} {entrenador.apellido}</p>
                    <p className="text-xs text-gray-500">Entrenador disponible</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-4">
                  <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 3a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <p className="text-sm text-gray-400">Sin entrenadores asignados</p>
                </div>
              )}
            </div>
          </div>
        );
      }
    };

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        {/* Plan Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {plan.nombrePlan}
              </h2>
              <div className="flex items-center space-x-3 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {tipoPlan}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                  {estado}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">Inicio:</span>
                  <span className="ml-2 font-semibold text-gray-900">{plan.fechaInicio}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">Fin:</span>
                  <span className="ml-2 font-semibold text-gray-900">{plan.fechaFin}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Entrenadores Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 3a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">
                  {tipoPlan === 'PREMIUM' ? 'Entrenador Personal' : 'Entrenadores Disponibles'}
                </h3>
              </div>
              
              {renderEntrenadores()}
            </div>

            {/* Schedule Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Frecuencia Semanal</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-700">
                      {Array.isArray(plan.horarios) && plan.horarios.length > 0
                        ? [...new Set(plan.horarios.map(h => h?.diaSemana || ''))].filter(Boolean).length
                        : 0}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Días por semana</p>
                    <p className="font-semibold text-gray-900">Entrenamiento programado</p>
                  </div>
                </div>
                
                {/* Días de la semana */}
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(plan.horarios) && plan.horarios.length > 0
                    ? [...new Set(plan.horarios.map(h => h?.diaSemana || ''))]
                        .filter(Boolean)
                        .sort((a, b) => {
                          const orden = { 'LUNES': 1, 'MARTES': 2, 'MIÉRCOLES': 3, 'JUEVES': 4, 'VIERNES': 5, 'SÁBADO': 6, 'DOMINGO': 7 };
                          return orden[a] - orden[b];
                        })
                        .map(dia => (
                          <span 
                            key={dia} 
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border border-primary-200 hover:from-primary-100 hover:to-primary-200 transition-colors"
                          >
                            {dia.slice(0, 3)}
                          </span>
                        ))
                    : <span className="text-sm text-gray-400 italic">No hay días asignados</span>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error en PlanInfoCard:', error);
    return <div className="text-center text-[#d32f2f] font-bold">Ocurrió un error al mostrar la información del plan.</div>;
  }
};

export default PlanInfoCard;

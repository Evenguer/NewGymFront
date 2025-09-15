import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import PropTypes from 'prop-types';

const locales = { 'es': es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const WeeklyAgenda = ({ events, minDate, maxDate, onNavigate, currentDate, legend, height = 800, showArrows }) => {
  const mesActual = format(currentDate, 'MMMM yyyy', { locale: es });
  const [view, setView] = React.useState('week'); // week | day | agenda
  const handleViewChange = (v) => setView(v);
  
  // Handler para react-big-calendar
  const handleCalendarViewChange = (newView) => {
    console.log('Vista de calendario cambiada a:', newView);
    // Mantener la vista sincronizada
    if (newView === 'week' || newView === 'day') {
      setView(newView);
    }
  };
  // Filtrar eventos del día actual para la vista de día
  const eventsToday = events.filter(ev => {
    const d = ev.start instanceof Date ? ev.start : new Date(ev.start);
    return d.toDateString() === currentDate.toDateString();
  });
  // Ordenar eventos por fecha para la vista agenda
  const sortedEvents = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));
  // Actualización automática de la agenda cada minuto
  React.useEffect(() => {
    if (view === 'week' || view === 'day') {
      const interval = setInterval(() => {
        // Forzar re-render para actualizar estados en tiempo real
        console.log('Actualizando agenda automáticamente');
      }, 60000); // 1 minuto
      return () => clearInterval(interval);
    }
  }, [view]);
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
      {/* Header limpio y moderno */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-4 flex-shrink-0">
        {/* Selector de vista simplificado */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => handleViewChange('week')} 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                view==='week' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Semana
            </button>
            <button 
              onClick={() => handleViewChange('day')} 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                view==='day' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Día
            </button>
            <button 
              onClick={() => handleViewChange('agenda')} 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                view==='agenda' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lista
            </button>
          </div>
          
          {/* Leyenda integrada */}
          <div className="flex items-center space-x-2">
            {legend}
          </div>
        </div>

        {/* Navegación y título para semana/día */}
        {(view === 'week' || view === 'day') && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {mesActual}
              </h3>
              {view === 'day' && (
                <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-lg">
                  {format(currentDate, `EEEE d 'de' MMMM`, { locale: es })}
                </span>
              )}
            </div>
            
            {/* Controles de navegación */}
            {showArrows && (
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => onNavigate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - (view==='week'?7:1)))}
                  disabled={format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd') <= format(minDate, 'yyyy-MM-dd')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => onNavigate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (view==='week'?7:1)))}
                  disabled={format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd') >= format(maxDate, 'yyyy-MM-dd')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {format(currentDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && (
                  <button
                    className="px-3 py-1.5 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    onClick={() => onNavigate(new Date())}
                  >
                    Hoy
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="flex-1">
        {/* Vista día: navegación adicional */}
        {view === 'day' && (
          <div className="flex items-center justify-center gap-3 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
            <button
              className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              onClick={() => onNavigate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1))}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium px-4 py-1.5 bg-white border border-gray-200 rounded-lg">
              {format(currentDate, `EEEE d 'de' MMMM yyyy`, { locale: es })}
            </span>
            <button
              className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              onClick={() => onNavigate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1))}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Renderizar calendarios o lista sin scroll duplicado */}
        {(view === 'week' || view === 'day') ? (
          <div className="p-4">
            <Calendar
              localizer={localizer}
              events={(view==='week' ? events : eventsToday).map(ev => ({
                ...ev,
                title: typeof ev.title === 'string' ? ev.title : (ev.title ? String(ev.title) : ''),
                start: ev.start instanceof Date ? ev.start : new Date(ev.start),
                end: ev.end instanceof Date ? ev.end : new Date(ev.end),
              }))}
              startAccessor="start"
              endAccessor="end"
              defaultView={view}
              view={view}
              views={['week','day']}
              onView={handleCalendarViewChange}
              toolbar={false}
              min={new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 7, 0)}
              max={new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 22, 0)}
              step={30}
              timeslots={1}
              style={{ 
                height: view === 'week' ? '900px' : '1000px',
                minHeight: view === 'week' ? '900px' : '1000px',
                width: '100%'
              }}
              messages={{
                week: 'Semana',
                day: 'Día',
                today: 'Hoy',
                previous: 'Anterior',
                next: 'Siguiente',
                date: 'Fecha',
                time: 'Hora',
                days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
                allDay: 'Todo el día',
              }}
              formats={{
                dayFormat: (date) => format(date, 'EEE d/M', { locale: es }),
                weekdayFormat: (date) => format(date, 'EEE d/M', { locale: es }),
                agendaDateFormat: (date) => format(date, 'EEE d/M', { locale: es }),
                agendaTimeFormat: (date) => format(date, 'HH:mm', { locale: es }),
              }}
              components={{
                event: ({ event }) => {
                  const now = new Date();
                  const start = event?.start instanceof Date ? event.start : new Date(event?.start);
                  const end = event?.end instanceof Date ? event.end : new Date(event?.end);
                  const isNext = now < end && now >= new Date(start.getTime() - 15 * 60000);
                  const isOngoing = now >= start && now < end;
                  return <EventBlock event={event} isNext={isNext} isOngoing={isOngoing} isDayView={view==='day'} />;
                },
              }}
              eventPropGetter={(event, start, end, isSelected) => {
                if (view === 'day') {
                  return {
                    className: 'w-full max-w-none',
                    style: { minWidth: '96%', maxWidth: '100%' }
                  };
                }
                return {};
              }}
              date={currentDate}
              onNavigate={onNavigate}
              scrollToTime={new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 8, 0)}
            />
          </div>
        ) : (
          // Vista de lista con scroll optimizado
          <div className="p-4">
            <div className="space-y-3 max-h-[900px] overflow-y-auto">
              {sortedEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay entrenamientos programados</h3>
                  <p className="text-gray-500">Tus próximos entrenamientos aparecerán aquí</p>
                </div>
              ) : (
                sortedEvents.map((event) => {
                  const now = new Date();
                  const start = event?.start instanceof Date ? event.start : new Date(event?.start);
                  const end = event?.end instanceof Date ? event.end : new Date(event?.end);
                  const isNext = now < end && now >= new Date(start.getTime() - 15 * 60000);
                  const isOngoing = now >= start && now < end;
                  const key = event.id || `${start.toISOString()}_${event?.planName || event?.title || ''}`;
                  return (
                    <EventBlock key={key} event={event} isNext={isNext} isOngoing={isOngoing} showDate={true} isListView={true} />
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Icono de estado
function getEstadoIcon(estado) {
  if (estado === 'asistio') return '✅';
  if (estado === 'no_asistio') return '❌';
  if (estado === 'por_asistir') return '⏳';
  return '';
}

// Cambia el color de fondo y borde según el estado, con gradiente para mejor visual
function getEventColor(event, gradient = false) {
  if (event.estado === 'asistio') return gradient ? 'bg-gradient-to-br from-[#e0f2f1] to-[#b2dfdb] border-[#388e3c] text-[#388e3c]' : 'bg-[#e0f2f1] border-[#388e3c] text-[#388e3c]';
  if (event.estado === 'no_asistio') return gradient ? 'bg-gradient-to-br from-[#ffebee] to-[#ffcdd2] border-[#d32f2f] text-[#d32f2f]' : 'bg-[#ffebee] border-[#d32f2f] text-[#d32f2f]';
  if (event.estado === 'por_asistir') return gradient ? 'bg-gradient-to-br from-[#fffde7] to-[#fff9c4] border-[#fbc02d] text-[#fbc02d]' : 'bg-[#fffde7] border-[#fbc02d] text-[#fbc02d]';
  return gradient ? 'bg-gradient-to-br from-[#f5f5f5] to-[#e0e0e0] border-[#bdbdbd] text-[#424242]' : 'bg-[#f5f5f5] border-[#bdbdbd] text-[#424242]';
}

// Fondo del icono de estado
function getEstadoBg(estado) {
  if (estado === 'asistio') return 'bg-[#c8e6c9]';
  if (estado === 'no_asistio') return 'bg-[#ffcdd2]';
  if (estado === 'por_asistir') return 'bg-[#fff9c4]';
  return 'bg-[#eeeeee]';
}

// Nuevo componente para el bloque de evento - rediseñado y mejorado
function EventBlock({ event, isNext, isOngoing, isDayView, showDate, isListView }) {
  const start = event?.start instanceof Date ? event.start : new Date(event?.start);
  const end = event?.end instanceof Date ? event.end : new Date(event?.end);
  const tipoPlan = event?.tipoPlan || 'PREMIUM';
  const esDiaCompleto = event?.esDiaCompleto || false;
  
  // Lógica de estados mejorada
  let estado = event?.estado || '';
  let estadoTexto = '';
  let horaAsistenciaTexto = '';
  
  if (esDiaCompleto) {
    estadoTexto = event?.textoEstado || 'ASISTIÓ';
    if (event?.horaAsistencia) {
      horaAsistenciaTexto = event.horaAsistencia;
    }
  } else if (tipoPlan === 'PREMIUM') {
    estadoTexto = event?.textoEstado || 'POR ASISTIR';
    if (event?.estado === 'asistio' && event?.horaAsistencia) {
      horaAsistenciaTexto = event.horaAsistencia;
    }
  } else {
    const now = new Date();
    if (!estado || estado === 'por_asistir' || estado === 'no_asistio') {
      if (now < start) {
        estado = 'por_asistir';
      } else if (now >= start && now < end) {
        estado = event?.estado === 'asistio' ? 'asistio' : 'por_asistir';
      } else if (now >= end) {
        estado = event?.estado === 'asistio' ? 'asistio' : 'no_asistio';
      }
    }
    
    if (estado === 'asistio') estadoTexto = 'Asistió';
    else if (estado === 'no_asistio') estadoTexto = 'No asistió';
    else estadoTexto = 'Por asistir';
  }

  // Colores y estilos según estado
  const getStatusStyles = (estado) => {
    switch (estado) {
      case 'asistio':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-800',
          badge: 'bg-emerald-500 text-white',
          icon: '✓'
        };
      case 'no_asistio':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          badge: 'bg-red-500 text-white',
          icon: '✗'
        };
      case 'por_asistir':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
          badge: 'bg-amber-500 text-white',
          icon: '⏱'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          badge: 'bg-gray-500 text-white',
          icon: '◯'
        };
    }
  };

  const styles = getStatusStyles(estado);
  
  // Tooltip mejorado
  let tooltip;
  if (esDiaCompleto) {
    tooltip = `${event?.planName || event?.title || ''} - ${estadoTexto}${horaAsistenciaTexto ? ` (${horaAsistenciaTexto})` : ''} - Día completo - ${event?.entrenador || 'N/A'}`;
  } else {
    tooltip = `${event?.planName || event?.title || ''} - ${estadoTexto}${horaAsistenciaTexto ? ` (${horaAsistenciaTexto})` : ''} - ${format(start, 'HH:mm')} a ${format(end, 'HH:mm')} - ${event?.entrenador || 'N/A'}`;
  }

  // Vista de lista (agenda)
  if (isListView) {
    return (
      <div 
        className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${styles.bg} ${styles.border} ${isNext ? 'ring-2 ring-primary-400 ring-opacity-50' : ''}`}
        title={tooltip}
      >
        {/* Indicador de siguiente/en curso */}
        {(isNext || isOngoing) && (
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${isOngoing ? 'bg-emerald-100 text-emerald-800' : 'bg-primary-100 text-primary-800'}`}>
              {isOngoing ? '🔴 En curso' : '⏰ Próximo'}
            </span>
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Icono de estado */}
            <div className={`w-10 h-10 rounded-full ${styles.badge} flex items-center justify-center text-lg font-bold`}>
              {styles.icon}
            </div>
            
            <div>
              <h4 className={`font-semibold ${styles.text}`}>
                {event?.planName || event?.title || 'Entrenamiento'}
              </h4>
              <p className="text-sm text-gray-600">
                {format(start, `EEEE d 'de' MMMM`, { locale: es })}
              </p>
            </div>
          </div>
          
          {/* Badge de estado */}
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles.badge}`}>
            {estadoTexto}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {/* Información de horario */}
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600">
              {esDiaCompleto ? 'Día completo' : `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`}
            </span>
          </div>

          {/* Información del entrenador */}
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-gray-600">
              {event?.entrenador || 'Entrenador asignado'}
            </span>
          </div>

          {/* Hora de asistencia si existe */}
          {horaAsistenciaTexto && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-emerald-600 font-medium">
                Asistió a las {horaAsistenciaTexto}
              </span>
            </div>
          )}

          {/* Tipo de plan */}
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="text-gray-600">
              Plan {tipoPlan.charAt(0) + tipoPlan.slice(1).toLowerCase()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Vista de calendario (semana/día)
  const extraWidth = isDayView ? 'w-full max-w-none min-w-[96%]' : '';
  const heightStyle = esDiaCompleto ? 'min-h-[80px]' : 'min-h-[60px]';

  return (
    <div
      className={`relative ${heightStyle} rounded-lg border-2 p-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${styles.bg} ${styles.border} ${extraWidth} ${isNext ? 'ring-2 ring-primary-400 ring-opacity-50 animate-pulse' : ''}`}
      title={tooltip}
      style={{ 
        minHeight: esDiaCompleto ? '80px' : '60px',
        height: '100%',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        maxWidth: '100%'
      }}
    >
      {/* Indicador especial para día completo */}
      {esDiaCompleto && (
        <div className="absolute top-1 right-1 bg-white rounded-full px-2 py-1 text-xs font-bold text-primary-600 shadow-sm border border-primary-200">
          DÍA
        </div>
      )}

      {/* Indicador de en curso */}
      {isOngoing && (
        <div className="absolute top-1 left-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
      )}

      <div className="flex flex-col items-center justify-center h-full space-y-1">
        {/* Icono de estado principal */}
        <div className={`w-8 h-8 rounded-full ${styles.badge} flex items-center justify-center text-sm font-bold shadow-sm`}>
          {styles.icon}
        </div>

        {/* Estado y hora para bloques de día completo */}
        {esDiaCompleto ? (
          <div className="text-center">
            <div className={`px-2 py-1 text-xs font-semibold rounded ${styles.badge}`}>
              {estadoTexto}
            </div>
            {horaAsistenciaTexto && (
              <div className="text-xs text-gray-600 mt-1">
                {horaAsistenciaTexto}
              </div>
            )}
          </div>
        ) : (
          /* Información para bloques individuales */
          <div className="text-center space-y-1">
            {/* Estado para Premium */}
            {tipoPlan === 'PREMIUM' && (
              <div className={`px-2 py-1 text-xs font-semibold rounded ${styles.badge}`}>
                {estadoTexto}
              </div>
            )}

            {/* Horario */}
            <div className="text-xs bg-white border border-gray-200 rounded px-2 py-1 text-gray-700 font-medium">
              {format(start, 'HH:mm')}-{format(end, 'HH:mm')}
            </div>

            {/* Entrenador para estándar */}
            {tipoPlan === 'ESTANDAR' && event?.entrenador && (
              <div className="text-xs bg-primary-50 border border-primary-200 rounded px-2 py-1 text-primary-700 font-medium truncate max-w-full">
                {event.entrenador.split(' ').slice(0, 2).join(' ')}
              </div>
            )}

            {/* Hora de asistencia */}
            {horaAsistenciaTexto && (
              <div className="text-xs bg-emerald-50 border border-emerald-200 rounded px-2 py-1 text-emerald-700 font-medium">
                {horaAsistenciaTexto}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

WeeklyAgenda.propTypes = {
  events: PropTypes.array.isRequired,
  minDate: PropTypes.instanceOf(Date).isRequired,
  maxDate: PropTypes.instanceOf(Date).isRequired,
  onNavigate: PropTypes.func.isRequired,
  currentDate: PropTypes.instanceOf(Date).isRequired,
  legend: PropTypes.node,
  height: PropTypes.number,
  showArrows: PropTypes.bool,
};

export default WeeklyAgenda;

// Animación pulse lenta para el próximo evento
// .animate-pulse-slow {
//   animation: pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
// }
// @keyframes pulse {
//   0%, 100% { opacity: 1; }
//   50% { opacity: 0.7; }
// }

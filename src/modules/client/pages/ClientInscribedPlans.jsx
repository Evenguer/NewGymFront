import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlanInfoCard from '../components/InscribedPlans/PlanInfoCard';
import WeeklyAgenda from '../components/InscribedPlans/WeeklyAgenda';
import AttendanceLegend from '../components/InscribedPlans/AttendanceLegend';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { addDays, startOfWeek, endOfWeek, isBefore, isAfter, isSameDay, parseISO } from 'date-fns';
import { getInscribedPlans } from '../services/clientAPI';
import { useAuth } from '../../../shared/hooks/useAuth';
import { ENDPOINTS } from '../../../shared/services/endpoints';
import axios from 'axios';

const ClientInscribedPlans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // NUEVO: Sistema de actualización automática de estados Premium
  useEffect(() => {
    // Actualizar estados cada minuto para planes Premium
    const interval = setInterval(() => {
      // Forzar re-render actualizando currentDate
      setCurrentDate(new Date());
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, []);

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
        return getInscribedPlans(idCliente);
      })
      .then(data => {
        // Filtrar solo planes activos (no cancelados ni finalizados)
        const planesActivos = Array.isArray(data) ? data.filter(plan => {
          const estado = plan.estadoInscripcion || plan.estado || 'ACTIVO';
          return estado === 'ACTIVO';
        }) : [];
        
        setPlans(planesActivos);
      })
      .catch((err) => {
        console.error('Error cargando planes:', err);
        setError('No se pudieron cargar los planes. Por favor, intenta nuevamente.');
      })
      .finally(() => setLoading(false));
  }, [user]);

  // NUEVA FUNCIÓN: Determinar estado de asistencia para PREMIUM
  const determinarEstadoAsistenciaPremium = (fecha, horario, asistencias) => {
    const fechaBloque = parseISO(fecha.toISOString().split('T')[0]);
    const asistencia = asistencias.find(a => isSameDay(parseISO(a.fecha), fechaBloque));
    
    // Si hay asistencia registrada (QR marcado)
    if (asistencia?.estado) {
      return {
        estado: 'asistio',
        horaAsistencia: asistencia.horaAsistencia,
        textoEstado: 'ASISTIÓ',
        colorEstado: 'bg-emerald-500'
      };
    }
    
    // Verificar si el bloque ya pasó sin asistencia (marcado automático)
    const ahora = new Date();
    let horaFinStr = horario.horaFin;
    
    // Manejar diferentes formatos de hora
    if (typeof horaFinStr !== 'string') {
      if (horaFinStr.hour !== undefined) {
        horaFinStr = `${horaFinStr.hour}:${horaFinStr.minute.toString().padStart(2, '0')}:00`;
      } else {
        horaFinStr = horaFinStr.toString();
      }
    }
    
    const [hFin, mFin] = horaFinStr.split(':');
    const finBloque = new Date(fecha);
    finBloque.setHours(Number(hFin), Number(mFin), 0, 0);
    
    if (ahora > finBloque) {
      return {
        estado: 'no_asistio',
        horaAsistencia: null,
        textoEstado: 'NO ASISTIÓ',
        colorEstado: 'bg-red-500'
      };
    }
    
    // Estado por defecto (antes de que termine el bloque)
    return {
      estado: 'por_asistir',
      horaAsistencia: null,
      textoEstado: 'POR ASISTIR',
      colorEstado: 'bg-amber-500'
    };
  };

  // NUEVA FUNCIÓN: Detectar entrenador correspondiente para Plan Estándar
  const detectarEntrenadorPorHora = (horaAsistencia, entrenadores, fecha, diasMap, i) => {
    if (!horaAsistencia || !entrenadores) return null;
    
    // Convertir hora de asistencia a minutos para comparación
    const [horaAsist, minAsist] = horaAsistencia.split(':').map(Number);
    const minutosAsistencia = horaAsist * 60 + minAsist;
    
    for (const entrenador of entrenadores) {
      const horariosDelDia = (entrenador.horarios || []).filter(h => {
        const diaNumero = diasMap[h.diaSemana];
        return diaNumero === i + 1;
      });
      
      for (const horario of horariosDelDia) {
        try {
          // Parsear horario del entrenador
          let horaInicioStr, horaFinStr;
          
          if (typeof horario.horaInicio === 'string') {
            horaInicioStr = horario.horaInicio;
          } else if (horario.horaInicio.hour !== undefined) {
            horaInicioStr = `${horario.horaInicio.hour}:${horario.horaInicio.minute.toString().padStart(2, '0')}`;
          } else {
            horaInicioStr = horario.horaInicio.toString();
          }
          
          if (typeof horario.horaFin === 'string') {
            horaFinStr = horario.horaFin;
          } else if (horario.horaFin.hour !== undefined) {
            horaFinStr = `${horario.horaFin.hour}:${horario.horaFin.minute.toString().padStart(2, '0')}`;
          } else {
            horaFinStr = horario.horaFin.toString();
          }
          
          const [hIni, mIni] = horaInicioStr.split(':').map(Number);
          const [hFin, mFin] = horaFinStr.split(':').map(Number);
          const minutosInicio = hIni * 60 + mIni;
          const minutosFin = hFin * 60 + mFin;
          
          // Verificar si la asistencia está dentro del horario del entrenador
          if (minutosAsistencia >= minutosInicio && minutosAsistencia <= minutosFin) {
            return `${entrenador.nombre} ${entrenador.apellido}`;
          }
        } catch (error) {
          console.error('Error detectando entrenador:', error);
        }
      }
    }
    return null;
  };

  // Generar eventos para el calendario a partir del plan y asistencias
  function getEvents(plan, weekStart, weekEnd) {
    if (!plan) return [];
    
    const asistencias = plan.asistencias || [];
    const events = [];
    const tipoPlan = plan.tipoPlan || 'PREMIUM';
    
    // DEBUG: Mostrar TODAS las asistencias del plan
    console.log(`📊 TODAS LAS ASISTENCIAS DEL PLAN:`, asistencias);
    console.log(`📊 Total de registros de asistencia:`, asistencias.length);
    
    // Mapear nombre de día a número (lunes=1, ..., sábado=6)
    // Incluye versiones con y sin acentos para compatibilidad con backend
    const diasMap = {
      'LUNES': 1, 'MARTES': 2, 'MIERCOLES': 3, 'MIÉRCOLES': 3, 'JUEVES': 4, 'VIERNES': 5, 'SABADO': 6, 'SÁBADO': 6, 'DOMINGO': 7
    };

    // Para cada día visible en la semana
    for (let i = 0; i < 7; i++) { // Lunes a Domingo
      const fecha = addDays(weekStart, i);
      if (isBefore(fecha, parseISO(plan.fechaInicio)) || isAfter(fecha, parseISO(plan.fechaFin))) continue;
      
      // NUEVA LÓGICA: Verificar si hay asistencia registrada para este día
      // BUSCAR ESPECÍFICAMENTE EL REGISTRO CON ESTADO TRUE (asistencia válida)
      const asistenciaDelDia = asistencias.find(a => 
        isSameDay(parseISO(a.fecha), fecha) && a.estado === true
      );
      
      // Si no encontramos una asistencia válida, buscar cualquier registro para debugging
      const cualquierAsistencia = asistencias.find(a => isSameDay(parseISO(a.fecha), fecha));
      
      // DEBUG: Verificar datos de asistencia
      if (cualquierAsistencia) {
        console.log(`� Fecha: ${fecha.toDateString()}`);
        console.log(`� Registros encontrados para esta fecha:`, asistencias.filter(a => isSameDay(parseISO(a.fecha), fecha)));
        console.log(`✅ Asistencia VÁLIDA encontrada:`, asistenciaDelDia);
        console.log(`� Tipo Plan:`, tipoPlan);
      }
      
      // CASO 1: HAY ASISTENCIA VÁLIDA - Crear BLOQUE DE DÍA COMPLETO  
      if (asistenciaDelDia) {
        console.log(`🟢 CASO 1: Creando bloque expandido para asistencia VÁLIDA registrada`);
        console.log(`🟢 Asistencia completa:`, JSON.stringify(asistenciaDelDia, null, 2));
        
        let tituloAsistencia;
        let entrenadorDetectado = null;
        
        // Obtener la hora de asistencia de cualquier campo disponible
        const horaRegistrada = asistenciaDelDia.horaAsistencia || asistenciaDelDia.horaAsistio || asistenciaDelDia.hora;
        
        if (tipoPlan === 'ESTANDAR' && horaRegistrada) {
          // Detectar entrenador correspondiente para Plan Estándar
          entrenadorDetectado = detectarEntrenadorPorHora(
            horaRegistrada, 
            plan.entrenadores, 
            fecha, 
            diasMap, 
            i
          );
          
          if (entrenadorDetectado) {
            tituloAsistencia = `Marcó su asistencia en el horario de ${entrenadorDetectado}`;
          } else {
            tituloAsistencia = 'ASISTIÓ';
          }
        } else {
          // Plan Premium o sin hora: Texto simple
          tituloAsistencia = 'Asistió';
        }
        
        // Crear bloque de día completo (7:00 AM - 10:00 PM)
        const start = new Date(fecha);
        start.setHours(7, 0, 0, 0);
        const end = new Date(fecha);
        end.setHours(22, 0, 0, 0);
        
        events.push({
          title: tituloAsistencia,
          start,
          end,
          estado: 'asistio',
          textoEstado: 'ASISTIÓ',
          ...(horaRegistrada && { horaAsistencia: horaRegistrada }), // Solo incluir si hay hora
          colorEstado: 'bg-emerald-500',
          tipoSesion: plan.nombrePlan,
          entrenador: entrenadorDetectado || (tipoPlan === 'PREMIUM' ? `${plan.entrenadorNombre} ${plan.entrenadorApellido}` : 'Múltiples entrenadores'),
          tipoPlan: tipoPlan,
          esDiaCompleto: true // Nueva propiedad para identificar bloques de día completo
        });
        
        console.log(`✅ Bloque expandido creado y saltando al siguiente día`);
        continue; // No crear bloques individuales si ya asistió
      }
      
      console.log(`🔄 CASO 2: No hay asistencia VÁLIDA (estado=true), procesando bloques individuales para ${tipoPlan}`);
      console.log(`ℹ️  Asistencia válida encontrada: ${asistenciaDelDia ? 'SÍ' : 'NO'}`);
      
      // CASO 2: NO HAY ASISTENCIA - Verificar si debe crear bloque expandido "NO ASISTIÓ" o bloques individuales

      if (tipoPlan === 'PREMIUM') {
        // LÓGICA PREMIUM: Horarios específicos del entrenador asignado
        const horariosDelDia = (plan.horarios || []).filter(h => diasMap[h.diaSemana] === i + 1);
        let todosBloquesPasaron = false;
        let hayBloques = horariosDelDia.length > 0;
        if (hayBloques) {
          const ahora = new Date();
          todosBloquesPasaron = horariosDelDia.every(horario => {
            try {
              let horaFinStr;
              if (typeof horario.horaFin === 'string') {
                horaFinStr = horario.horaFin;
              } else if (horario.horaFin.hour !== undefined) {
                horaFinStr = `${horario.horaFin.hour}:${horario.horaFin.minute.toString().padStart(2, '0')}`;
              } else {
                horaFinStr = horario.horaFin.toString();
              }
              const [hFin, mFin] = horaFinStr.split(':');
              const finBloque = new Date(fecha);
              finBloque.setHours(Number(hFin), Number(mFin), 0, 0);
              return ahora > finBloque;
            } catch (error) {
              console.error('Error verificando horario pasado:', error);
              return false;
            }
          });
        }
        // CASO 2A: TODOS LOS BLOQUES PASARON SIN ASISTENCIA - Crear BLOQUE EXPANDIDO "NO ASISTIÓ"
        // Para PREMIUM: apenas termina el último turno del día y no hay asistencia
        const hayAsistencia = false; // ya se validó arriba que no hay asistencia válida
        let finUltimoTurno = null;
        if (hayBloques) {
          // Buscar la hora de fin más tarde del día
          finUltimoTurno = horariosDelDia.reduce((max, horario) => {
            let horaFinStr;
            if (typeof horario.horaFin === 'string') {
              horaFinStr = horario.horaFin;
            } else if (horario.horaFin.hour !== undefined) {
              horaFinStr = `${horario.horaFin.hour}:${horario.horaFin.minute.toString().padStart(2, '0')}`;
            } else {
              horaFinStr = horario.horaFin.toString();
            }
            const [hFin, mFin] = horaFinStr.split(':');
            const finBloque = new Date(fecha);
            finBloque.setHours(Number(hFin), Number(mFin), 0, 0);
            return !max || finBloque > max ? finBloque : max;
          }, null);
        }
        const ahora = new Date();
        if (todosBloquesPasaron && hayBloques && (!asistenciaDelDia) && finUltimoTurno && ahora > finUltimoTurno) {
          // Crear bloque de día completo (7:00 AM - 10:00 PM) igual que "ASISTIÓ"
          const start = new Date(fecha);
          start.setHours(7, 0, 0, 0);
          const end = new Date(fecha);
          end.setHours(22, 0, 0, 0);
          events.push({
            title: 'No asistió',
            start,
            end,
            estado: 'no_asistio',
            textoEstado: 'NO ASISTIÓ',
            horaAsistencia: null,
            colorEstado: 'bg-red-500',
            tipoSesion: plan.nombrePlan,
            entrenador: `${plan.entrenadorNombre} ${plan.entrenadorApellido}`,
            tipoPlan: 'PREMIUM',
            esDiaCompleto: true // Bloque expandido igual que "ASISTIÓ"
          });
          // Saltar a siguiente día, no crear bloques individuales
          continue;
        }
        
        // CASO 2B: AÚN HAY BLOQUES PENDIENTES - Crear bloques individuales (lógica actual)
        horariosDelDia.forEach(horario => {
          try {
            // Manejar diferentes formatos de hora
            let horaInicioStr, horaFinStr;
            
            if (typeof horario.horaInicio === 'string') {
              horaInicioStr = horario.horaInicio;
            } else if (horario.horaInicio.hour !== undefined) {
              horaInicioStr = `${horario.horaInicio.hour}:${horario.horaInicio.minute.toString().padStart(2, '0')}`;
            } else {
              horaInicioStr = horario.horaInicio.toString();
            }
            
            if (typeof horario.horaFin === 'string') {
              horaFinStr = horario.horaFin;
            } else if (horario.horaFin.hour !== undefined) {
              horaFinStr = `${horario.horaFin.hour}:${horario.horaFin.minute.toString().padStart(2, '0')}`;
            } else {
              horaFinStr = horario.horaFin.toString();
            }

            const [hIni, mIni] = horaInicioStr.split(':');
            const [hFin, mFin] = horaFinStr.split(':');
            const start = new Date(fecha);
            start.setHours(Number(hIni), Number(mIni), 0, 0);
            const end = new Date(fecha);
            end.setHours(Number(hFin), Number(mFin), 0, 0);

            // LÓGICA EXISTENTE: Determinar estado de asistencia Premium
            const estadoInfo = determinarEstadoAsistenciaPremium(fecha, { horaFin: horaFinStr }, asistencias);

            events.push({
              title: horario.tipoSesion || plan.nombrePlan,
              start,
              end,
              estado: estadoInfo.estado,
              textoEstado: estadoInfo.textoEstado,
              horaAsistencia: estadoInfo.horaAsistencia,
              colorEstado: estadoInfo.colorEstado,
              tipoSesion: horario.tipoSesion || plan.nombrePlan,
              entrenador: `${plan.entrenadorNombre} ${plan.entrenadorApellido}`,
              tipoPlan: 'PREMIUM',
              esDiaCompleto: false // Bloque individual
            });
          } catch (error) {
            console.error('Error procesando horario Premium:', horario, error);
          }
        });
        
      } else if (tipoPlan === 'ESTANDAR') {
        // LÓGICA ESTÁNDAR: Obtener horarios de TODOS los entrenadores
        const entrenadores = plan.entrenadores || [];
        // Recopilar TODOS los horarios del día de TODOS los entrenadores
        let todosBloquesPasaron = false;
        let hayBloques = false;
        let hayAsistencia = false;
        if (entrenadores.length > 0) {
          const ahora = new Date();
          const todosLosHorariosDelDia = [];
          entrenadores.forEach(entrenador => {
            const horariosEntrenador = entrenador.horarios || [];
            const horariosDelDia = horariosEntrenador.filter(h => {
              const diaNumero = diasMap[h.diaSemana];
              return diaNumero === i + 1;
            });
            todosLosHorariosDelDia.push(...horariosDelDia);
          });
          hayBloques = todosLosHorariosDelDia.length > 0;
          if (hayBloques) {
            todosBloquesPasaron = todosLosHorariosDelDia.every(horario => {
              try {
                let horaFinStr;
                if (typeof horario.horaFin === 'string') {
                  horaFinStr = horario.horaFin;
                } else if (horario.horaFin.hour !== undefined) {
                  horaFinStr = `${horario.horaFin.hour}:${horario.horaFin.minute.toString().padStart(2, '0')}`;
                } else {
                  horaFinStr = horario.horaFin.toString();
                }
                const [hFin, mFin] = horaFinStr.split(':');
                const finBloque = new Date(fecha);
                finBloque.setHours(Number(hFin), Number(mFin), 0, 0);
                return ahora > finBloque;
              } catch (error) {
                console.error('Error verificando horario estándar pasado:', error);
                return false;
              }
            });
          }
          // Buscar si hay algún evento de asistencia en el día (estado === 'asistio')
          hayAsistencia = asistencias.some(a => isSameDay(parseISO(a.fecha), fecha) && a.estado === true);
        }
        // CASO 2A: TODOS LOS BLOQUES DE TODOS LOS ENTRENADORES PASARON SIN ASISTENCIA - Crear BLOQUE EXPANDIDO "NO ASISTIÓ"
        // Solo marcar como "no asistió" si ya pasó el final del día (22:00) y NO hay asistencia
        const ahoraStd = new Date();
        const finDiaStd = new Date(fecha);
        finDiaStd.setHours(22, 0, 0, 0);
        if (todosBloquesPasaron && hayBloques && !hayAsistencia && ahoraStd > finDiaStd) {
          // Crear bloque de día completo (7:00 AM - 10:00 PM) igual que "ASISTIÓ"
          const start = new Date(fecha);
          start.setHours(7, 0, 0, 0);
          const end = new Date(fecha);
          end.setHours(22, 0, 0, 0);
          events.push({
            title: 'No asistió',
            start,
            end,
            estado: 'no_asistio',
            textoEstado: 'NO ASISTIÓ',
            horaAsistencia: null,
            colorEstado: 'bg-red-500',
            tipoSesion: plan.nombrePlan,
            entrenador: 'Múltiples entrenadores',
            tipoPlan: 'ESTANDAR',
            esDiaCompleto: true // Bloque expandido igual que "ASISTIÓ"
          });
          // Saltar a siguiente día, no crear bloques individuales
          continue;
        }
        
        // CASO 2B: AÚN HAY BLOQUES PENDIENTES - Crear bloques individuales (lógica actual)
        // Verificar si asistió ese día (para lógica de fallback en bloques individuales)
        const asistencia = asistencias.find(a => isSameDay(parseISO(a.fecha), fecha));
        let estadoDia = 'por_asistir';
        
        if (asistencia) {
          estadoDia = asistencia.estado ? 'asistio' : 'no_asistio';
        } else if (isBefore(fecha, new Date())) {
          estadoDia = 'no_asistio';
        }

        // Procesar CADA entrenador y CADA horario
        entrenadores.forEach((entrenador, entrenadorIndex) => {
          const horariosEntrenador = entrenador.horarios || [];
          
          // Filtrar horarios del día actual
          const horariosDelDia = horariosEntrenador.filter(h => {
            const diaNumero = diasMap[h.diaSemana];
            return diaNumero === i + 1;
          });
          
          horariosDelDia.forEach(horario => {
            try {
              // Manejar diferentes formatos de hora para LocalTime del backend
              let horaInicioStr, horaFinStr;
              
              if (typeof horario.horaInicio === 'string') {
                horaInicioStr = horario.horaInicio;
              } else if (horario.horaInicio.hour !== undefined) {
                horaInicioStr = `${horario.horaInicio.hour}:${horario.horaInicio.minute.toString().padStart(2, '0')}`;
              } else {
                horaInicioStr = horario.horaInicio.toString();
              }
              
              if (typeof horario.horaFin === 'string') {
                horaFinStr = horario.horaFin;
              } else if (horario.horaFin.hour !== undefined) {
                horaFinStr = `${horario.horaFin.hour}:${horario.horaFin.minute.toString().padStart(2, '0')}`;
              } else {
                horaFinStr = horario.horaFin.toString();
              }
              
              const [hIni, mIni] = horaInicioStr.split(':');
              const [hFin, mFin] = horaFinStr.split(':');
              const start = new Date(fecha);
              start.setHours(Number(hIni), Number(mIni), 0, 0);
              const end = new Date(fecha);
              end.setHours(Number(hFin), Number(mFin), 0, 0);

              const entrenadorNombre = `${entrenador.nombre} ${entrenador.apellido}`;

              const evento = {
                title: `${plan.nombrePlan} - ${entrenadorNombre}`,
                start,
                end,
                estado: estadoDia,
                tipoSesion: plan.nombrePlan,
                entrenador: entrenadorNombre,
                tipoPlan: 'ESTANDAR',
                horaAsistencia: asistencia?.estado ? asistencia.horaAsistencia : null,
                esDiaCompleto: false // Bloque individual
              };
              
              console.log('Agregando evento estándar:', evento);
              events.push(evento);
            } catch (error) {
              console.error('Error procesando horario Estándar:', horario, error);
            }
          });
        });
      }
    }
    
    return events;
  }

  if (loading) return <LoadingSpinner message="Cargando tus planes activos..." />;
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

  // Caso sin plan activo
  if (!plans.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-8 space-y-6">
            {/* Ilustración */}
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
              <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            
            {/* Mensaje principal */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">¡Comienza tu transformación!</h3>
              <p className="text-gray-600">No tienes planes activos. Para inscribirte, acércate a recepción en el gimnasio.</p>
            </div>

            {/* Instrucciones simplificadas */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-200">
              <h4 className="text-sm font-bold text-primary-800 mb-3">¿Cómo inscribirte?</h4>
              <div className="space-y-2 text-left text-sm text-primary-700">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span>Visita recepción</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span>Consulta planes disponibles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span>¡Comienza a entrenar!</span>
                </div>
              </div>
            </div>
            
            {/* Beneficios reducidos */}
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">Entrenadores certificados</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">Horarios flexibles</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">Seguimiento personalizado</span>
              </div>
            </div>
            
            {/* Botón de acción */}
            <div className="pt-4">
              <button 
                onClick={() => navigate('/client/inscripciones/planes-anteriores')}
                className="w-full bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Ver Historial</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Static Header - Fixed at top without interfering with scroll */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Mis Entrenamientos
                  </h1>
                  <p className="text-sm text-gray-500">Planes activos y seguimiento</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/client/inscripciones/planes-anteriores')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Historial</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Plan Info Card */}
        <div className="mb-6">
          <PlanInfoCard plan={plans[0]} />
        </div>

        {/* Progress Section - Clean & Enhanced */}
        <div className="mb-8">
          {plans.map((plan) => {
            // Calcular datos básicos para la barra de progreso
            const planStart = parseISO(plan.fechaInicio);
            const planEnd = parseISO(plan.fechaFin);
            const totalDays = Math.ceil((planEnd - planStart) / (1000 * 60 * 60 * 24)) + 1;
            const currentDay = Math.ceil((new Date() - planStart) / (1000 * 60 * 60 * 24)) + 1;
            const progressPercentage = Math.min(Math.max((currentDay / totalDays) * 100, 0), 100);
            const remainingDays = Math.max(Math.ceil((planEnd - new Date()) / (1000 * 60 * 60 * 24)), 0);
            const totalWeeks = Math.ceil(totalDays / 7);
            const currentWeek = Math.ceil(currentDay / 7);
            
            return (
              <div key={`progress-${plan.fechaInicio}`} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                {/* Header con información contextual */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Progreso del Plan</h3>
                      <p className="text-sm text-gray-500">Semana {Math.min(currentWeek, totalWeeks)} de {totalWeeks} • Día {Math.min(currentDay, totalDays)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                      {Math.round(progressPercentage)}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {remainingDays > 0 ? `${remainingDays} días restantes` : 'Plan completado'}
                    </div>
                  </div>
                </div>
                
                {/* Barra de progreso simple y limpia */}
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-primary-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Información del plan más clara y práctica */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Fechas del plan */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {planStart.toLocaleDateString()} - {planEnd.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">Duración del plan</p>
                    </div>
                  </div>
                  
                  {/* Información del entrenador */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {plan.tipoPlan === 'PREMIUM' 
                          ? `${plan.entrenadorNombre || 'Entrenador'} ${plan.entrenadorApellido || 'Asignado'}`
                          : `${totalDays} días totales`
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        {plan.tipoPlan === 'PREMIUM' ? 'Entrenador personal' : 'Duración total'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Training Schedule Section */}
        <div className="space-y-6">
          {plans.map((plan) => {
            // Calcular datos del plan
            const planStart = parseISO(plan.fechaInicio);
            const planEnd = parseISO(plan.fechaFin);
            const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
            const minDate = planStart;
            const maxDate = planEnd;
            const events = getEvents(plan, weekStart, weekEnd);
            
            console.log(`Eventos generados para ${plan.nombrePlan}:`, events);
            console.log(`Total de eventos en la agenda:`, events.length);
            
            const handleNavigate = (date) => {
              if (isBefore(date, minDate)) setCurrentDate(minDate);
              else if (isAfter(date, maxDate)) setCurrentDate(maxDate);
              else setCurrentDate(date);
            };

            // Estadísticas del plan

            // Nueva lógica para días perdidos: solo cuenta como perdido si no hay asistencia y todos los turnos/horarios han finalizado
            const agruparPorFecha = (arr) => {
              const map = {};
              arr.forEach(e => {
                const fecha = e.start.toDateString();
                if (!map[fecha]) map[fecha] = [];
                map[fecha].push(e);
              });
              return map;
            };

            const eventosPorFecha = agruparPorFecha(events);
            let diasPerdidos = 0;
            let diasAsistidos = 0;
            let diasPendientes = 0;
            Object.entries(eventosPorFecha).forEach(([fecha, eventosDia]) => {
              const hayAsistencia = eventosDia.some(e => e.estado === 'asistio');
              const todosFinalizados = eventosDia.every(e => {
                // Si el evento es de tipo individual, verificar si el bloque ya pasó
                if (!e.esDiaCompleto) {
                  return new Date() > e.end;
                }
                // Si es bloque expandido, considerar como finalizado si no es 'por_asistir'
                return e.estado !== 'por_asistir';
              });
              if (hayAsistencia) {
                diasAsistidos++;
              } else if (todosFinalizados) {
                diasPerdidos++;
              } else {
                diasPendientes++;
              }
            });
            const totalDias = Object.keys(eventosPorFecha).length;
            const porcentajeAsistencia = totalDias > 0 ? Math.round((diasAsistidos / totalDias) * 100) : 0;

            return (
              <div key={plan.fechaInicio + '-' + plan.nombrePlan} className="space-y-6">
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{diasAsistidos}</p>
                        <p className="text-sm text-gray-500">Días completados</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{diasPendientes}</p>
                        <p className="text-sm text-gray-500">Días pendientes</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{diasPerdidos}</p>
                        <p className="text-sm text-gray-500">Días perdidos</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{porcentajeAsistencia}%</p>
                        <p className="text-sm text-gray-500">Asistencia</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calendar Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Calendario de Entrenamientos</h3>
                          <p className="text-sm text-gray-500">Planifica y rastrea tu progreso</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <AttendanceLegend />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <WeeklyAgenda
                      events={events}
                      minDate={minDate}
                      maxDate={maxDate}
                      currentDate={currentDate}
                      onNavigate={handleNavigate}
                      legend={null}
                      height={900}
                      showArrows={true}
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Training Recommendations Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tips Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Consejos de Entrenamiento</h3>
                <p className="text-sm text-gray-500">Optimiza tu rendimiento</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-emerald-800">Hidratación constante</p>
                  <p className="text-xs text-emerald-600">Bebe agua antes, durante y después del ejercicio</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-primary-50 rounded-xl border border-primary-100">
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

          {/* Goals Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
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
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200">
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
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
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
      </div>
    </div>
  );
};

export default ClientInscribedPlans;

/**
 * Estados posibles para un alquiler.
 * 
 * Este objeto refleja los estados definidos en el backend (EstadoAlquiler.java)
 */
export const ESTADO_ALQUILER = {
  ACTIVO: 'ACTIVO',
  FINALIZADO: 'FINALIZADO',
  VENCIDO: 'VENCIDO',
  CANCELADO: 'CANCELADO'
};

/**
 * Información de visualización para cada estado.
 */
export const ESTADO_ALQUILER_INFO = {
  [ESTADO_ALQUILER.ACTIVO]: {
    label: 'Activo',
    color: 'green',
    descripcion: 'Alquiler en uso'
  },
  [ESTADO_ALQUILER.FINALIZADO]: {
    label: 'Finalizado',
    color: 'blue',
    descripcion: 'Se completó y se devolvió'
  },
  [ESTADO_ALQUILER.VENCIDO]: {
    label: 'Vencido',
    color: 'yellow',
    descripcion: 'Ya pasó la fecha de fin, pero no se devolvió'
  },
  [ESTADO_ALQUILER.CANCELADO]: {
    label: 'Cancelado',
    color: 'red',
    descripcion: 'Se canceló antes de usarse'
  }
};

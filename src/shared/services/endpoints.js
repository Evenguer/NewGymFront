export const BASE_URL = 'http://localhost:8080/api'; // Forzar URL específica para pruebas

console.log("BASE_URL configurada como:", BASE_URL);

export const ENDPOINTS = {  
  BASE_URL,
  // Auth y usuarios
  TOGGLE_CLIENT_STATUS: (id) => `${BASE_URL}/personas/clientes/${id}/estado`,
  UPDATE_CLIENT: (id) => `${BASE_URL}/personas/clientes/${id}`,
  // Ventas
  VENTAS: {
    LISTAR: `${BASE_URL}/venta/listar`,
    DETALLE: `${BASE_URL}/venta/detalle`,
    CANCELAR: (id) => `${BASE_URL}/venta/cancelar/${id}`,
  },
  
  // Piezas
  PIEZA: {
    LISTAR: `${BASE_URL}/pieza/listar`,
    GUARDAR: `${BASE_URL}/pieza/guardar`,
    ACTUALIZAR: `${BASE_URL}/pieza/actualizar`,
    CAMBIAR_ESTADO: (id) => `${BASE_URL}/pieza/${id}/estado`,
    ELIMINAR: (id) => `${BASE_URL}/pieza/eliminar/${id}`
  },

  // Alquileres
  ALQUILER: {
    LISTAR: `${BASE_URL}/alquiler/listar`,
    GUARDAR: `${BASE_URL}/alquiler/guardar`, 
    CREAR_COMPLETO: `${BASE_URL}/alquiler/crear-completo`,
    CALCULAR_PRECIO: `${BASE_URL}/alquiler/calcular-precio`,
    CAMBIAR_ESTADO: (id) => `${BASE_URL}/alquiler/cambiar-estado/${id}`,
    FINALIZAR: (id) => `${BASE_URL}/alquiler/finalizar/${id}`,
    CANCELAR: (id) => `${BASE_URL}/alquiler/cancelar/${id}`,
    VENCIDO: (id) => `${BASE_URL}/alquiler/vencido/${id}`,
    REGISTRAR_DEVOLUCION: (id) => `${BASE_URL}/alquiler/registrar-devolucion/${id}`,
    DETALLE: {
      AGREGAR_LOTE: `${BASE_URL}/alquiler/detalle/agregar-lote`,
      LISTAR: (id) => `${BASE_URL}/alquiler/detalle/listar/${id}`,
      ELIMINAR: (id) => `${BASE_URL}/alquiler/detalle/eliminar/${id}`
    },
    PAGO: {
      REGISTRAR: `${BASE_URL}/alquiler/pago/registrar`
    },
    VERIFICAR_VENCIDOS: `${BASE_URL}/alquiler/verificar-vencidos`,
  },

  // Auth
  LOGIN: `${BASE_URL}/auth/login`,
  REGISTER: `${BASE_URL}/auth/register`, // Único endpoint para registrar todo tipo de usuarios
  GET_USERS: `${BASE_URL}/auth/usuarios`,
  // Perfil Cliente (autenticado)
  CLIENT_PROFILE: `${BASE_URL}/auth/perfil`,
  CLIENT_CHANGE_PASSWORD: `${BASE_URL}/auth/perfil/cambiar-contrasena`,
  
  GET_USERS_SECURITY: `${BASE_URL}/auth/usuarios/seguridad`,
  TOGGLE_USER_STATUS: (id) => `${BASE_URL}/auth/usuarios/${id}/estado`,
  LIST_CLIENTS: `${BASE_URL}/personas/clientes`,
  LIST_EMPLOYEES: `${BASE_URL}/personas/empleados`,
  UPDATE_EMPLOYEE: (id) => `${BASE_URL}/personas/empleados/${id}`,
  GET_EMPLOYEE: (id) => `${BASE_URL}/personas/empleados/${id}`,
  GET_CLIENT: (id) => `${BASE_URL}/personas/clientes/${id}`,
  GET_USUARIO_DETAILS: (id) => `${BASE_URL}/auth/usuarios/${id}/detalles`,
  GET_CLIENT_BY_USER: (userId) => `${BASE_URL}/personas/usuario/${userId}/cliente`,
  GET_EMPLOYEE_BY_USER: (userId) => `${BASE_URL}/personas/usuario/${userId}/empleado`,

  // Plan
  SAVE_PLAN: `${BASE_URL}/plan/guardar`,
  LIST_PLANS: `${BASE_URL}/plan/listar`,
  UPDATE_PLAN: `${BASE_URL}/plan/actualizar`,
  TOGGLE_PLAN_STATUS: (id) => `${BASE_URL}/plan/${id}/estado`,
  DELETE_PLAN: (id) => `${BASE_URL}/plan/eliminar/${id}`,
  
 // Horario Empleado
    LIST_SCHEDULES: `${BASE_URL}/horario-empleado/listar`,
    ADD_SCHEDULE: (empleadoId) => `${BASE_URL}/horario-empleado/agregar/${empleadoId}`,
    UPDATE_SCHEDULE: (id) => `${BASE_URL}/horario-empleado/actualizar/${id}`,
    DELETE_SCHEDULE: (id) => `${BASE_URL}/horario-empleado/eliminar/${id}`,
    TOGGLE_SCHEDULE_STATUS: (id) => `${BASE_URL}/horario-empleado/${id}/estado`,    LIST_SCHEDULES_BY_EMPLOYEE_AND_DAY: (empleadoId, dia) => `${BASE_URL}/horario-empleado/empleado/${empleadoId}/dia/${dia}`,

  // Asistencia Empleado
  MARK_ATTENDANCE: `${BASE_URL}/asistencia/marcar`,
  LIST_ATTENDANCE: `${BASE_URL}/asistencia/listar`,

  
  // Asistencia Cliente
  LIST_CLIENT_ATTENDANCE: `${BASE_URL}/listar`,
  REGISTER_ATTENDANCE_QR: `${BASE_URL}/asistencia/registrar`,

  // Categoría
  SAVE_CATEGORY: `${BASE_URL}/categoria/guardar`,
  UPDATE_CATEGORY: `${BASE_URL}/categoria/actualizar`,
  TOGGLE_CATEGORY_STATUS: (id) => `${BASE_URL}/categoria/${id}/estado`,
  LIST_CATEGORIES: `${BASE_URL}/categoria/listar`,
  DELETE_CATEGORY: (id) => `${BASE_URL}/categoria/eliminar/${id}`,
    // Producto
  SAVE_PRODUCT: `${BASE_URL}/producto/guardar`,
  UPDATE_PRODUCT: `${BASE_URL}/producto/actualizar`,
  TOGGLE_PRODUCT_STATUS: (id) => `${BASE_URL}/producto/${id}/estado`,
  LIST_PRODUCTS: `${BASE_URL}/producto/listar`,
  DELETE_PRODUCT: (id) => `${BASE_URL}/producto/eliminar/${id}`,
  
  // Venta
  LIST_SALES: `${BASE_URL}/venta/listar`,
  LIST_SALES_WITH_DETAILS: `${BASE_URL}/venta/listar-con-detalles`,
  SAVE_SALE: `${BASE_URL}/venta/guardar`,
  GET_SALE_DETAILS: (id) => `${BASE_URL}/venta/${id}/detalle`,
  ADD_SALE_DETAILS: `${BASE_URL}/venta/detalle/agregar`,
  ADD_SALE_DETAILS_BATCH: `${BASE_URL}/venta/detalle/agregar-lote`,
  DELETE_SALE_DETAIL: (id) => `${BASE_URL}/venta/detalle/${id}`,
  TOGGLE_SALE_STATUS: (id) => `${BASE_URL}/venta/${id}/estado`,
  REGISTER_PAYMENT: `${BASE_URL}/venta/pago/registrar`,
  
  // Especialidades
  LIST_SPECIALTIES: `${BASE_URL}/especialidad/listar-basico`, // Cambiado a endpoint seguro
  LIST_SPECIALTIES_FULL: `${BASE_URL}/especialidad/listar`,  // Endpoint original (puede causar problemas)
  SAVE_SPECIALTY: `${BASE_URL}/especialidad/guardar`,
  UPDATE_SPECIALTY: `${BASE_URL}/especialidad/actualizar`,
  TOGGLE_SPECIALTY_STATUS: (id) => `${BASE_URL}/especialidad/cambiarEstado/${id}`,
  DELETE_SPECIALTY: (id) => `${BASE_URL}/especialidad/eliminar/${id}`,

  // Inscripciones
  REGISTER_INSCRIPTION: `${BASE_URL}/inscripciones/registrar`,
  LIST_AVAILABLE_INSTRUCTORS: (idPlan) => `${BASE_URL}/inscripciones/instructores-disponibles/${idPlan}`,
  LIST_INSTRUCTOR_SCHEDULES: (idEmpleado) => `${BASE_URL}/inscripciones/horarios-instructor/${idEmpleado}`,
  REGISTER_INSCRIPTION_PAYMENT: `${BASE_URL}/inscripciones/pago/registrar`,
  GET_INSCRIPTION_DETAIL: (id) => `${BASE_URL}/inscripciones/inscripciones/${id}/detalle`,
  LIST_ALL_INSCRIPTIONS: `${BASE_URL}/inscripciones/listar`,
  CANCEL_INSCRIPTION: (id) => `${BASE_URL}/inscripciones/cancelar/${id}`,

  GET_CLIENT_PLANS: (idCliente) => `${BASE_URL}/inscripciones/planes-inscritos/${idCliente}`,
  GET_CLIENT_PLANS_HISTORY: (idCliente) => `${BASE_URL}/inscripciones/historial-planes/${idCliente}`,

  // Desempeño (Cliente)
  GET_CLIENT_DESEMPENO: (idCliente) => `${BASE_URL}/desempeno/cliente/${idCliente}`,
  GET_CLIENT_DESEMPENO_HISTORY: (idCliente) => `${BASE_URL}/desempeno/historial/${idCliente}`,

  // Entrenador (Premium y Estándar)
  TRAINER_PREMIUM_PLANS_CLIENTS: `${BASE_URL}/entrenador/premium/planes-clientes`,
  TRAINER_STANDARD_PLANS_CLIENTS: `${BASE_URL}/entrenador/estandar/planes-clientes`,

  //Desempeño (Entrenador)
  TRAINER_REGISTER_DESEMPENO: `${BASE_URL}/desempeno/registrar`,
  TRAINER_UPDATE_DESEMPENO: (id) => `${BASE_URL}/desempeno/actualizar/${id}`,
  TRAINER_DELETE_DESEMPENO: (id) => `${BASE_URL}/desempeno/eliminar/${id}`,
  TRAINER_GET_CLIENT_DESEMPENO: (idCliente) => `${BASE_URL}/desempeno/cliente/${idCliente}`,

  // Dashboard Recepcionista
  DASHBOARD_RECEPCIONISTA: `${BASE_URL}/dashboard-recepcionista`,
  
  // Dashboard Admin
  DASHBOARD_ADMIN: `${BASE_URL}/dashboard-admin`,
  DASHBOARD_ADMIN_ESTADISTICAS_VENTAS: `${BASE_URL}/dashboard-admin/estadisticas-ventas`,
  DASHBOARD_ADMIN_ESTADISTICAS_CLIENTES: `${BASE_URL}/dashboard-admin/estadisticas-clientes`,
  DASHBOARD_ADMIN_PRODUCTOS_BAJO_STOCK: `${BASE_URL}/dashboard-admin/productos-bajo-stock`,
  DASHBOARD_ADMIN_PIEZAS_BAJO_STOCK: `${BASE_URL}/dashboard-admin/piezas-bajo-stock`,
  DASHBOARD_ADMIN_ACTIVIDADES_RECIENTES: `${BASE_URL}/dashboard-admin/actividades-recientes`,
  DASHBOARD_ADMIN_HORARIOS_HOY: `${BASE_URL}/dashboard-admin/horarios-hoy`,

  // Reportes de Ventas y Finanzas
  REPORTES_VENTAS: {
    INGRESOS_TOTALES: `${BASE_URL}/reportes-ventas/ingresos-totales`,
    CRECIMIENTO: `${BASE_URL}/reportes-ventas/crecimiento`,
    TOTAL_TRANSACCIONES: `${BASE_URL}/reportes-ventas/total-transacciones`,
    ANALISIS_CATEGORIA: `${BASE_URL}/reportes-ventas/analisis-categoria`,
    PRODUCTOS_MAS_VENDIDOS: `${BASE_URL}/reportes-ventas/productos-mas-vendidos`,
    TENDENCIAS: `${BASE_URL}/reportes-ventas/tendencias`,
    RENTABILIDAD: `${BASE_URL}/reportes-ventas/rentabilidad`
  },

  // Reportes de Alquileres
  REPORTES_ALQUILERES: {
    // Estado de alquileres
    ESTADOS_MES_ACTUAL: `${BASE_URL}/reportes/alquileres/estados/mes-actual`,
    ESTADOS_TRIMESTRE_ACTUAL: `${BASE_URL}/reportes/alquileres/estados/trimestre-actual`,
    ESTADOS_ANIO_ACTUAL: `${BASE_URL}/reportes/alquileres/estados/anio-actual`,

    // Top 10 piezas más alquiladas
    TOP10_PIEZAS_MES_ACTUAL: `${BASE_URL}/reportes/alquileres/top10-piezas/mes-actual`,
    TOP10_PIEZAS_TRIMESTRE_ACTUAL: `${BASE_URL}/reportes/alquileres/top10-piezas/trimestre-actual`,
    TOP10_PIEZAS_ANIO_ACTUAL: `${BASE_URL}/reportes/alquileres/top10-piezas/anio-actual`,

    // Alquileres con mora pendiente
    PENDIENTES_MORA: `${BASE_URL}/reportes/alquileres/pendientes-mora`,

    // Ganancias
    INGRESOS_MES_ACTUAL: `${BASE_URL}/reportes/alquileres/ingresos-mes-actual`,
    INGRESOS_TRIMESTRE_ACTUAL: `${BASE_URL}/reportes/alquileres/ingresos-trimestre-actual`,
    INGRESOS_ANIO_ACTUAL: `${BASE_URL}/reportes/alquileres/ingresos-anio-actual`,

    // Tendencias últimos 6 meses (parametrizable)
    TENDENCIA: (meses = 6) => `${BASE_URL}/reportes/alquileres/tendencia?meses=${meses}`
  }

};
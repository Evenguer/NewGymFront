import React, { useEffect, useState } from 'react';
import HorarioEntrenadorPage from './modules/staff/pages/trainer/HorarioEntrenadorPage';
import TrainerPerformanceManagementPage from './modules/staff/pages/trainer/TrainerPerformanceManagementPage';
import TrainerStandardInscriptionClientsPage from './modules/staff/pages/trainer/TrainerStandardInscriptionClientsPage';
import { useAuth } from './shared/hooks/useAuth';

// ...existing imports...

// ...existing imports...


// ...existing code...
import axios from 'axios';
import { ENDPOINTS } from './shared/services/endpoints';

// Switch para mostrar la página correcta según el tipo de entrenador (consultando al backend)
const TrainerInscriptionSwitch = () => {
  const { user } = useAuth();
  const [tipo, setTipo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTipo = async () => {
      if (!user?.id) {
        setError('No se encontró el usuario.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        // Consultar el tipo de entrenador desde el backend
        const res = await axios.get(ENDPOINTS.GET_EMPLOYEE_BY_USER(user.id));
        // El backend debe retornar un campo tipoInstructor o similar
        setTipo(res.data?.tipoInstructor || res.data?.tipo || null);
      } catch (err) {
        setError(err?.message || 'No se pudo obtener el tipo de entrenador.');
      } finally {
        setLoading(false);
      }
    };
    fetchTipo();
  }, [user]);

  if (loading) return <div className="text-center py-8">Cargando...</div>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;
  if (tipo === 'PREMIUM') return <TrainerPerformanceManagementPage />;
  if (tipo === 'ESTANDAR' || tipo === 'ESTÁNDAR') return <TrainerStandardInscriptionClientsPage />;
  return <div className="text-center text-red-600 py-8">No tienes permisos para ver esta sección.</div>;
};
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/context/AuthContext';
import GlobalToaster from './shared/components/GlobalToaster';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import StaffLayout from './layouts/StaffLayout';
import ClienteLayout from './layouts/ClienteLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RoleSelectionPage from './pages/auth/RoleSelectionPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Admin Pages
import DashboardPage from './modules/admin/pages/DashboardPage';
import EmployeesListPage from './modules/admin/pages/EmployeesListPage';
import CategoriasPage from './modules/admin/pages/CategoriasPage';
import UsersListPage from './modules/admin/pages/UsersListPage';
import ClientesListPage from './modules/admin/pages/ClientesListPage';
import PlanesPage from './modules/admin/pages/PlanesPage';
import HorarioPage from './modules/admin/pages/HorarioPage';
import AsistenciaEmpleadoPage from './modules/admin/pages/AsistenciaEmpleadoPage';
import ListaAsistenciaPage from './modules/admin/pages/ListaAsistenciaPage';
import EspecialidadesPage from './modules/admin/pages/EspecialidadesPage';
import ReportesVentasFinanzas from './modules/admin/pages/reportes/VentasFinanzasReportes';
import AlquileresFinanzasReportes from './modules/admin/pages/reportes/AlquileresFinanzasReportes';

// Placeholder para páginas pendientes de implementar
const PlaceholderPage = () => (
  <div className="flex justify-center items-center h-full">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">En Construcción</h2>
      <p className="text-gray-600">Esta página está en desarrollo</p>
    </div>
  </div>
);

const RolesPage = PlaceholderPage;
const HorariosPage = PlaceholderPage;
const AsistenciaPersonalPage = PlaceholderPage;
const EvaluacionPage = PlaceholderPage;
const AsistenciaClientesPage = PlaceholderPage;
const InscripcionesPage = PlaceholderPage;
const DesempenoEntrenadoresPage = PlaceholderPage;

// Staff pages placeholders
const ClientesStaffPage = PlaceholderPage;
const NuevaInscripcionPage = PlaceholderPage;
const GestionarInscripcionesPage = PlaceholderPage;
const RegistrarAsistenciaPage = PlaceholderPage;
const VerAsistenciasPage = PlaceholderPage;
const ProductosStockPage = PlaceholderPage;
const ProductosEquipamientoPage = PlaceholderPage;
const PlanesStaffPage = PlaceholderPage;


// Staff Pages
// ...existing code...
import ProductoPage from './modules/staff/pages/receptionist/ProductoPage';
import CategoriaPage from './modules/staff/pages/receptionist/CategoriaPage';
import VentaPage from './modules/staff/pages/receptionist/VentaPage';
import ListaPage from './modules/staff/pages/receptionist/ListaPage';
import AlquilerPage from './modules/staff/pages/receptionist/AlquilerPage';
import ListaAlquileresPage from './modules/staff/pages/receptionist/ListaAlquileresPage';
import  EspecialidadListaPage from './modules/staff/pages/receptionist/EspecialidadListaPage';
import PlanesListaPage from './modules/staff/pages/receptionist/PlanesListaPage';
import ClienteFormPage from './modules/staff/pages/receptionist/ClienteFormPage';
import MaquinariaPage from './modules/staff/pages/receptionist/MaquinariaPage';
import InscripcionPage from './modules/staff/pages/receptionist/InscripcionPage';
import ListaInscripcionesPage from './modules/staff/pages/receptionist/ListaInscripcionesPage';
import VerificarInscripcionPage from './modules/staff/pages/receptionist/VerificarInscripcionPage';
import ListaAsistenciaCliente from './modules/staff/pages/receptionist/ListaAsistenciaCliente';

import TrainerHomePage from './modules/staff/pages/trainer/TrainerHomePage';
import StaffDashboardSwitch from './modules/staff/pages/StaffDashboardSwitch';

// Client Pages
import ClientHomePage from './modules/client/pages/ClientHomePage';
import ClientPerformancePage from './modules/client/pages/ClientPerformancePage';
import ClientPerformanceHistoryPage from './modules/client/pages/ClientPerformanceHistoryPage';
import ClientProfilePage from './modules/client/pages/ClientProfilePage';
import ClientInscribedPlans from './modules/client/pages/ClientInscribedPlans';
import ClientPlanesAnteriores from './modules/client/pages/ClientPlanesAnteriores';

// Protected Route
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <GlobalToaster />
        <Routes>
          {/* Rutas de autenticación */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/role-selection" element={<RoleSelectionPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Rutas de administrador */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']} redirectPath="/login" />
          }>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              
              {/* Dashboard */}
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Gestión de Usuarios */}
              <Route path="usuarios" element={<UsersListPage />} />
              <Route path="empleados" element={<EmployeesListPage />} />
              <Route path="clientes" element={<ClientesListPage />} />
              
              {/* Control de Personal */}
              <Route path="horarios" element={<HorarioPage />} />
              <Route path="asistencia" element={<AsistenciaEmpleadoPage />} />
              <Route path="lista-asistencia" element={<ListaAsistenciaPage />} />
              <Route path="evaluacion" element={<EvaluacionPage />} />
              
              {/* Servicios del Gimnasio */}
              <Route path="categorias" element={<CategoriasPage />} />
              <Route path="especialidades" element={<EspecialidadesPage />} />
              <Route path="planes" element={<PlanesPage />} />
              {/* Asistencia y Monitoreo */}
              <Route path="asistencia/clientes" element={<AsistenciaClientesPage />} />
              <Route path="verificar" element={<VerificarInscripcionPage />} />
              <Route path="lista-clientes" element={<ListaAsistenciaCliente />} />
              
              {/* Reportes y Análisis */}
              <Route path="reportes/ventas-finanzas" element={<ReportesVentasFinanzas />} />
              <Route path="reportes/alquileres" element={<AlquileresFinanzasReportes />} />
              <Route path="reportes/asistencia-participacion" element={<PlaceholderPage />} />
              <Route path="reportes/clientes" element={<PlaceholderPage />} />
              <Route path="reportes/inventario" element={<PlaceholderPage />} />
              

            </Route>
          </Route>

          {/* Rutas de recepcionista y entrenador */}
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['RECEPCIONISTA', 'ENTRENADOR']} redirectPath="/login" />
          }>
            <Route element={<StaffLayout />}>
              <Route index element={<Navigate to="/staff/dashboard" replace />} />
              {/* Dashboard: muestra el de recepcionista o entrenador según el rol */}
              <Route path="dashboard" element={<StaffDashboardSwitch />} />
              <Route path="categorias" element={<CategoriaPage />} />
              <Route path="especialidades" element={<EspecialidadListaPage />} />
              <Route path="planes" element={<PlanesListaPage />} />
              <Route path="empleados" element={<EmployeesListPage />} />
              <Route path="clientes" element={<ClientesListPage />} />
              <Route path="productos" element={<ProductoPage />} />
              <Route path="productos/stock" element={<ProductosStockPage />} />
              <Route path="equipamiento" element={<MaquinariaPage/>} />
              <Route path="ventas" element={<VentaPage/>} />
              <Route path="listas" element={<ListaPage />} />
              <Route path="inscripciones" element={<InscripcionPage />} />
              <Route path="alquileres/nuevo" element={<AlquilerPage />} />
              <Route path="alquileres/historial" element={<ListaAlquileresPage />} />
              <Route path="clientes" element={<ClientesStaffPage />} />
              <Route path="cliente/nuevo" element={<ClienteFormPage />} />
              <Route path="inscripciones/nueva" element={<NuevaInscripcionPage />} />

              <Route path="historial" element={<ListaInscripcionesPage/>} />
              <Route path="asistencias/registrar" element={<AsistenciaEmpleadoPage />} />
              <Route path="asistencias/ver" element={<ListaAsistenciaPage />} />
              <Route path="asistencias/clientes" element={<ListaAsistenciaCliente />} />
              <Route path="verificar" element={<VerificarInscripcionPage />} />
              <Route path="planes" element={<PlanesStaffPage />} />
              {/* Rutas específicas para ENTRENADOR */}
              {/* Inscripciones y Desempeños: premium ve gestión, estándar solo ve lista */}
              <Route path="inscripciones/desempeno" element={<TrainerInscriptionSwitch />} />
              <Route path="planes/horarios" element={<HorarioEntrenadorPage />} />
              {/* <Route path="clientes/asistencia" element={<ClientAttendancePage />} /> */}
              {/* Aquí irán las demás rutas de staff */}
            </Route>
          </Route>

          {/* Rutas de cliente */}
          <Route path="/client" element={
            <ProtectedRoute allowedRoles={['CLIENTE']} redirectPath="/login" />
          }>
            <Route element={<ClienteLayout />}>
              <Route index element={<ClientHomePage />} />
              <Route path="dashboard" element={<ClientHomePage />} />
              <Route path="inscripciones/desempeno" element={<ClientPerformancePage />} />
              <Route path="inscripciones/desempeno-historial" element={<ClientPerformanceHistoryPage />} />
              <Route path="perfil" element={<ClientProfilePage />} />
              <Route path="inscripciones/planes-inscritos" element={<ClientInscribedPlans />} />
              <Route path="inscripciones/planes-anteriores" element={<ClientPlanesAnteriores />} />
              {/* Aquí irán las demás rutas de cliente */}
            </Route>
          </Route>
          
          {/* Redirección de la raíz al login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Página 404 para rutas no encontradas */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

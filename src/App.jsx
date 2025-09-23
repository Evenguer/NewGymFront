import React from 'react';
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/context/AuthContext';
import GlobalToaster from './shared/components/GlobalToaster';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import StaffLayout from './layouts/StaffLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
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
import StaffDashboardSwitch from './modules/staff/pages/StaffDashboardSwitch';

// Protected Route
import ProtectedRoute from './components/common/ProtectedRoute';

// Placeholder para páginas pendientes de implementar
const PlaceholderPage = () => (
  <div className="flex justify-center items-center h-full">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">En Construcción</h2>
      <p className="text-gray-600">Esta página está en desarrollo</p>
    </div>
  </div>
);

const AsistenciaClientesPage = PlaceholderPage;
const EvaluacionPage = PlaceholderPage;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <GlobalToaster />
        <Routes>
          {/* Rutas de autenticación */}
          <Route path="/login" element={<LoginPage />} />
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
              <Route path="reportes/asistencia-participacion" element={<PlaceholderPage />} />
              <Route path="reportes/clientes" element={<PlaceholderPage />} />
              <Route path="reportes/inventario" element={<PlaceholderPage />} />
            </Route>
          </Route>

          {/* Rutas de recepcionista únicamente */}
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['RECEPCIONISTA']} redirectPath="/login" />
          }>
            <Route element={<StaffLayout />}>
              <Route index element={<Navigate to="/staff/dashboard" replace />} />
              
              {/* Dashboard de recepcionista */}
              <Route path="dashboard" element={<StaffDashboardSwitch />} />
              
              {/* Gestión de Categorías y Especialidades */}
              <Route path="categorias" element={<CategoriaPage />} />
              <Route path="planes" element={<PlanesListaPage />} />
              
              {/* Gestión de Personas */}
              <Route path="empleados" element={<EmployeesListPage />} />
              <Route path="clientes" element={<ClientesListPage />} />
              <Route path="cliente/nuevo" element={<ClienteFormPage />} />
              
              {/* Productos y Ventas */}
              <Route path="productos" element={<ProductoPage />} />
              <Route path="equipamiento" element={<MaquinariaPage />} />
              <Route path="ventas" element={<VentaPage />} />
              <Route path="listas" element={<ListaPage />} />
              
              {/* Inscripciones */}
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

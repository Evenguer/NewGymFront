import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  Clipboard, 
  Calendar, 
  DollarSign, 
  List, 
  ChevronRight, 
  ChevronDown,
  Clock,
  LogOut,
  User,
  Home,
  UserCheck,
  Tag,
  CheckSquare
} from 'react-feather';
import logoImage from '../assets/LOGO BUSSTER GYM.png';

const StaffLayout = () => {
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Menú para el recepcionista
  const staffMenuItems = [
    {
      title: 'Dashboard',
      path: '/staff/dashboard',
      icon: <Home size={20} />,
    },
    {
      title: 'Gestión de Usuarios',
      icon: <Users size={20} />,
      submenu: true,
      submenuItems: [
        { title: 'Nuevo Cliente', path: '/staff/cliente/nuevo' },
        { title: 'Clientes', path: '/staff/clientes' },
      ],
    },
    {
      title: 'Ventas',
      icon: <ShoppingCart size={20} />,
      submenu: true,
      submenuItems: [
        { title: 'Nueva Venta', path: '/staff/ventas' },
        { title: 'Historial', path: '/staff/listas' },
      ],
    },
    {
      title: 'Alquileres',
      icon: <Calendar size={20} />,
      submenu: true,
      submenuItems: [
        { title: 'Nuevo Alquiler', path: '/staff/alquileres/nuevo' },
        { title: 'Historial', path: '/staff/alquileres/historial' },
      ],
    },
    {
      title: 'Inscripciones',
      icon: <CheckSquare size={20} />,
      submenu: true,
      submenuItems: [
        { title: 'Nueva Inscripción', path: '/staff/inscripciones' },
        { title: 'Historial', path: '/staff/historial' },
      ],
    },
    {
      title: 'Control de Asistencias',
      icon: <Clock size={20} />,
      submenu: true,
      submenuItems: [
        { title: 'Registrar Asistencia', path: '/staff/asistencias/registrar' },
        { title: 'Ver Asistencias', path: '/staff/asistencias/ver' },
        {title: 'Verificar Inscripción', path: '/staff/verificar' },
        { title: 'Asistencias de Clientes', path: '/staff/asistencias/clientes' },
      ],
    },
    {
      title: 'Inventario',
      icon: <Package size={20} />,
      submenu: true,
      submenuItems: [
        { title: 'Productos', path: '/staff/productos' },
        { title: 'Equipamiento', path: '/staff/equipamiento' },
      ],
    },
    {
      title: 'Listas',
      icon: <List size={20} />,
      submenu: true,
      submenuItems: [
        { title: 'Categorías', path: '/staff/categorias' },
        { title: 'Especialidades', path: '/staff/especialidades' },
        { title: 'Planes', path: '/staff/planes' },
      ],
    },
  ];

  // Menú para el entrenador (estructura solicitada)
  const trainerMenuItems = [
    {
      title: 'Inicio',
      path: '/staff/dashboard',
      icon: <Home size={20} />,
    },
    {
      title: 'Clientes',
      icon: <Users size={20} />,
      submenu: true,
      submenuItems: [
        { title: 'Inscripciones y Desempeños', path: '/staff/inscripciones/desempeno' }, // Aquí irá TrainerPerformanceManagementPage
      ],
    },
    {
      title: 'Planes',
      icon: <Clipboard size={20} />,
      submenu: true,
      submenuItems: [
        { title: 'Horarios', path: '/staff/planes/horarios' },
      ],
    },
  ];

  // Selecciona el menú según el rol
  const menuItems = user?.role === 'ENTRENADOR' ? trainerMenuItems : staffMenuItems;

  // Inicializa el menú actualmente expandido basado en la ruta actual
  useEffect(() => {
    const currentPath = location.pathname;
    const defaultExpanded = {};

    menuItems.forEach(item => {
      if (item.submenu && item.submenuItems) {
        const isActive = item.submenuItems.some(subItem =>
          currentPath.startsWith(subItem.path)
        );
        if (isActive) {
          defaultExpanded[item.title] = true;
        }
      }
    });

    setExpanded(defaultExpanded);
    // eslint-disable-next-line
  }, [location.pathname, user?.role]);

  const toggleMenu = (menu) => {
    setExpanded(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-20'} h-full text-white transition-all duration-300 flex flex-col z-20`}
        style={{ backgroundColor: '#090909' }}
      >
        {/* Logo */}
        <div className="p-4 flex justify-between items-center relative border-b" style={{ borderColor: '#1a1a1a' }}>
          <img
            src={logoImage}
            alt="Busster GYM"
            className={`${sidebarOpen ? 'w-36' : 'w-12'} transition-all duration-300`}
          />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white focus:outline-none absolute right-2"
          >
            {sidebarOpen ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronRight size={20} className="transform rotate-180" />
            )}
          </button>
        </div>

        {/* Menu items */}
        <div className="flex-grow overflow-y-auto py-2">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index} className="mb-1 px-2">
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.title)}
                      className={`flex items-center w-full py-2 px-3 rounded-lg transition-colors duration-200 ${sidebarOpen ? '' : 'justify-center'}`}
                      style={{
                        backgroundColor: expanded[item.title] ? '#C50E1D' : 'transparent',
                        color: expanded[item.title] ? 'white' : '#9ca3af'
                      }}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {sidebarOpen && (
                        <>
                          <span className="flex-grow text-left">{item.title}</span>
                          {expanded[item.title] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </>
                      )}
                    </button>
                    {expanded[item.title] && sidebarOpen && (
                      <ul className="pl-8 mt-1 space-y-1">
                        {item.submenuItems.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <NavLink
                              to={subItem.path}
                              className={() => `block py-2 px-3 rounded-lg transition-colors duration-200`}
                              style={({ isActive }) => ({
                                backgroundColor: isActive ? '#C50E1D' : 'transparent',
                                color: isActive ? 'white' : '#9ca3af'
                              })}
                            >
                              {subItem.title}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={() => `flex items-center py-2 px-3 rounded-lg transition-colors duration-200 ${sidebarOpen ? '' : 'justify-center'}`}
                    style={({ isActive }) => ({
                      backgroundColor: isActive ? '#C50E1D' : 'transparent',
                      color: isActive ? 'white' : '#9ca3af'
                    })}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {sidebarOpen && <span>{item.title}</span>}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        {/* User profile & logout */}
        <div className="border-t p-4" style={{ borderColor: '#1a1a1a' }}>
          <div className="flex items-center">
            <div className="rounded-full p-2" style={{ backgroundColor: '#C50E1D' }}>
              <User size={20} />
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name || (user?.role === 'ENTRENADOR' ? 'Entrenador' : 'Recepcionista')}</p>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-xs mt-1 hover:text-white"
                  style={{ color: '#9ca3af' }}
                >
                  <LogOut size={14} className="mr-1" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10">
          <div className="p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {user?.role === 'ENTRENADOR' ? 'Panel de Entrenador' : 'Panel de Recepción'}
              </h2>
              <div className="flex items-center space-x-4">
                {/* Notificaciones, perfil, etc. */}
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;

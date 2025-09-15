import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';
import {
  Home,
  CheckSquare,
  User,
  ChevronRight,
  ChevronDown,
  LogOut
} from 'react-feather';
import logoImage from '../assets/LOGO BUSSTER GYM.png';
import '@n8n/chat/style.css';
import '../assets/chat-styles.css';
import { createChat } from '@n8n/chat';

const ClienteLayout = () => {
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Función alternativa sin CORS proxy (recomendada)
  const initializeChatDirect = () => {
    createChat({
      webhookUrl: 'https://chume.app.n8n.cloud/webhook/8b3d8621-f638-46fd-870d-6b3f407ed524/chat',
      webhookConfig: {
        method: 'POST',
        headers: {}
      },
      target: '#n8n-chat',
      mode: 'window',
      chatInputKey: 'chatInput',
      chatSessionKey: 'sessionId',
      loadPreviousSession: true,
      metadata: {},
      showWelcomeScreen: false,
      defaultLanguage: 'es',
      initialMessages: [
        '👋 ¡Bienvenido/a al Chat de GymBuster!',
        '¿En qué puedo ayudarte hoy?'
      ],
      i18n: {
        es: {
          title: 'Chat GymBuster',
          subtitle: "Estamos aquí para ayudarte 24/7",
          footer: '',
          getStarted: 'Iniciar chat',
          inputPlaceholder: '¿En qué puedo ayudarte?',
        },
      }
    });
  };

  useEffect(() => {
    initializeChatDirect();
  }, [user]);

  // Menú para el cliente
  const clientMenuItems = [
    {
      title: 'Inicio',
      path: '/client',
      icon: <Home size={20} />,
    },
    {
      title: 'Inscripciones',
      icon: <CheckSquare size={20} />,
      submenu: true,
      submenuItems: [
        { title: 'Planes Inscritos', path: '/client/inscripciones/planes-inscritos' },
        { title: 'Planes Anteriores', path: '/client/inscripciones/planes-anteriores' },
        { title: 'Desempeño', path: '/client/inscripciones/desempeno' },
        { title: 'Historial de Desempeños', path: '/client/inscripciones/desempeno-historial' },
      ],
    },
    {
      title: 'Perfil',
      path: '/client/perfil',
      icon: <User size={20} />,
    },
  ];

  useEffect(() => {
    const currentPath = location.pathname;
    const defaultExpanded = {};
    clientMenuItems.forEach(item => {
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
  }, [location.pathname]);

  const toggleMenu = (menu) => {
    setExpanded(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Chat container */}
      <div id="n8n-chat" className="fixed bottom-4 right-4 z-[9999]"></div>

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
            {clientMenuItems.map((item) => (
              <li key={item.title} className="mb-1 px-2">
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
                        {item.submenuItems.map((subItem) => (
                          <li key={subItem.path}>
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
                    className={() => `flex items-center py-2 px-3 rounded-lg transition-colors duration-200`}
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
                <p className="text-sm font-medium text-white">{user?.name || 'Cliente'}</p>
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
                {(() => {
                  const path = location.pathname;
                  if (path === '/client' || path === '/client/dashboard') return 'Inicio';
                  if (path.startsWith('/client/inscripciones/planes-inscritos')) return 'Planes Inscritos';
                  if (path.startsWith('/client/inscripciones/planes-anteriores')) return 'Planes Anteriores';
                  if (path.startsWith('/client/inscripciones/desempeno-historial')) return 'Historial de Desempeños';
                  if (path.startsWith('/client/inscripciones/desempeno')) return 'Desempeño Actual';
                  if (path.startsWith('/client/perfil')) return 'Mi Perfil';
                  return 'Panel de Cliente';
                })()}
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

export default ClienteLayout;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog } from '@headlessui/react';
import { Button } from '../../../../components/ui';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Tag, 
  Briefcase, 
  DollarSign
} from 'react-feather';
import { ENDPOINTS } from '../../../../shared/services/endpoints';
import './modal-styles.css';

const ViewUserDetailsModal = ({ user, isOpen, onClose, lastAccess }) => {
  const [detailedUser, setDetailedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user || !isOpen) return;

      setLoading(true);
      setLoading(true);

      try {
        // Obtener el token de autenticación
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        // Configuración común para las peticiones
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        console.log('Token:', token);

        // Determinar si el usuario es empleado o cliente
        const isEmployee = user.roles?.some(rol => 
          ['ADMIN', 'ENTRENADOR', 'RECEPCIONISTA'].includes(rol)
        );

        console.log('Es empleado:', isEmployee);
        console.log('ID de usuario:', user.id);

        const roleEndpoint = isEmployee ? 
          ENDPOINTS.GET_EMPLOYEE_BY_USER(user.id) : 
          ENDPOINTS.GET_CLIENT_BY_USER(user.id);

        console.log('Endpoint a usar:', roleEndpoint);

        // Obtener los detalles del usuario
        let roleDetailsResponse;
        try {
          roleDetailsResponse = await axios.get(roleEndpoint, config);
          console.log('Detalles obtenidos:', roleDetailsResponse.data);
        } catch (error) {
          console.error('Error al obtener detalles:', error.response?.status, error.response?.data);
          // Intentar el endpoint antiguo como fallback
          const fallbackEndpoint = isEmployee ? 
            ENDPOINTS.GET_EMPLOYEE(user.id) : 
            ENDPOINTS.GET_CLIENT(user.id);
          console.log('Intentando endpoint fallback:', fallbackEndpoint);
          roleDetailsResponse = await axios.get(fallbackEndpoint, config);
        }

        console.log('Respuesta de detalles:', roleDetailsResponse.data);

        // Combinar los datos del usuario con los detalles adicionales
        setDetailedUser({
          ...user,
          ...roleDetailsResponse.data
        });
      } catch (err) {
        console.error('Error al obtener detalles del usuario:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  if (loading) {
    return (
      <Dialog as="div" className="modal-container relative z-50" open={isOpen} onClose={onClose}>
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="modal-content w-full max-w-3xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    );
  }

  // Usar detailedUser si está disponible, de lo contrario usar user
  const displayUser = detailedUser || user;

  // Determinar si el usuario es empleado o cliente por su rol
  const isEmpleado = displayUser.roles?.some(rol => 
    ['ADMIN', 'ENTRENADOR', 'RECEPCIONISTA'].includes(rol)
  ) || ['ADMIN', 'ENTRENADOR', 'RECEPCIONISTA'].includes(displayUser.role);

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Determinar el color según el rol
  const getRoleColor = (role) => {
    switch(role) {
      case 'ADMIN': return 'text-amber-600';
      case 'ENTRENADOR': return 'text-indigo-600';
      case 'RECEPCIONISTA': return 'text-cyan-600';
      case 'CLIENTE': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Renderizar la lista de roles del usuario
  const renderRoles = () => {
    let roles = Array.isArray(displayUser.roles) ? displayUser.roles : [displayUser.role || 'No definido'];
    // Eliminar duplicados (por valor)
    roles = [...new Set(roles)];
    return roles.map((role, index) => (
      <span 
        key={index} 
        className={`${getRoleColor(role)} inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium mr-2 mb-2 bg-opacity-10 border`}
      >
        {role}
      </span>
    ));
  };

  return (
    <Dialog as="div" className="modal-container relative z-50" open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black bg-opacity-25" />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="modal-content w-full max-w-3xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title as="div" className="flex items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Detalles del Usuario
              </h3>
            </Dialog.Title>

            <div className="space-y-6">
              {/* Sección de encabezado con avatar e información básica */}
              <div className="flex items-start">
                <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-bold text-2xl">
                    {displayUser.nombreUsuario?.[0]?.toUpperCase() || displayUser.nombre?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {displayUser.nombreUsuario}
                  </h4>
                  <p className="text-gray-600">
                    {displayUser.nombre} {displayUser.apellidos}
                  </p>
                  <div className="flex flex-wrap mt-2">
                    {renderRoles()}
                  </div>
                </div>
              </div>

              {/* Separador */}
              <hr className="border-gray-200" />

              {/* Información personal */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Información Personal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500 mr-1">DNI:</span>
                    <span className="text-sm font-medium">{displayUser.dni || 'No disponible'}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500 mr-1">Email:</span>
                    <span className="text-sm font-medium">{displayUser.correo || 'No disponible'}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500 mr-1">Teléfono:</span>
                    <span className="text-sm font-medium">{displayUser.celular || 'No disponible'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500 mr-1">Fecha de Nacimiento:</span>
                    <span className="text-sm font-medium">{formatDate(displayUser.fechaNacimiento)}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500 mr-1">Género:</span>
                    <span className="text-sm font-medium">{displayUser.genero || 'No especificado'}</span>
                  </div>
                  {!isEmpleado && (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500 mr-1">Dirección:</span>
                      <span className="text-sm font-medium">{displayUser.direccion || 'No disponible'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Información adicional para empleados */}
              {isEmpleado && (
                <>
                  <hr className="border-gray-200" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Información Laboral</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Tag className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500 mr-1">RUC:</span>
                        <span className="text-sm font-medium">{displayUser.ruc || 'No disponible'}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500 mr-1">Salario:</span>
                        <span className="text-sm font-medium">
                          {displayUser.salario ? `S/ ${parseFloat(displayUser.salario).toFixed(2)}` : 'No disponible'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500 mr-1">Fecha de Contratación:</span>
                        <span className="text-sm font-medium">{formatDate(displayUser.fechaContratacion)}</span>
                      </div>
                      {displayUser.roles?.includes('ENTRENADOR') || displayUser.role === 'ENTRENADOR' ? (
                        <>
                          <div className="flex items-center">
                            <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-500 mr-1">Tipo de Instructor:</span>
                            <span className="text-sm font-medium">{displayUser.tipoInstructor || 'No especificado'}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-500 mr-1">Cupo Máximo:</span>
                            <span className="text-sm font-medium">{displayUser.cupoMaximo || 'No definido'}</span>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                </>
              )}

              {/* Información del sistema */}
              <hr className="border-gray-200" />
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Información del Sistema</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500 mr-1">Nombre de Usuario:</span>
                    <span className="text-sm font-medium">{displayUser.nombreUsuario || 'No disponible'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500 mr-1">Último Acceso:</span>
                    <span className="text-sm font-medium">
                      {lastAccess
                        ? (() => {
                            const date = new Date(lastAccess);
                            return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                          })()
                        : (() => {
                            const fallback = displayUser.ultimoAcceso || displayUser.lastLogin || displayUser.last_access || displayUser.ultimo_acceso || displayUser.lastAccess;
                            if (fallback) {
                              try {
                                return new Date(fallback).toLocaleString();
                              } catch {
                                return fallback;
                              }
                            }
                            return 'Nunca';
                          })()
                      }
                    </span>
                  </div>
                  {displayUser.fechaCreacion && (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500 mr-1">Fecha de Creación:</span>
                      <span className="text-sm font-medium">{new Date(displayUser.fechaCreacion).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  onClick={onClose}
                  variant="secondary"
                  size="sm"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default ViewUserDetailsModal;

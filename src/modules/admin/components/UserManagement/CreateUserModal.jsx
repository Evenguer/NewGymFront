import React, { useState, useEffect } from 'react';
import { Card, Title, TextInput, Button } from '@tremor/react';
import { EnhancedSelect as Select, EnhancedMultiSelect as MultiSelect, SelectItem, MultiSelectItem } from './SelectWrapper';
import { register } from '../../../../shared/services/authAPI';
import { listEspecialidades } from '../../../../shared/services/especialidadAPI';
import { useNotification } from '../../../../shared/hooks/useNotification';
import './modal-styles.css';
import {
  isValidDNI,
  isValidPhone,
  isValidRUC,
  isStrongPassword,
  isValidEmail,
  isValidUsername,
  isValidName,
  isValidSalary,
  isValidMaxQuota,
  ERROR_MESSAGES
} from '../../../../shared/utils/validations';
import { isOver18, getMaxBirthDate } from '../../../../shared/utils/dateUtils';

const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const notify = useNotification();
  const [especialidades, setEspecialidades] = useState([]);
  const initialFormData = {
    nombreUsuario: '',
    contrasena: '',
    nombre: '',
    apellidos: '',
    dni: '',
    correo: '',
    celular: '',
    fechaNacimiento: '',
    genero: '',
    rol: '',
    direccion: '',
    ruc: '',
    salario: '',
    fechaContratacion: '',
    tipoInstructor: '',
    cupoMaximo: '',
    especialidadesIds: []
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const cargarEspecialidades = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await listEspecialidades(token);
        setEspecialidades(data);
      } catch (error) {
        console.error('Error al cargar especialidades:', error);
      }
    };
    cargarEspecialidades();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Aplicar restricciones específicas según el campo
    switch (name) {
      case 'dni':
        // Solo permitir números y limitar a 8 dígitos
        finalValue = value.replace(/\D/g, '').slice(0, 8);
        break;
      case 'celular':
        // Solo permitir números y limitar a 9 dígitos
        finalValue = value.replace(/\D/g, '').slice(0, 9);
        break;
      case 'ruc':
        // Solo permitir números y limitar a 11 dígitos
        finalValue = value.replace(/\D/g, '').slice(0, 11);
        break;
      case 'nombre':
      case 'apellidos':
        // Solo permitir letras y espacios
        finalValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        break;
      case 'salario':
        // Solo permitir números y un punto decimal
        finalValue = value.replace(/[^\d.]/g, '');
        if (finalValue.split('.').length > 2) {
          finalValue = value; // Mantener el valor anterior si hay más de un punto
        }
        break;
      case 'cupoMaximo':
        // Solo permitir números enteros positivos
        finalValue = value.replace(/\D/g, '');
        if (finalValue > 100) finalValue = '100';
        break;
      case 'nombreUsuario':
        // Solo permitir letras, números y guiones bajos
        finalValue = value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20);
        break;
      default:
        finalValue = value;
    }

    setFormData(prevData => ({
      ...prevData,
      [name]: finalValue
    }));

    // Limpiar el error del campo si existe
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleEspecialidadesChange = (values) => {
    setFormData(prevData => ({
      ...prevData,
      especialidadesIds: values
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    // Validaciones básicas para todos los usuarios
    if (!formData.nombreUsuario) {
      errors.nombreUsuario = 'El nombre de usuario es requerido';
    } else if (!isValidUsername(formData.nombreUsuario)) {
      errors.nombreUsuario = ERROR_MESSAGES.username;
    }

    if (!formData.contrasena) {
      errors.contrasena = 'La contraseña es requerida';
    } else if (!isStrongPassword(formData.contrasena)) {
      errors.contrasena = ERROR_MESSAGES.password;
    }

    if (!formData.nombre) {
      errors.nombre = 'El nombre es requerido';
    } else if (!isValidName(formData.nombre)) {
      errors.nombre = ERROR_MESSAGES.name;
    }

    if (!formData.apellidos) {
      errors.apellidos = 'Los apellidos son requeridos';
    } else if (!isValidName(formData.apellidos)) {
      errors.apellidos = ERROR_MESSAGES.name;
    }

    if (!formData.dni) {
      errors.dni = 'El DNI es requerido';
    } else if (!isValidDNI(formData.dni)) {
      errors.dni = ERROR_MESSAGES.dni;
    }

    if (!formData.correo) {
      errors.correo = 'El correo es requerido';
    } else if (!isValidEmail(formData.correo)) {
      errors.correo = ERROR_MESSAGES.email;
    }

    if (formData.celular && !isValidPhone(formData.celular)) {
      errors.celular = ERROR_MESSAGES.phone;
    }

    if (!formData.fechaNacimiento) {
      errors.fechaNacimiento = 'La fecha de nacimiento es requerida';
    } else if (!isOver18(formData.fechaNacimiento)) {
      errors.fechaNacimiento = ERROR_MESSAGES.age;
    }

    if (!formData.rol) {
      errors.rol = 'El rol es requerido';
    }

    if (!formData.genero) {
      errors.genero = 'El género es requerido';
    }

    // Validaciones específicas para entrenadores
    if (formData.rol === 'ENTRENADOR') {
      if (!formData.tipoInstructor) {
        errors.tipoInstructor = 'Debe seleccionar el tipo de instructor';
      }

      if (!formData.especialidadesIds || formData.especialidadesIds.length === 0) {
        errors.especialidadesIds = 'Debe seleccionar al menos una especialidad';
      }

      if (formData.tipoInstructor === 'PREMIUM') {
        if (!formData.cupoMaximo) {
          errors.cupoMaximo = 'El cupo máximo es requerido para entrenadores premium';
        } else if (!isValidMaxQuota(formData.cupoMaximo)) {
          errors.cupoMaximo = ERROR_MESSAGES.maxQuota;
        }
      }
    }

    // Validaciones para empleados (entrenadores y recepcionistas)
    if (formData.rol === 'ENTRENADOR' || formData.rol === 'RECEPCIONISTA') {
      if (formData.ruc) {
        if (!isValidRUC(formData.ruc)) {
          errors.ruc = ERROR_MESSAGES.ruc;
        }
      }
      // El campo RUC puede estar vacío, no es obligatorio
      if (!formData.salario) {
        errors.salario = 'El salario es requerido para empleados';
      } else if (!isValidSalary(formData.salario)) {
        errors.salario = ERROR_MESSAGES.salary;
      }
      if (!formData.fechaContratacion) errors.fechaContratacion = 'La fecha de contratación es requerida';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      await register(formData);
      setFormErrors({});
      notify.success('Usuario creado exitosamente');
      if (typeof onUserCreated === 'function') {
        onUserCreated();
      }
      onClose();
      setFormData(initialFormData);
    } catch (error) {
      if (error.response?.status === 409) {
        notify.error('Ya existe un usuario con ese DNI o correo electrónico');
      } else if (error.response?.status === 403) {
        notify.error('No tienes permisos para crear usuarios');
      } else {
        notify.error(error.message || 'Error al crear el usuario');
      }
    }
  };

  // Función para mostrar mensajes de ayuda
  const getHelpMessage = (fieldName) => {
    switch (fieldName) {
      case 'contrasena':
        return 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.';
      case 'dni':
        return 'Ingrese un DNI válido de 8 dígitos.';
      case 'celular':
        return 'Ingrese un número celular válido de 9 dígitos comenzando con 9.';
      case 'ruc':
        return 'Ingrese un RUC válido de 11 dígitos comenzando con 10 o 20.';
      case 'fechaNacimiento':
        return 'Debe ser mayor de 18 años para registrarse.';
      case 'nombreUsuario':
        return 'Use entre 4 y 20 caracteres. Solo letras, números y guiones bajos.';
      default:
        return '';
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50 modal-container">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-content">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Title>Crear Nuevo Usuario</Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Información de Usuario */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre de Usuario
                </label>
                <TextInput
                  name="nombreUsuario"
                  value={formData.nombreUsuario}
                  onChange={handleInputChange}
                  error={formErrors.nombreUsuario}
                  placeholder="Ingrese nombre de usuario"
                />
                {formErrors.nombreUsuario && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.nombreUsuario}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">{getHelpMessage('nombreUsuario')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <TextInput
                  type="password"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleInputChange}
                  error={formErrors.contrasena}
                  placeholder="Ingrese contraseña"
                />
                {formErrors.contrasena && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.contrasena}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">{getHelpMessage('contrasena')}</p>
              </div>
            </div>

            {/* Información Personal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <TextInput
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  error={formErrors.nombre}
                  placeholder="Ingrese nombre"
                />
                {formErrors.nombre && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Apellidos
                </label>
                <TextInput
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleInputChange}
                  error={formErrors.apellidos}
                  placeholder="Ingrese apellidos"
                />
                {formErrors.apellidos && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.apellidos}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  DNI
                </label>
                <TextInput
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  error={formErrors.dni}
                  placeholder="Ingrese DNI"
                />
                {formErrors.dni && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.dni}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">{getHelpMessage('dni')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Correo
                </label>
                <TextInput
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  error={formErrors.correo}
                  placeholder="Ingrese correo electrónico"
                />
                {formErrors.correo && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.correo}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Celular
                </label>
                <TextInput
                  name="celular"
                  value={formData.celular}
                  onChange={handleInputChange}
                  placeholder="Ingrese número de celular"
                />
                <p className="text-gray-500 text-xs mt-1">{getHelpMessage('celular')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha de Nacimiento
                </label>
                <TextInput
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleInputChange}
                  max={getMaxBirthDate()}
                />
                {formErrors.fechaNacimiento && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.fechaNacimiento}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">Debe ser mayor de 18 años para registrarse.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Género
                </label>
                <div className="select-wrapper">
                  <Select
                    name="genero"
                    value={formData.genero}
                    onValueChange={(value) => handleInputChange({ target: { name: 'genero', value } })}
                    className="custom-select"
                    error={formErrors.genero}
                  >
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                  </Select>
                </div>
                {formErrors.genero && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.genero}</p>
                )}
              </div>              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rol
                </label>
                <div className="select-wrapper">
                  <Select
                    name="rol"
                    value={formData.rol}
                    onValueChange={(value) => handleInputChange({ target: { name: 'rol', value } })}
                    className="custom-select"
                    error={formErrors.rol}
                  >
                    <SelectItem value="CLIENTE">Cliente</SelectItem>
                    <SelectItem value="ENTRENADOR">Entrenador</SelectItem>
                    <SelectItem value="RECEPCIONISTA">Recepcionista</SelectItem>
                  </Select>
                </div>
                {formErrors.rol && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.rol}</p>
                )}
              </div>
            </div>

            {/* Campos específicos según el rol */}
            {formData.rol === 'CLIENTE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <TextInput
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  placeholder="Ingrese dirección"
                />
              </div>
            )}

            {(formData.rol === 'ENTRENADOR' || formData.rol === 'RECEPCIONISTA') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    RUC
                  </label>                  <TextInput
                    name="ruc"
                    value={formData.ruc}
                    onChange={handleInputChange}
                    placeholder="Ingrese RUC"
                    error={formErrors.ruc}
                  />
                  {formErrors.ruc && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.ruc}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">{getHelpMessage('ruc')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Salario
                  </label>
                  <TextInput
                    type="number"
                    name="salario"
                    value={formData.salario}
                    onChange={handleInputChange}
                    placeholder="Ingrese salario"
                    error={formErrors.salario}
                  />
                  {formErrors.salario && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.salario}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Contratación
                  </label>
                  <TextInput
                    type="date"
                    name="fechaContratacion"
                    value={formData.fechaContratacion}
                    onChange={handleInputChange}
                    error={formErrors.fechaContratacion}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {formErrors.fechaContratacion && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.fechaContratacion}</p>
                  )}
                </div>
              </div>
            )}

            {formData.rol === 'ENTRENADOR' && (
              <div className="grid grid-cols-2 gap-4">                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Instructor
                  </label>
                  <div className="select-wrapper">
                    <Select
                      name="tipoInstructor"
                      value={formData.tipoInstructor}
                      onValueChange={(value) => handleInputChange({ target: { name: 'tipoInstructor', value } })}
                      className="custom-select"
                      error={formErrors.tipoInstructor}
                    >
                      <SelectItem value="ESTANDAR">Estándar</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                    </Select>
                  </div>
                  {formErrors.tipoInstructor && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.tipoInstructor}</p>
                  )}
                </div>
                {formData.tipoInstructor === 'PREMIUM' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cupo Máximo
                    </label>
                    <TextInput
                      type="number"
                      name="cupoMaximo"
                      value={formData.cupoMaximo}
                      onChange={handleInputChange}
                      placeholder="Ingrese cupo máximo"
                      error={formErrors.cupoMaximo}
                    />
                    {formErrors.cupoMaximo && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.cupoMaximo}</p>
                    )}
                  </div>
                )}                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Especialidades
                  </label>
                  <div className="select-wrapper">
                    <MultiSelect
                      value={formData.especialidadesIds}
                      onValueChange={handleEspecialidadesChange}
                      placeholder="Seleccione las especialidades"
                      className="custom-select"
                    >
                      {especialidades.map(especialidad => (
                        <MultiSelectItem key={especialidad.id} value={especialidad.id}>
                          {especialidad.nombre}
                        </MultiSelectItem>
                      ))}
                    </MultiSelect>
                  </div>
                  {formErrors.especialidadesIds && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.especialidadesIds}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                onClick={onClose}
                disabled={false}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={false}
              >
                Crear Usuario
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;

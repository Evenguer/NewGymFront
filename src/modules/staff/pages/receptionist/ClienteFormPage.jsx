import React, { useState } from 'react';
import { Card, Title, TextInput, Button } from '@tremor/react';
import { register, checkExistingUser } from '../../../../shared/services/authAPI';
import { toast, Toaster } from 'react-hot-toast';
import {
  isValidDNI,
  isValidPhone,
  isStrongPassword,
  isValidEmail,
  isValidUsername,
  isValidName,
  ERROR_MESSAGES
} from '../../../../shared/utils/validations';
import { isOver18, getMaxBirthDate } from '../../../../shared/utils/dateUtils';
import './modal-styles.css';

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
  direccion: ''
};

const ClienteFormPage = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
      case 'nombre':
      case 'apellidos':
        // Solo permitir letras y espacios
        finalValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    // Validaciones básicas usando las funciones de validación
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

    if (!formData.genero) {
      errors.genero = 'El género es requerido';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      // Verificar si el usuario ya existe
      const checkResult = await checkExistingUser(formData.dni, formData.correo);
      if (checkResult.exists) {
        toast.error(checkResult.message, {
          duration: 4000,
          position: 'top-right',
          style: { background: '#EF4444', color: '#fff' },
        });
        setLoading(false);
        return;
      }

      // Registrar el cliente con el token incluido automáticamente por la función register
      const data = await register({ ...formData, rol: 'CLIENTE' });
      if (!data) throw new Error('Error al crear el cliente');
      
      // Limpiar formulario y mostrar éxito
      setFormData(initialFormData);
      setFormErrors({});
      toast.success('Cliente registrado exitosamente', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: '#fff',
        },
        iconTheme: {
          primary: '#10B981',
          secondary: '#fff',
        }
      });
    } catch (error) {
      console.error('Error:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response?.status === 409 || error.message.includes('Duplicate entry') || error.message.includes('duplicado')) {
        toast.error('Ya existe un cliente con ese DNI o correo electrónico', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        });
      } else if (error.response?.status === 403 || error.message.includes('permisos')) {
        toast.error('No tienes permisos para crear clientes', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        });
      } else if (error.response?.status === 401) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        });
      } else {
        toast.error(error.message || 'Error al crear el cliente. Inténtalo nuevamente', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        });
      }
    } finally {
      setLoading(false);
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
      case 'fechaNacimiento':
        return 'Debe ser mayor de 18 años para registrarse.';
      case 'nombreUsuario':
        return 'Use entre 4 y 20 caracteres. Solo letras, números y guiones bajos.';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex justify-between items-center">
        <div>
          <Title className="mb-1">Registrar Nuevo Cliente</Title>
          <p className="text-gray-500">Formulario para registrar un nuevo cliente</p>
        </div>
      </div>
      <Card className="w-full p-8 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
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
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
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
              <label className="block text-sm font-medium text-gray-700">Apellidos</label>
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
              <label className="block text-sm font-medium text-gray-700">DNI</label>
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
              <label className="block text-sm font-medium text-gray-700">Correo</label>
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
              <label className="block text-sm font-medium text-gray-700">Celular</label>
              <TextInput
                name="celular"
                value={formData.celular}
                onChange={handleInputChange}
                error={formErrors.celular}
                placeholder="Ingrese número de celular"
              />
              {formErrors.celular && (
                <p className="text-red-500 text-xs mt-1">{formErrors.celular}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">{getHelpMessage('celular')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
              <TextInput
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                error={formErrors.fechaNacimiento}
                max={getMaxBirthDate()}
                placeholder="Seleccione fecha de nacimiento"
              />
              {formErrors.fechaNacimiento && (
                <p className="text-red-500 text-xs mt-1">{formErrors.fechaNacimiento}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">Debe ser mayor de 18 años.</p>
        
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Género</label>
              <select
                name="genero"
                value={formData.genero}
                onChange={handleInputChange}
                className="custom-select w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Seleccione género</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
              {formErrors.genero && (
                <p className="text-red-500 text-xs mt-1">{formErrors.genero}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <TextInput
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                placeholder="Ingrese dirección"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Creando...' : 'Registrar Cliente'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ClienteFormPage;

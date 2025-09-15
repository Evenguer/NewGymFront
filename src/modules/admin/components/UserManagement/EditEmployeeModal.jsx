import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Select, SelectItem, TextInput, DatePicker, NumberInput } from '@tremor/react';
import { updateEmployee } from '../../../../shared/services/employeeAPI';
import { isOver18, getMaxBirthDate } from '../../../../shared/utils/dateUtils';

const EditEmployeeModal = ({ employee, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    // Datos de persona
    nombre: '',
    apellidos: '',
    dni: '',
    correo: '',
    celular: '',
    genero: '',
    fechaNacimiento: '',
    
    // Datos de empleado
    ruc: '',
    salario: 0,
    fechaContratacion: '',
    tipoInstructor: '',
    cupoMaximo: 0
  });
  
  // Determinar si el empleado es entrenador basado en su rol actual
  const [isTrainer, setIsTrainer] = useState(false);
  
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      // Convertir fechas a objetos Date si son strings
      let fechaNacimiento = employee.fechaNacimiento ? parseDate(employee.fechaNacimiento) : null;
      let fechaContratacion = employee.fechaContratacion ? parseDate(employee.fechaContratacion) : null;
      
      // Determinar si el empleado es un entrenador basado solo en su rol actual
      const isEmployeeTrainer = employee.roles && employee.roles.includes('ENTRENADOR');
      setIsTrainer(isEmployeeTrainer);
      
      // Si no es entrenador, resetear los campos de entrenador
      const trainerFields = isEmployeeTrainer ? {
        tipoInstructor: employee.tipoInstructor || '',
        cupoMaximo: employee.cupoMaximo || 0
      } : {
        tipoInstructor: '',
        cupoMaximo: 0
      };
      
      setFormData({
        nombre: employee.nombre || '',
        apellidos: employee.apellidos || '',
        dni: employee.dni || '',
        correo: employee.correo || '',
        celular: employee.celular || '',
        genero: employee.genero || '',
        fechaNacimiento: fechaNacimiento,
        
        ruc: employee.ruc || '',
        salario: employee.salario || 0,
        fechaContratacion: fechaContratacion,
        ...trainerFields
      });
    }
  }, [employee]);
  
  // Función para convertir string de fecha a objeto Date
  const parseDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      // Si es un string ISO, convertirlo a objeto Date
      if (typeof dateString === 'string') {
        return new Date(dateString);
      }
      return dateString;
    } catch (error) {
      console.error('Error al analizar la fecha:', error);
      return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Bloquear números en nombre y apellidos
    if (name === 'nombre' || name === 'apellidos') {
      // Permitir solo letras, tildes, ñ y espacios
      const soloLetras = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: soloLetras
      }));
      return;
    }

    // Si se está cambiando el rol y el nuevo rol no es ENTRENADOR
    if (name === 'rol' && value !== 'ENTRENADOR') {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        tipoInstructor: '',
        cupoMaximo: 0
      }));
      setIsTrainer(false);
    } else if (name === 'rol' && value === 'ENTRENADOR') {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      setIsTrainer(true);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};

    // Validaciones generales para todos los empleados
    if (!formData.nombre) {
      errors.nombre = 'El nombre es requerido';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(formData.nombre)) {
      errors.nombre = 'El nombre solo debe contener letras';
    }

    if (!formData.apellidos) {
      errors.apellidos = 'Los apellidos son requeridos';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(formData.apellidos)) {
      errors.apellidos = 'Los apellidos solo deben contener letras';
    }

    if (!formData.dni) errors.dni = 'El DNI es requerido';
    if (formData.dni && formData.dni.length !== 8) errors.dni = 'El DNI debe tener 8 dígitos';
    if (!formData.correo) errors.correo = 'El correo es requerido';
    if (formData.correo && !/\S+@\S+\.\S+/.test(formData.correo)) errors.correo = 'El correo no es válido';
    if (!formData.celular) errors.celular = 'El celular es requerido';
    if (formData.celular && formData.celular.length !== 9) errors.celular = 'El celular debe tener 9 dígitos';

    if (formData.ruc && formData.ruc.length !== 11) errors.ruc = 'El RUC debe tener 11 dígitos';
    if (!formData.salario) errors.salario = 'El salario es requerido';
    if (formData.salario <= 0) errors.salario = 'El salario debe ser mayor a 0';

    // Validar edad
    if (!formData.fechaNacimiento) {
      errors.fechaNacimiento = 'La fecha de nacimiento es requerida';
    } else if (!isOver18(formData.fechaNacimiento)) {
      errors.fechaNacimiento = 'Debe ser mayor de 18 años para registrarse';
    }

    // Validaciones específicas para entrenadores
    if (isTrainer) {
      if (formData.tipoInstructor === 'PREMIUM' && (!formData.cupoMaximo || formData.cupoMaximo <= 0)) {
        errors.cupoMaximo = 'El cupo máximo es requerido para instructores premium';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, complete todos los campos requeridos correctamente.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Preparar los datos para enviar al backend
      let dataToSubmit = {
        ...formData,
        // Si no es entrenador, enviar null en los campos específicos
        tipoInstructor: isTrainer ? formData.tipoInstructor : null,
        cupoMaximo: isTrainer ? formData.cupoMaximo : null,
        // Formatear fechas como strings en formato ISO
        fechaNacimiento: formData.fechaNacimiento instanceof Date 
          ? formData.fechaNacimiento.toISOString().split('T')[0] 
          : formData.fechaNacimiento,
        fechaContratacion: formData.fechaContratacion instanceof Date 
          ? formData.fechaContratacion.toISOString().split('T')[0] 
          : formData.fechaContratacion
      };
      
      // Si no es entrenador, eliminamos los campos relacionados con entrenadores
      if (!isTrainer) {
        dataToSubmit = {
          ...dataToSubmit,
          tipoInstructor: null,
          cupoMaximo: null
        };
      }
        // Verificamos que el token exista
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No se ha iniciado sesión. Por favor, inicie sesión nuevamente.');
        return;
      }      
      const response = await updateEmployee(employee.idEmpleado, dataToSubmit, token);
      
      // Si la respuesta tiene un formato diferente, adaptamos la estructura
      const updatedEmployee = response.empleado || response;
      
      // Llamar a onSave con el empleado actualizado, pero mezclándolo con los datos originales
      // para asegurar que tengamos datos completos
      const mergedEmployee = {
        ...employee,
        ...updatedEmployee,
        ...dataToSubmit
      };
      
      onSave(mergedEmployee);
      onClose();
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      toast.error(error.message || 'Error al actualizar el empleado');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">
            Editar Empleado
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datos personales */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Datos Personales</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <TextInput
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Nombre"
                  error={formErrors.nombre}
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
                  placeholder="Apellidos"
                  error={formErrors.apellidos}
                />
                {formErrors.apellidos && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.apellidos}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">DNI</label>
                <TextInput
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  placeholder="DNI"
                  maxLength={8}
                  error={formErrors.dni}
                />
                {formErrors.dni && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.dni}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <TextInput
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.com"
                  error={formErrors.correo}
                />
                {formErrors.correo && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.correo}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Número de Celular</label>
                <TextInput
                  name="celular"
                  value={formData.celular}
                  onChange={handleInputChange}
                  placeholder="Celular"
                  maxLength={9}
                  error={formErrors.celular}
                />
                {formErrors.celular && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.celular}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Género</label>
                <Select 
                  name="genero"
                  value={formData.genero}
                  onValueChange={(value) => handleSelectChange('genero', value)}
                >
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                </Select>
              </div>
                <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                <TextInput
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento instanceof Date 
                    ? formData.fechaNacimiento.toISOString().split('T')[0] 
                    : formData.fechaNacimiento || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      fechaNacimiento: value
                    }));
                  }}
                  type="date"
                  max={getMaxBirthDate()}
                />
                {formErrors.fechaNacimiento && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.fechaNacimiento}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">Debe ser mayor de 18 años.</p>
              </div>
            </div>
            
            {/* Datos de empleado */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Datos Laborales</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">RUC</label>
                <TextInput
                  name="ruc"
                  value={formData.ruc}
                  onChange={handleInputChange}
                  placeholder="RUC"
                  maxLength={11}
                  error={formErrors.ruc}
                />
                {formErrors.ruc && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.ruc}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Salario</label>
                <NumberInput
                  name="salario"
                  value={formData.salario}
                  onValueChange={(value) => handleNumberChange('salario', value)}
                  placeholder="Salario"
                  error={formErrors.salario}
                />
                {formErrors.salario && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.salario}</p>
                )}
              </div>
                <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Contratación</label>
                <TextInput
                  name="fechaContratacion"
                  value={formData.fechaContratacion instanceof Date 
                    ? formData.fechaContratacion.toISOString().split('T')[0] 
                    : formData.fechaContratacion || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      fechaContratacion: value
                    }));
                  }}
                  type="date"
                />
              </div>
                {/* Los campos específicos para entrenadores solo se muestran si es entrenador */}
              {isTrainer && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Instructor</label>
                    <Select 
                      name="tipoInstructor"
                      value={formData.tipoInstructor}
                      onValueChange={(value) => handleSelectChange('tipoInstructor', value)}
                    >
                      <SelectItem value="ESTANDAR">Estándar</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                    </Select>
                  </div>
                  
                  {formData.tipoInstructor === 'PREMIUM' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cupo Máximo</label>
                      <NumberInput
                        name="cupoMaximo"
                        value={formData.cupoMaximo}
                        onValueChange={(value) => handleNumberChange('cupoMaximo', value)}
                        placeholder="Cupo Máximo"
                        error={formErrors.cupoMaximo}
                      />
                      {formErrors.cupoMaximo && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.cupoMaximo}</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;

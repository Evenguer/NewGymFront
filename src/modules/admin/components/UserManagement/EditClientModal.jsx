import React, { useState, useEffect } from 'react';
import { Select, SelectItem, TextInput } from '@tremor/react';
import { toast } from 'react-hot-toast';
import { isOver18, getMaxBirthDate } from '../../../../shared/utils/dateUtils';

const EditClientModal = ({ client, isOpen, onClose, onSave }) => {  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    dni: '',
    correo: '',
    celular: '',
    genero: '',
    fechaNacimiento: '',
    direccion: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  // Función para convertir string de fecha a objeto Date
  const parseDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      // Si es un string ISO, convertirlo a objeto Date
      if (typeof dateString === 'string') {
        // Si la fecha ya está en formato YYYY-MM-DD, devuélvela así
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return dateString;
        }
        
        // Intentar crear un objeto Date
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          // Convertir a formato YYYY-MM-DD
          return date.toISOString().split('T')[0];
        }
      }
      
      // Si es un objeto Date, devolver el objeto
      if (dateString instanceof Date) {
        return dateString;
      }
      
      return null;
    } catch (error) {
      console.error('Error al analizar la fecha:', error);
      return null;
    }
  };  useEffect(() => {
    if (client) {
      console.log("Cliente recibido en modal (completo):", JSON.stringify(client, null, 2));
      
      // Si el cliente tiene una propiedad 'persona', los datos están anidados
      const personaData = client.persona || client;
      
      // Intentar encontrar los campos con diferentes posibles nombres
      const generoCliente = personaData.genero || personaData.sexo || personaData.gender || '';
      console.log("Género del cliente encontrado:", generoCliente);
      
      const fechaNac = personaData.fechaNacimiento || personaData.fecha_nacimiento || personaData.birthDate || personaData.fecha_nac || null;
      console.log("Fecha de nacimiento del cliente encontrada:", fechaNac);
      
      // Convertir fechas a objetos Date si son strings
      let fechaNacimientoObj = fechaNac ? parseDate(fechaNac) : null;
      console.log("Fecha de nacimiento procesada:", fechaNacimientoObj);
      
      // También verificar si hay datos en una subpropiedad 'cliente'
      const clienteData = client.cliente || client;
      
      setFormData({
        nombre: personaData.nombre || '',
        apellidos: personaData.apellidos || '',
        dni: personaData.dni || '',
        correo: personaData.correo || personaData.email || '',
        celular: personaData.celular || personaData.telefono || personaData.phone || '',
        genero: generoCliente,
        fechaNacimiento: fechaNacimientoObj,
        direccion: clienteData.direccion || clienteData.address || personaData.direccion || ''
      });
    }
  }, [client]);const handleChange = (e) => {
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleInputChange = (e) => {
    handleChange(e);
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};

    // Validaciones para los campos del cliente
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
    
    // Validar edad
    if (!formData.fechaNacimiento) {
      errors.fechaNacimiento = 'La fecha de nacimiento es requerida';
    } else if (!isOver18(formData.fechaNacimiento)) {
      errors.fechaNacimiento = 'Debe ser mayor de 18 años para registrarse';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, complete todos los campos requeridos correctamente.');
      return;
    }
    
    setLoading(true);
    
    try {      // Preparar los datos para enviar al backend
      let dataToSubmit = {
        ...formData,
        // Formatear fechas como strings en formato ISO o null si no existe
        fechaNacimiento: formData.fechaNacimiento 
          ? (formData.fechaNacimiento instanceof Date 
              ? formData.fechaNacimiento.toISOString().split('T')[0] 
              : (typeof formData.fechaNacimiento === 'string' && formData.fechaNacimiento.trim() !== '' 
                  ? formData.fechaNacimiento 
                  : null))
          : null
      };
      
      console.log('Datos a enviar:', dataToSubmit);      // Validar que haya cambios para guardar
      const changedFields = {};
      
      // Obtener referencia a los datos de persona y cliente
      const personaData = client.persona || client;
      const clienteData = client.cliente || client;
      
      Object.keys(dataToSubmit).forEach(key => {
        // Para las fechas, convertir ambos valores a formato ISO para comparar correctamente
        if (key === 'fechaNacimiento') {
          // Buscar la fecha en diferentes ubicaciones posibles
          const originDate = personaData.fechaNacimiento || personaData.fecha_nacimiento;
          const clientDate = originDate ? new Date(originDate).toISOString().split('T')[0] : null;
          const newDate = dataToSubmit[key];
          
          console.log(`Comparando fechas - Original: ${clientDate}, Nueva: ${newDate}`);
          
          if (clientDate !== newDate) {
            changedFields[key] = newDate;
          }
          return;
        }
          // Para el género, verificar en diferentes ubicaciones posibles
        if (key === 'genero') {
          const originGenero = personaData.genero || personaData.sexo || personaData.gender;
          console.log(`Comparando géneros - Original: ${originGenero}, Nuevo: ${dataToSubmit[key]}`);
          if (dataToSubmit[key] !== originGenero) {
            changedFields[key] = dataToSubmit[key];
            console.log(`Se detectó cambio en género: ${originGenero} -> ${dataToSubmit[key]}`);
          }
          return;
        }
        
        // Para los campos relacionados con persona
        if (['nombre', 'apellidos', 'dni', 'correo', 'celular'].includes(key)) {
          // Buscar el campo en el objeto persona primero
          const originValue = personaData[key] || personaData[key.replace('correo', 'email')] || 
                             personaData[key.replace('celular', 'telefono')] || 
                             personaData[key.replace('celular', 'phone')];
          
          if (dataToSubmit[key] !== originValue) {
            changedFields[key] = dataToSubmit[key];
          }
          return;
        }
        
        // Para la dirección, buscar en ambos objetos
        if (key === 'direccion') {
          const originValue = clienteData.direccion || clienteData.address || 
                             personaData.direccion || personaData.address;
                             
          if (dataToSubmit[key] !== originValue) {
            changedFields[key] = dataToSubmit[key];
          }
          return;
        }
      });

      if (Object.keys(changedFields).length === 0) {
        toast.error('No se han realizado cambios');
        setLoading(false);
        return;
      }
      
      onSave(changedFields);
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      toast.error(error.message || 'Error al actualizar el cliente');
      setLoading(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">
            Editar Cliente
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datos personales */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Datos Personales</h3>
              
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
              </div>              <div>
                <label className="block text-sm font-medium text-gray-700">Género</label>
                <Select 
                  name="genero"
                  value={formData.genero || ''}
                  placeholder="Seleccione un género"
                  onValueChange={(value) => handleSelectChange('genero', value)}
                >
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                </Select>
              </div>
              </div>
            
            {/* Datos de contacto */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Datos de Contacto</h3>
              
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
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <TextInput
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  placeholder="Dirección"
                />
              </div>
                <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                <TextInput
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento instanceof Date 
                    ? formData.fechaNacimiento.toISOString().split('T')[0] 
                    : (typeof formData.fechaNacimiento === 'string' && formData.fechaNacimiento.trim() !== '')
                      ? formData.fechaNacimiento 
                      : ''}
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
              </div>
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

export default EditClientModal;

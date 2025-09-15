import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  TextInput,
  Textarea,
} from '@tremor/react';

const EspecialidadModal = ({ isOpen, onClose, onSave, especialidad }) => {
  const initialFormData = useMemo(() => ({
    nombre: '',
    descripcion: '',
    estado: true
  }), []);

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  useEffect(() => {
    if (especialidad) {
      setFormData({
        nombre: especialidad.nombre || '',
        descripcion: especialidad.descripcion || '',
        estado: especialidad.estado !== undefined ? especialidad.estado : true
      });
    } else {
      setFormData(initialFormData);
    }
  }, [especialidad, initialFormData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
    if (!formData.descripcion.trim()) errors.descripcion = 'La descripción es requerida';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Por favor, complete todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar la especialidad');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">
            {especialidad ? 'Editar Especialidad' : 'Nueva Especialidad'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Especialidad
            </label>
            <TextInput
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ej: Musculación, CrossFit, Yoga..."
              error={formErrors.nombre}
              className="w-full"
            />
            {formErrors.nombre && (
              <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <Textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Describe los detalles de la especialidad..."
              rows={4}
              error={formErrors.descripcion}
              className="w-full"
            />
            {formErrors.descripcion && (
              <p className="text-red-500 text-xs mt-1">{formErrors.descripcion}</p>
            )}
          </div>

          {/* Apartado de 'Especialidad activa' eliminado por solicitud */}

          <div className="flex justify-end space-x-4 pt-4 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Guardando...</span>
                </span>
              ) : especialidad ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EspecialidadModal;

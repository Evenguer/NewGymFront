
import React, { useState, useEffect } from 'react';
import { X } from 'react-feather';
import {
  Button,
  TextInput,
  Title,
} from '@tremor/react';
import { maquinariaAPI } from '../../services/maquinariaAPI';
import './modal-styles.css';

const MaquinariaModal = ({
  isOpen,
  onClose,
  pieza = null,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    stock: '',
    stockMinimo: '',
    peso: '',
    precioAlquiler: '',
    estado: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pieza) {
      setFormData({
        id: pieza.idPieza,
        nombre: pieza.nombre,
        stock: pieza.stock?.toString() || '',
        stockMinimo: pieza.stockMinimo?.toString() || '',
        peso: pieza.peso?.toString() || '',
        precioAlquiler: pieza.precioAlquiler?.toString() || '',
        estado: pieza.estado
      });
    } else {
      setFormData({
        id: null,
        nombre: '',
        stock: '',
        stockMinimo: '',
        peso: '',
        precioAlquiler: '',
        estado: true
      });
    }
  }, [pieza]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
    if (!formData.stock) errors.stock = 'El stock es requerido';
    if (!formData.stockMinimo) errors.stockMinimo = 'El stock mínimo es requerido';
    if (!formData.peso) errors.peso = 'El peso es requerido';
    if (!formData.precioAlquiler) errors.precioAlquiler = 'El precio de alquiler es requerido';
    // Validación de stock
    const stock = parseInt(formData.stock);
    const stockMinimo = parseInt(formData.stockMinimo);
    if (stock && stockMinimo && stock < stockMinimo) {
      errors.stock = 'El stock debe ser mayor o igual que el stock mínimo';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setLoading(true);
    try {
      const piezaData = {
        ...(formData.id && { idPieza: formData.id }),
        nombre: formData.nombre,
        stock: parseInt(formData.stock),
        stockMinimo: parseInt(formData.stockMinimo),
        peso: parseFloat(formData.peso),
        precioAlquiler: parseFloat(formData.precioAlquiler),
        estado: formData.estado
      };
      const response = formData.id
        ? await maquinariaAPI.actualizarPieza(piezaData)
        : await maquinariaAPI.guardarPieza(piezaData);
      if (response) {
        // Notificar al componente padre
        onSuccess(response);
        onClose();
        setFormData({ id: null, nombre: '', stock: '', stockMinimo: '', peso: '', precioAlquiler: '', estado: true });
        setFormErrors({});
      }
    } catch (error) {
      console.error('Error al guardar la pieza:', error);
      alert('Error al guardar la pieza. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormErrors({});
    setFormData({ id: null, nombre: '', stock: '', stockMinimo: '', peso: '', precioAlquiler: '', estado: true });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-container bg-black bg-opacity-50 fixed inset-0 flex items-center justify-center p-4">
      <div className="modal-content bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Title>{formData.id ? 'Editar Pieza' : 'Nueva Pieza'}</Title>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nombre de la Pieza
              </label>
              <TextInput
                name="nombre"
                placeholder="Ingrese el nombre de la pieza"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                error={formErrors.nombre}
              />
              {formErrors.nombre && (
                <span className="text-xs text-red-600">{formErrors.nombre}</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  placeholder="0"
                  min="0"
                  step="1"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2"
                  disabled={loading}
                />
                {formErrors.stock && (
                  <span className="text-xs text-red-600">{formErrors.stock}</span>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  name="stockMinimo"
                  placeholder="0"
                  min="0"
                  step="1"
                  value={formData.stockMinimo}
                  onChange={(e) => handleInputChange('stockMinimo', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2"
                  disabled={loading}
                />
                {formErrors.stockMinimo && (
                  <span className="text-xs text-red-600">{formErrors.stockMinimo}</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  name="peso"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.peso}
                  onChange={(e) => handleInputChange('peso', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2"
                  disabled={loading}
                />
                {formErrors.peso && (
                  <span className="text-xs text-red-600">{formErrors.peso}</span>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Precio de Alquiler (S/.)
                </label>
                <input
                  type="number"
                  name="precioAlquiler"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.precioAlquiler}
                  onChange={(e) => handleInputChange('precioAlquiler', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2"
                  disabled={loading}
                />
                {formErrors.precioAlquiler && (
                  <span className="text-xs text-red-600">{formErrors.precioAlquiler}</span>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Guardando...' : (formData.id ? 'Actualizar' : 'Guardar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaquinariaModal;

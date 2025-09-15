import React, { useState, useEffect } from 'react';
import { X } from 'react-feather';
import {
  Button,
  TextInput,
  Select,
  SelectItem,
  Title,
} from '@tremor/react';
import { productosAPI } from '../../services/productosAPI';
import './modal-styles.css';

const ProductoModal = ({ 
  isOpen, 
  onClose, 
  producto = null, 
  categorias = [], 
  onSuccess 
}) => {  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    precioVenta: '',
    precioCompra: '',
    stockMinimo: '',
    stockTotal: '',
    fechaVencimiento: '',
    categoria: '',
    estado: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (producto) {
      setFormData({
        id: producto.idProducto,
        nombre: producto.nombre,
        precioVenta: producto.precioVenta?.toString() || '',
        precioCompra: producto.precioCompra?.toString() || '',
        stockMinimo: producto.stockMinimo?.toString() || '',
        stockTotal: producto.stockTotal?.toString() || '',
        fechaVencimiento: producto.fechaVencimiento,
        categoria: producto.categoria?.idCategoria || null,
        estado: producto.estado
      });
    } else {
      // Reset form when adding new product
      setFormData({
        id: null,
        nombre: '',
        precioVenta: '',
        precioCompra: '',
        stockMinimo: '',
        stockTotal: '',
        fechaVencimiento: '',
        categoria: '',
        estado: true
      });
    }
  }, [producto]);

  const handleInputChange = (name, value) => {
    // Convertir strings vacíos a null para campos numéricos
    let processedValue = value;
    if (value === '' && ['precioVenta', 'precioCompra', 'stockMinimo', 'stockTotal'].includes(name)) {
      processedValue = null;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
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
    if (!formData.precioVenta) errors.precioVenta = 'El precio de venta es requerido';
    if (!formData.precioCompra) errors.precioCompra = 'El precio de compra es requerido';
    if (!formData.stockMinimo) errors.stockMinimo = 'El stock mínimo es requerido';
    if (!formData.stockTotal) errors.stockTotal = 'El stock total es requerido';
    if (!formData.categoria || formData.categoria === '') errors.categoria = 'La categoría es requerida';
    if (!formData.fechaVencimiento) errors.fechaVencimiento = 'La fecha de vencimiento es requerida';
    
    // Convertir a números para comparación
    const stockMinimo = parseInt(formData.stockMinimo);
    const stockTotal = parseInt(formData.stockTotal);
    
    if (stockTotal && stockMinimo && stockTotal < stockMinimo) {
      errors.stockTotal = 'El stock total debe ser mayor o igual que el stock mínimo';
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
      const productoData = {
        ...(formData.id && { idProducto: formData.id }),
        nombre: formData.nombre,
        precioVenta: parseFloat(formData.precioVenta),
        precioCompra: parseFloat(formData.precioCompra),
        stockMinimo: parseInt(formData.stockMinimo),
        stockTotal: parseInt(formData.stockTotal),
        fechaVencimiento: formData.fechaVencimiento,
        categoria: { idCategoria: parseInt(formData.categoria) },
        estado: formData.estado
      };      const response = formData.id
        ? await productosAPI.actualizarProducto(productoData)
        : await productosAPI.guardarProducto(productoData);
          if (response) {
        // Notificar al componente padre
        onSuccess(response);
        // Luego cerrar el modal
        onClose();
        // Finalmente limpiar el estado local
        setFormData({
          id: null,
          nombre: '',
          precioVenta: '',
          precioCompra: '',
          stockMinimo: '',
          stockTotal: '',
          fechaVencimiento: '',
          categoria: '',
          estado: true
        });
        setFormErrors({});
      }
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      alert('Error al guardar el producto. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };  const handleClose = () => {
    // Limpiar errores primero
    setFormErrors({});
    // Limpiar el formulario
    setFormData({
      id: null,
      nombre: '',
      precioVenta: '',
      precioCompra: '',
      stockMinimo: '',
      stockTotal: '',
      fechaVencimiento: '',
      categoria: '',
      estado: true
    });
    // Llamar a onClose al final
    onClose();
  };
  if (!isOpen) return null;

  return (
    <div className="modal-container bg-black bg-opacity-50 fixed inset-0 flex items-center justify-center p-4">
      <div className="modal-content bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Title>{formData.id ? 'Editar Producto' : 'Nuevo Producto'}</Title>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nombre del Producto
              </label>
              <TextInput
                name="nombre"
                placeholder="Ingrese el nombre del producto"
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
                  Precio de Venta (S/.)
                </label>
              <input
                type="number"
                name="precioVenta"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={formData.precioVenta}
                onChange={(e) => handleInputChange('precioVenta', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2"
                disabled={loading}
              />
                {formErrors.precioVenta && (
                  <span className="text-xs text-red-600">{formErrors.precioVenta}</span>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Precio de Compra (S/.)
                </label>
                <input
                  type="number"
                  name="precioCompra"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.precioCompra}
                  onChange={(e) => handleInputChange('precioCompra', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2"
                  disabled={loading}
                />
                {formErrors.precioCompra && (
                  <span className="text-xs text-red-600">{formErrors.precioCompra}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Stock Total
                </label>
                <input
                  type="number"
                  name="stockTotal"
                  placeholder="0"
                  min="0"
                  step="1"
                  value={formData.stockTotal}
                  onChange={(e) => handleInputChange('stockTotal', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2"
                  disabled={loading}
                />
                {formErrors.stockTotal && (
                  <span className="text-xs text-red-600">{formErrors.stockTotal}</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Fecha de Vencimiento
              </label>
              <TextInput
                type="date"
                name="fechaVencimiento"
                value={formData.fechaVencimiento}
                onChange={(e) => handleInputChange('fechaVencimiento', e.target.value)}
                error={formErrors.fechaVencimiento}
                min={new Date().toISOString().split('T')[0]}
              />
              {formErrors.fechaVencimiento && (
                <span className="text-xs text-red-600">{formErrors.fechaVencimiento}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Categoría
              </label>
              <Select
                value={formData.categoria || ''}
                onValueChange={(value) => handleInputChange('categoria', value)}
                placeholder="Selecciona una categoría"
                error={formErrors.categoria}
              >
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.idCategoria} value={categoria.idCategoria}>
                    {categoria.nombre}
                  </SelectItem>
                ))}
              </Select>
              {formErrors.categoria && (
                <span className="text-xs text-red-600">{formErrors.categoria}</span>
              )}
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

export default ProductoModal;
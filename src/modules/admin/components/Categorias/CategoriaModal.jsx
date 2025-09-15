import React from 'react';
import { 
  Card,
  TextInput,
  Button,
  Title,
} from '@tremor/react';
import { X } from 'react-feather';

const CategoriaModal = ({ 
  isOpen, 
  onClose, 
  formData, 
  formErrors, 
  handleInputChange, 
  handleSubmit 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <Title>{formData.id ? 'Editar Categoría' : 'Nueva Categoría'}</Title>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <TextInput
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Nombre de la categoría"
                className={formErrors.nombre ? 'border-red-500' : ''}
              />
              {formErrors.nombre && (
                <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <TextInput
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción de la categoría"
                className={formErrors.descripcion ? 'border-red-500' : ''}
              />
              {formErrors.descripcion && (
                <p className="text-red-500 text-xs mt-1">{formErrors.descripcion}</p>
              )}
            </div>
            
            <div className="flex gap-2 justify-end mt-6">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                onClick={onClose}
                disabled={formData.loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={formData.loading}
              >
                {formData.loading ? 'Guardando...' : (formData.id ? 'Actualizar' : 'Guardar')}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CategoriaModal;

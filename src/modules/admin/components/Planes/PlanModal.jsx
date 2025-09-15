import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  TextInput,
  NumberInput,
  Select,
  SelectItem,
  Textarea,
} from '@tremor/react';
import { crearPlan, actualizarPlan } from '../../../../shared/services/planAPI';

const PlanModal = ({ isOpen, onClose, onSave, plan }) => {
  const initialFormData = {
    nombre: '',
    descripcion: '',
    precio: '',
    duracion: '',
    esDiario: false,
    tipoPlan: '',
    estado: true
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [duracionEnMeses, setDuracionEnMeses] = useState('');

  useEffect(() => {
    if (plan) {
      const esDiario = plan.duracion === 1;
      const meses = esDiario ? '' : Math.floor(plan.duracion / 30);
      setDuracionEnMeses(meses.toString());
      setFormData({
        nombre: plan.nombre || '',
        descripcion: plan.descripcion || '',
        precio: plan.precio || '',
        duracion: plan.duracion || '',
        esDiario: esDiario,
        tipoPlan: plan.tipoPlan || '',
        estado: plan.estado
      });
    }
  }, [plan]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'esDiario') {
      setFormData(prev => ({
        ...prev,
        esDiario: checked,
        duracion: checked ? 1 : (duracionEnMeses ? duracionEnMeses * 30 : '')
      }));
      if (checked) {
        setDuracionEnMeses('');
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleDuracionMesesChange = (value) => {
    setDuracionEnMeses(value);
    setFormData(prev => ({
      ...prev,
      duracion: value ? value * 30 : ''
    }));
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
    if (!formData.nombre) errors.nombre = 'El nombre es requerido';
    if (!formData.precio) errors.precio = 'El precio es requerido';
    
    if (formData.esDiario) {
      if (formData.duracion !== 1) {
        errors.duracion = 'La duración para planes diarios debe ser 1 día';
      }
    } else {
      const meses = parseInt(duracionEnMeses);
      if (!meses || meses < 1 || meses > 12) {
        errors.duracion = 'La duración debe estar entre 1 y 12 meses';
      }
    }
    
    if (!formData.tipoPlan) errors.tipoPlan = 'El tipo de plan es requerido';

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
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No se ha iniciado sesión');
        return;
      }

      if (plan) {
        await actualizarPlan(plan.idPlan, formData, token);
        toast.success('Plan actualizado correctamente');
      } else {
        await crearPlan(formData, token);
        toast.success('Plan creado correctamente');
      }

      onSave();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar el plan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">
            {plan ? 'Editar Plan' : 'Nuevo Plan'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <TextInput
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Nombre del plan"
                error={formErrors.nombre}
              />
              {formErrors.nombre && (
                <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>
              )}
            </div>            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Plan</label>
              <Select
                value={formData.tipoPlan}
                onValueChange={(value) => handleSelectChange('tipoPlan', value)}
                placeholder="Seleccione el tipo"
                error={formErrors.tipoPlan}
              >
                <SelectItem value="ESTANDAR">Estándar</SelectItem>
                <SelectItem value="PREMIUM">Premium</SelectItem>
              </Select>
              {formErrors.tipoPlan && (
                <p className="text-red-500 text-xs mt-1">{formErrors.tipoPlan}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Precio (S/.)</label>
              <NumberInput
                name="precio"
                value={formData.precio}
                onValueChange={(value) => handleNumberChange('precio', value)}
                placeholder="0.00"
                error={formErrors.precio}
              />
              {formErrors.precio && (
                <p className="text-red-500 text-xs mt-1">{formErrors.precio}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Duración</label>
              <Select
                value={formData.esDiario ? 'DIARIO' : 'MENSUAL'}
                onValueChange={(value) => {
                  const esDiario = value === 'DIARIO';
                  handleInputChange({
                    target: { name: 'esDiario', type: 'checkbox', checked: esDiario }
                  });
                }}
              >
                <SelectItem value="DIARIO">Diario (1 día)</SelectItem>
                <SelectItem value="MENSUAL">Mensual</SelectItem>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {formData.esDiario ? 'Duración (Días)' : 'Duración (Meses)'}
              </label>
              <NumberInput
                value={formData.esDiario ? '1' : duracionEnMeses}
                onValueChange={(value) => {
                  if (!formData.esDiario) {
                    handleDuracionMesesChange(value);
                  }
                }}
                placeholder={formData.esDiario ? '1' : "1-12"}
                disabled={formData.esDiario}
                min={1}
                max={formData.esDiario ? 1 : 12}
                error={formErrors.duracion}
              />
              {formErrors.duracion && (
                <p className="text-red-500 text-xs mt-1">{formErrors.duracion}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <Textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción del plan"
                rows={4}
              />
            </div>

            {/* Checkbox de 'Plan activo' eliminado por solicitud */}
          </div>

          <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
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

export default PlanModal;

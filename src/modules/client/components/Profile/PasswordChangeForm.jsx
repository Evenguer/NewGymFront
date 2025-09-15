import React, { useState } from 'react';
import { Key, AlertTriangle, Eye, EyeOff, CheckCircle, XCircle, Info } from 'react-feather';

const PasswordChangeForm = ({ onSubmit, loading, onClose }) => {
  const [form, setForm] = useState({
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  });
  const [show, setShow] = useState({
    actual: false,
    nueva: false,
    confirmar: false
  });
  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState('');
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [touched, setTouched] = useState({
    contrasenaActual: false,
    nuevaContrasena: false,
    confirmarContrasena: false
  });

  // Políticas de seguridad
  const passwordPolicies = [
    {
      label: 'Mínimo 8 caracteres',
      test: (v) => v.length >= 8,
    },
    {
      label: 'Al menos una mayúscula',
      test: (v) => /[A-Z]/.test(v),
    },
    {
      label: 'Al menos una minúscula',
      test: (v) => /[a-z]/.test(v),
    },
    {
      label: 'Al menos un número',
      test: (v) => /[0-9]/.test(v),
    },
    {
      label: 'Al menos un símbolo',
      test: (v) => /[^A-Za-z0-9]/.test(v),
    },
  ];

  // Fuerza de contraseña
  const getPasswordStrength = (value) => {
    const passed = passwordPolicies.filter(p => p.test(value)).length;
    if (!value) return { level: 0, text: 'Sin contraseña', color: 'bg-gray-200', textColor: 'text-gray-500' };
    if (passed <= 2) return { level: 1, text: 'Débil', color: 'bg-red-500', textColor: 'text-red-700' };
    if (passed === 3 || passed === 4) return { level: 2, text: 'Media', color: 'bg-yellow-400', textColor: 'text-yellow-700' };
    if (passed === 5) return { level: 3, text: 'Fuerte', color: 'bg-emerald-500', textColor: 'text-emerald-700' };
    return { level: 0, text: '', color: 'bg-gray-200', textColor: 'text-gray-500' };
  };

  // Validación por campo y políticas
  const validate = (fields = form) => {
    const errs = {};
    if (!fields.contrasenaActual) errs.contrasenaActual = 'Ingrese su contraseña actual';
    if (!fields.nuevaContrasena) {
      errs.nuevaContrasena = 'Ingrese una nueva contraseña';
    } else {
      if (fields.nuevaContrasena === fields.contrasenaActual) {
        errs.nuevaContrasena = 'La nueva contraseña no puede ser igual a la actual';
      }
      // Políticas
      const failedPolicies = passwordPolicies.filter(p => !p.test(fields.nuevaContrasena));
      if (failedPolicies.length > 0) {
        errs.nuevaContrasena = 'La nueva contraseña no cumple con las políticas de seguridad.';
      }
    }
    if (!fields.confirmarContrasena) errs.confirmarContrasena = 'Confirme la nueva contraseña';
    if (
      fields.nuevaContrasena &&
      fields.confirmarContrasena &&
      fields.nuevaContrasena !== fields.confirmarContrasena
    ) {
      errs.confirmarContrasena = 'Las contraseñas no coinciden';
    }
    return errs;
  };

  // Validación en tiempo real por campo
  const handleChange = e => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(validate(updatedForm));
    setBackendError('');
    setTriedSubmit(false);
  };

  const handleBlur = e => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(validate(form));
  };

  const handleShow = (field) => {
    setShow(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setTriedSubmit(true);
    const errs = validate(form);
    setErrors(errs);
    setBackendError('');
    if (Object.keys(errs).length > 0) {
      return;
    }
    try {
      await onSubmit({
        contrasenaActual: form.contrasenaActual,
        nuevaContrasena: form.nuevaContrasena
      });
      setForm({ contrasenaActual: '', nuevaContrasena: '', confirmarContrasena: '' });
      setErrors({});
      setBackendError('');
      setTriedSubmit(false);
      setTouched({
        contrasenaActual: false,
        nuevaContrasena: false,
        confirmarContrasena: false
      });
      onClose(form.nuevaContrasena);
    } catch (err) {
      if (
        err.message &&
        (err.message.toLowerCase().includes('actual') ||
          err.message.toLowerCase().includes('incorrecta'))
      ) {
        setErrors(prev => ({
          ...prev,
          contrasenaActual: err.message
        }));
      } else {
        setBackendError(err.message || 'Error al cambiar la contraseña');
      }
    }
  };

  // Limpia los campos y errores, pero NO cierra el formulario
  const handleClean = () => {
    setForm({ contrasenaActual: '', nuevaContrasena: '', confirmarContrasena: '' });
    setErrors({});
    setBackendError('');
    setTriedSubmit(false);
    setTouched({
      contrasenaActual: false,
      nuevaContrasena: false,
      confirmarContrasena: false
    });
  };

  // Cierra el formulario (modal)
  const handleClose = () => {
    onClose();
  };

  // Mensaje general solo si intentó guardar y hay errores
  const showGeneralError = triedSubmit && Object.keys(errors).length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-[440px] relative border border-gray-100 animate-fade-in">
        {/* Botón cerrar flotante */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-red-700 transition text-2xl font-bold z-10"
          title="Cerrar"
          aria-label="Cerrar formulario"
        >
          ×
        </button>
        {/* Formulario principal compacto */}
        <div className="px-7 py-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-4">
              <label className="block text-gray-700 mb-1 font-semibold">Contraseña actual</label>
              <div className="relative group flex items-center">
                <input
                  type={show.actual ? 'text' : 'password'}
                  name="contrasenaActual"
                  value={form.contrasenaActual}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border-2 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-red-700 pr-12 text-base transition-all ${
                    errors.contrasenaActual && (touched.contrasenaActual || triedSubmit)
                      ? 'border-red-500'
                      : 'border-gray-200'
                  }`}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña actual"
                  aria-invalid={!!errors.contrasenaActual}
                  aria-describedby="error-actual"
                />
                <button type="button" className="absolute right-3 top-3 text-gray-500 focus:outline-none" tabIndex={0} aria-label={show.actual ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => handleShow('actual')}>
                  {show.actual ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {form.contrasenaActual && !errors.contrasenaActual ? <CheckCircle className="absolute right-10 top-3 text-emerald-500" size={18} /> : null}
                {form.contrasenaActual && errors.contrasenaActual ? <XCircle className="absolute right-10 top-3 text-red-500" size={18} /> : null}
              </div>
              {errors.contrasenaActual && (touched.contrasenaActual || triedSubmit) && (
                <span id="error-actual" className="text-xs text-red-500 mt-1 block">{errors.contrasenaActual}</span>
              )}
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label className="block text-gray-700 mb-1 font-semibold">Nueva contraseña</label>
                <span className="ml-2 cursor-pointer group relative">
                  <Info size={16} className="text-gray-400" />
                  <span className="absolute left-6 top-0 z-10 w-52 bg-white border border-gray-200 rounded shadow-lg p-2 text-xs text-gray-700 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                    La contraseña debe cumplir con todas las políticas de seguridad.
                  </span>
                </span>
              </div>
              <div className="relative group flex items-center mb-2">
                <input
                  type={show.nueva ? 'text' : 'password'}
                  name="nuevaContrasena"
                  value={form.nuevaContrasena}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border-2 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-red-700 pr-12 text-base transition-all ${
                    errors.nuevaContrasena && (touched.nuevaContrasena || triedSubmit)
                      ? 'border-red-500'
                      : 'border-gray-200'
                  }`}
                  autoComplete="new-password"
                  placeholder="Crea una nueva contraseña"
                  aria-invalid={!!errors.nuevaContrasena}
                  aria-describedby="error-nueva"
                />
                <button type="button" className="absolute right-2 top-2 text-gray-500 focus:outline-none" tabIndex={0} aria-label={show.nueva ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => handleShow('nueva')}>
                  {show.nueva ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {form.nuevaContrasena && !errors.nuevaContrasena ? <CheckCircle className="absolute right-8 top-2 text-emerald-500" size={16} /> : null}
                {form.nuevaContrasena && errors.nuevaContrasena ? <XCircle className="absolute right-8 top-2 text-red-500" size={16} /> : null}
              </div>
              {/* Barra de fuerza visual y texto perfectamente alineada debajo del input */}
              <div className="flex items-center gap-2 w-full mb-2">
                <div className={`h-2 rounded ${getPasswordStrength(form.nuevaContrasena).color} transition-all duration-500`} style={{ width: 'calc(100% - 70px)' }}></div>
                <span className={`text-xs font-semibold min-w-[60px] text-center ${getPasswordStrength(form.nuevaContrasena).textColor}`}>{getPasswordStrength(form.nuevaContrasena).text}</span>
              </div>
              {/* Checklist perfectamente alineado debajo de la barra */}
              <ul className="w-full grid grid-cols-1 gap-y-1 text-xs text-gray-700 mb-3">
                {passwordPolicies.map((policy, idx) => {
                  const passed = policy.test(form.nuevaContrasena);
                  return (
                    <li key={policy.label} className={`flex items-center gap-1 ${passed ? 'text-emerald-700' : 'text-gray-500'}`}>
                      {passed ? <CheckCircle size={13} /> : <XCircle size={13} />}
                      {policy.label}
                    </li>
                  );
                })}
              </ul>
              {errors.nuevaContrasena && (touched.nuevaContrasena || triedSubmit) && (
                <span id="error-nueva" className="text-xs text-red-500 mt-1 block">{errors.nuevaContrasena}</span>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1 font-semibold">Confirmar nueva contraseña</label>
              <div className="relative group flex items-center">
                <input
                  type={show.confirmar ? 'text' : 'password'}
                  name="confirmarContrasena"
                  value={form.confirmarContrasena}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border-2 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-red-700 pr-12 text-base transition-all ${
                    errors.confirmarContrasena && (touched.confirmarContrasena || triedSubmit)
                      ? 'border-red-500'
                      : 'border-gray-200'
                  }`}
                  autoComplete="new-password"
                  placeholder="Confirma la nueva contraseña"
                  aria-invalid={!!errors.confirmarContrasena}
                  aria-describedby="error-confirmar"
                />
                <button type="button" className="absolute right-3 top-3 text-gray-500 focus:outline-none" tabIndex={0} aria-label={show.confirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => handleShow('confirmar')}>
                  {show.confirmar ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {form.confirmarContrasena && !errors.confirmarContrasena ? <CheckCircle className="absolute right-10 top-3 text-emerald-500" size={18} /> : null}
                {form.confirmarContrasena && errors.confirmarContrasena ? <XCircle className="absolute right-10 top-3 text-red-500" size={18} /> : null}
              </div>
              {errors.confirmarContrasena && (touched.confirmarContrasena || triedSubmit) && (
                <span id="error-confirmar" className="text-xs text-red-500 mt-1 block">{errors.confirmarContrasena}</span>
              )}
            </div>
            {/* Mensajes de error y advertencia compactos y en una sola línea si es posible */}
            {showGeneralError && (
              <div className="flex items-center gap-2 text-red-700 bg-red-100/80 border border-red-200 rounded px-2 py-1 mb-2 text-xs font-medium flex-wrap">
                <AlertTriangle size={14} />
                <span>Corrige los campos marcados:</span>
                {errors.contrasenaActual && (
                  <span className="bg-red-200 text-red-700 px-1.5 py-0.5 rounded" title="Contraseña actual">{errors.contrasenaActual.toLowerCase().includes('incorrecta') || errors.contrasenaActual.toLowerCase().includes('inválida') ? 'Actual inválida' : errors.contrasenaActual}</span>
                )}
                {errors.nuevaContrasena && (
                  <span className="bg-red-200 text-red-700 px-1.5 py-0.5 rounded" title="Nueva contraseña">{errors.nuevaContrasena}</span>
                )}
                {errors.confirmarContrasena && (
                  <span className="bg-red-200 text-red-700 px-1.5 py-0.5 rounded" title="Confirmar nueva contraseña">{errors.confirmarContrasena}</span>
                )}
              </div>
            )}
            {backendError && (
              <div className="flex items-center gap-2 text-red-700 bg-red-100 border border-red-200 rounded px-2 py-1 mb-2 text-xs font-medium">
                <AlertTriangle size={13} />
                <span>{backendError}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 mt-6 pb-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold transition text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                onClick={handleClean}
                disabled={loading}
                aria-label="Limpiar formulario"
              >
                Limpiar
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-semibold shadow transition text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                disabled={loading}
                aria-label="Cambiar contraseña"
              >
                {loading ? 'Guardando...' : 'Cambiar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeForm;
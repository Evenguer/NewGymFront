import React from 'react';
import toast from 'react-hot-toast';

export function showConfirmDeleteToast({ message = '¿Estás seguro de que deseas eliminar?', onConfirm, onCancel }) {
  toast(
    (t) => (
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-red-700">{message}</span>
        <div className="flex gap-2 mt-2">
          <button
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-bold text-sm"
            onClick={() => {
              toast.dismiss(t.id);
              if (onConfirm) onConfirm();
            }}
          >
            Sí, eliminar
          </button>
          <button
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-bold text-sm"
            onClick={() => {
              toast.dismiss(t.id);
              if (onCancel) onCancel();
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    ),
    {
      duration: 6000,
      position: 'top-right',
      style: {
        minWidth: '260px',
        maxWidth: '320px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        padding: '18px',
        background: '#fff',
        border: '1px solid #f87171',
      },
    }
  );
}

export default showConfirmDeleteToast;

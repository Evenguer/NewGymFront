import React from 'react';
import { Eye, Edit, Trash2 } from 'react-feather';

export const ActionButtons = ({ onView, onEdit, onDelete, showView = true, showEdit = true, showDelete = true, hideText = false }) => {
  return (
    <div className="flex space-x-2 justify-start items-center">
      {showView && (
        <button
          className="px-2 py-2 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 hover:border-blue-600 bg-transparent flex items-center justify-center"
          onClick={onView}
          title="Ver detalles"
          aria-label="Ver"
        >
          <Eye size={12} />
        </button>
      )}

      {showEdit && (
        <button
          className="px-2 py-2 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 hover:border-orange-600 bg-transparent flex items-center justify-center"
          onClick={onEdit}
          title="Editar"
          aria-label="Editar"
        >
          <Edit size={12} />
        </button>
      )}

      {showDelete && (
        <button
          className="px-2 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-700 bg-transparent flex items-center justify-center"
          onClick={onDelete}
          title="Eliminar"
          aria-label="Eliminar"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
};

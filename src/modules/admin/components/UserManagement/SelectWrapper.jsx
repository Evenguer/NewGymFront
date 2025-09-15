import React from 'react';
import { Select, SelectItem, MultiSelect, MultiSelectItem } from '@tremor/react';
import ReactDOM from 'react-dom';

// Componente wrapper para Select que asegura que las opciones aparezcan correctamente
export const EnhancedSelect = ({ children, ...props }) => {
  // Usamos el componente Select normal pero aplicamos clases personalizadas
  return (
    <div className="enhanced-select-wrapper">
      <Select {...props} className={`enhanced-select ${props.className || ''}`}>
        {children}
      </Select>
    </div>
  );
};

// Componente wrapper para MultiSelect que asegura que las opciones aparezcan correctamente
export const EnhancedMultiSelect = ({ children, ...props }) => {
  // Usamos el componente MultiSelect normal pero aplicamos clases personalizadas
  return (
    <div className="enhanced-multiselect-wrapper">
      <MultiSelect {...props} className={`enhanced-multiselect ${props.className || ''}`}>
        {children}
      </MultiSelect>
    </div>
  );
};

// Exportamos también los componentes originales para facilitar el uso
export { SelectItem, MultiSelectItem };

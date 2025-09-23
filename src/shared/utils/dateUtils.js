// Función para calcular la fecha máxima permitida según la edad mínima
export const getMaxBirthDateByAge = (minAge) => {
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  return maxDate.toISOString().split('T')[0];
};

// Función para calcular la fecha máxima permitida (18 años atrás desde hoy)
export const getMaxBirthDate = () => {
  return getMaxBirthDateByAge(18);
};

// Función para validar si una persona tiene la edad mínima requerida
export const hasMinimumAge = (birthDate, minAge) => {
  if (!birthDate) return false;
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age >= minAge;
};

// Función para validar si una persona es mayor de 18 años
export const isOver18 = (birthDate) => {
  return hasMinimumAge(birthDate, 18);
};

// Función para obtener la edad mínima requerida según el rol
export const getMinimumAgeByRole = (role) => {
  switch (role?.toUpperCase()) {
    case 'CLIENTE':
      return 11;
    case 'ENTRENADOR':
    case 'RECEPCIONISTA':
      return 18;
    default:
      return 18; // Por defecto 18 años
  }
};

// Función para validar la edad según el rol
export const isValidAgeForRole = (birthDate, role) => {
  const minAge = getMinimumAgeByRole(role);
  return hasMinimumAge(birthDate, minAge);
};

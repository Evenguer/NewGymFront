// Función para calcular la fecha máxima permitida (18 años atrás desde hoy)
export const getMaxBirthDate = () => {
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return maxDate.toISOString().split('T')[0];
};

// Función para validar si una persona es mayor de 18 años
export const isOver18 = (birthDate) => {
  if (!birthDate) return false;
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age >= 18;
};

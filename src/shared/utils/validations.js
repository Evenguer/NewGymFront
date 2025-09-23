// Validación de DNI peruano (8 dígitos)
export const isValidDNI = (dni) => {
    const dniRegex = /^\d{8}$/;
    return dniRegex.test(dni);
};

// Validación de número de celular peruano (9 dígitos comenzando con 9)
export const isValidPhone = (phone) => {
    const phoneRegex = /^9\d{8}$/;
    return phoneRegex.test(phone);
};

// Validación de RUC peruano (11 dígitos comenzando con 10 o 20)
export const isValidRUC = (ruc) => {
    const rucRegex = /^(10|20)\d{9}$/;
    return rucRegex.test(ruc);
};

// Validación de contraseña segura
// - Al menos 8 caracteres
// - Al menos una letra mayúscula
// - Al menos una letra minúscula
// - Al menos un número
// - Al menos un carácter especial
export const isStrongPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

// Validación de correo electrónico
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validación de nombre de usuario (letras, números y guiones bajos, 4-20 caracteres)
export const isValidUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
    return usernameRegex.test(username);
};

// Validación de edad mínima según el rol
export const isValidAgeForRole = (birthDate, role) => {
    if (!birthDate) return false;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    // Definir edad mínima según el rol
    const minAge = getMinimumAgeByRole(role);
    return age >= minAge;
};

// Función para obtener la edad mínima según el rol
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

// Validación de edad mínima (18 años) - mantenida por compatibilidad
export const isOver18 = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        return age - 1 >= 18;
    }
    
    return age >= 18;
};

// Validación de nombres y apellidos (solo letras y espacios, mínimo 2 caracteres)
export const isValidName = (name) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;
    return nameRegex.test(name);
};

// Validación de salario (número positivo con hasta 2 decimales)
export const isValidSalary = (salary) => {
    const salaryRegex = /^\d+(\.\d{1,2})?$/;
    return salaryRegex.test(salary) && parseFloat(salary) > 0;
};

// Validación de cupo máximo (número entero positivo)
export const isValidMaxQuota = (quota) => {
    const quotaNumber = parseInt(quota);
    return Number.isInteger(quotaNumber) && quotaNumber > 0 && quotaNumber <= 100;
};

// Función para obtener el mensaje de error de edad según el rol
export const getAgeErrorMessage = (role) => {
    const minAge = getMinimumAgeByRole(role);
    switch (role?.toUpperCase()) {
        case 'CLIENTE':
            return `Debe tener al menos ${minAge} años para registrarse como cliente.`;
        case 'ENTRENADOR':
            return `Debe tener al menos ${minAge} años para registrarse como entrenador.`;
        case 'RECEPCIONISTA':
            return `Debe tener al menos ${minAge} años para registrarse como recepcionista.`;
        default:
            return `Debe tener al menos ${minAge} años para registrarse.`;
    }
};

// Mensajes de error personalizados
export const ERROR_MESSAGES = {
    dni: 'El DNI debe tener exactamente 8 dígitos.',
    phone: 'El celular debe tener 9 dígitos y comenzar con 9.',
    ruc: 'El RUC debe tener 11 dígitos y comenzar con 10 o 20.',
    password: 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.',
    email: 'Por favor ingrese un correo electrónico válido.',
    username: 'El nombre de usuario debe tener entre 4 y 20 caracteres, solo puede contener letras, números y guiones bajos.',
    age: 'Debe ser mayor de 18 años para registrarse.',
    name: 'Solo se permiten letras y espacios, mínimo 2 caracteres.',
    salary: 'Ingrese un salario válido (número positivo con hasta 2 decimales).',
    maxQuota: 'El cupo máximo debe ser un número entero entre 1 y 100.',
};

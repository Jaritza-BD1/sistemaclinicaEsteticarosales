// front-end/src/services/validationSchemas.js
import * as Yup from 'yup';

// Esquemas base reutilizables
const baseFields = {
  email: Yup.string()
    .email('Correo electrónico inválido')
    .required('El correo electrónico es obligatorio'),
  
  phone: Yup.string()
    .matches(/^[+]?[0-9\s\-()]{8,15}$/, 'Formato de teléfono inválido')
    .required('El teléfono es obligatorio'),
  
  identity: Yup.string()
    .matches(/^[0-9]{13}$/, 'La identidad debe tener 13 dígitos')
    .required('La identidad es obligatoria'),
  
  password: Yup.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número')
    .required('La contraseña es obligatoria'),
  
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
  
  name: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .required('El nombre es obligatorio'),
  
  lastName: Yup.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .required('El apellido es obligatorio'),
  
  birthDate: Yup.date()
    .max(new Date(), 'La fecha no puede ser futura')
    .required('La fecha de nacimiento es obligatoria'),
  
  gender: Yup.string()
    .oneOf(['Masculino', 'Femenino', 'Otro'], 'Selecciona un género válido')
    .required('El género es obligatorio')
};

// Esquema de prueba simple
export const testSchema = Yup.object({
  nombre: Yup.string().required('El nombre es obligatorio')
});

// Esquema para el formulario de registro de pacientes (nombres de campos del formulario)
export const patientRegistrationSchema = Yup.object().shape({
  // Campos del primer paso
  nombre: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .required('El nombre es obligatorio'),
  
  apellido: Yup.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .required('El apellido es obligatorio'),
  
  fechaNacimiento: Yup.date()
    .max(new Date(), 'La fecha no puede ser futura')
    .required('La fecha de nacimiento es obligatoria'),
  
  identidad: Yup.string()
    .matches(/^[0-9]{13}$/, 'La identidad debe tener 13 dígitos')
    .required('La identidad es obligatoria'),
  
  numeroExpediente: Yup.string()
    .matches(/^[0-9]+$/, 'El número de expediente debe ser numérico')
    .required('El número de expediente es obligatorio'),
  
  genero: Yup.number()
    .oneOf([1, 2, 3], 'Selecciona un género válido')
    .required('El género es obligatorio'),
  
  // Campos opcionales para evitar errores
  telefonos: Yup.array().of(
    Yup.object().shape({
      id: Yup.number().required(),
      telefono: Yup.string()
        .matches(/^[+]?[0-9\s\-()]{8,15}$/, 'Formato de teléfono inválido')
        .required('El teléfono es obligatorio')
    })
  ).optional(),
  
  direcciones: Yup.array().of(
    Yup.object().shape({
      id: Yup.number().required(),
      direccion: Yup.string()
        .min(10, 'La dirección debe tener al menos 10 caracteres')
        .required('La dirección es obligatoria')
    })
  ).optional(),
  
  correos: Yup.array().of(
    Yup.object().shape({
      id: Yup.number().required(),
      correo: Yup.string()
        .email('Correo electrónico inválido')
        .required('El correo electrónico es obligatorio')
    })
  ).optional(),
  
  alergias: Yup.array().of(
    Yup.object().shape({
      id: Yup.number().required(),
      alergia: Yup.string()
        .min(2, 'La alergia debe tener al menos 2 caracteres')
        .required('La alergia es obligatoria')
    })
  ).optional(),
  
  vacunas: Yup.array().of(
    Yup.object().shape({
      id: Yup.number().required(),
      vacuna: Yup.string()
        .min(2, 'La vacuna debe tener al menos 2 caracteres')
        .required('La vacuna es obligatoria'),
      fechaVacunacion: Yup.date()
        .max(new Date(), 'La fecha no puede ser futura')
        .required('La fecha de vacunación es obligatoria')
    })
  ).optional()
});

// Esquema para usuarios
export const userSchema = Yup.object({
  username: Yup.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(30, 'El nombre de usuario no puede exceder 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guiones bajos')
    .required('El nombre de usuario es obligatorio'),
  
  email: baseFields.email,
  
  nombre: baseFields.name,
  apellido: baseFields.lastName,
  telefono: baseFields.phone,
  
  rol: Yup.string()
    .oneOf(['admin', 'medico', 'recepcionista', 'usuario'], 'Selecciona un rol válido')
    .required('El rol es obligatorio'),
  
  activo: Yup.boolean(),
  
  password: Yup.string()
    .when('$isEditing', {
      is: true,
      then: Yup.string().optional(),
      otherwise: baseFields.password
    }),
  
  confirmPassword: Yup.string()
    .when('password', {
      is: (password) => password && password.length > 0,
      then: baseFields.confirmPassword,
      otherwise: Yup.string().optional()
    }),
  
  dos_fa_enabled: Yup.boolean()
});

// Esquema para pacientes (para la API)
export const patientSchema = Yup.object({
  atr_nombre: baseFields.name,
  atr_apellido: baseFields.lastName,
  atr_fecha_nacimiento: baseFields.birthDate,
  atr_identidad: baseFields.identity,
  atr_numero_expediente: Yup.string()
    .matches(/^[0-9]+$/, 'El número de expediente debe ser numérico')
    .required('El número de expediente es obligatorio'),
  atr_id_genero: Yup.number()
    .oneOf([1, 2, 3], 'Selecciona un género válido')
    .required('El género es obligatorio'),
  
  // Arrays dinámicos
  telefonos: Yup.array().of(
    Yup.object({
      id: Yup.number().required(),
      atr_telefono: baseFields.phone
    })
  ).min(1, 'Al menos un teléfono es requerido'),
  
  direcciones: Yup.array().of(
    Yup.object({
      id: Yup.number().required(),
      atr_direccion_completa: Yup.string()
        .min(10, 'La dirección debe tener al menos 10 caracteres')
        .required('La dirección es obligatoria')
    })
  ).min(1, 'Al menos una dirección es requerida'),
  
  correos: Yup.array().of(
    Yup.object({
      id: Yup.number().required(),
      atr_correo: baseFields.email
    })
  ).min(1, 'Al menos un correo es requerido'),
  
  alergias: Yup.array().of(
    Yup.object({
      id: Yup.number().required(),
      atr_alergia: Yup.string()
        .min(2, 'La alergia debe tener al menos 2 caracteres')
        .required('La alergia es obligatoria')
    })
  ),
  
  vacunas: Yup.array().of(
    Yup.object({
      id: Yup.number().required(),
      atr_vacuna: Yup.string()
        .min(2, 'La vacuna debe tener al menos 2 caracteres')
        .required('La vacuna es obligatoria'),
      atr_fecha_vacunacion: Yup.date()
        .max(new Date(), 'La fecha no puede ser futura')
        .required('La fecha de vacunación es obligatoria')
    })
  )
});

// Esquema para médicos
export const doctorSchema = Yup.object({
  atr_nombre: baseFields.name,
  atr_apellido: baseFields.lastName,
  atr_fecha_nacimiento: baseFields.birthDate,
  atr_identidad: baseFields.identity,
  atr_id_genero: Yup.number()
    .oneOf([1, 2, 3], 'Selecciona un género válido')
    .required('El género es obligatorio'),
  
  atr_numero_colegiado: Yup.string()
    .matches(/^[0-9]+$/, 'El número de colegiado debe ser numérico')
    .required('El número de colegiado es obligatorio'),
  
  atr_id_tipo_medico: Yup.number()
    .oneOf([1, 2, 3, 4], 'Selecciona un tipo de médico válido')
    .required('El tipo de médico es obligatorio'),
  
  // Arrays dinámicos
  telefonos: Yup.array().of(
    Yup.object({
      id: Yup.number().required(),
      atr_telefono: baseFields.phone
    })
  ).min(1, 'Al menos un teléfono es requerido'),
  
  direcciones: Yup.array().of(
    Yup.object({
      id: Yup.number().required(),
      atr_direccion_completa: Yup.string()
        .min(10, 'La dirección debe tener al menos 10 caracteres')
        .required('La dirección es obligatoria')
    })
  ).min(1, 'Al menos una dirección es requerida'),
  
  correos: Yup.array().of(
    Yup.object({
      id: Yup.number().required(),
      atr_correo: baseFields.email
    })
  ).min(1, 'Al menos un correo es requerido'),
  
  especialidades: Yup.array().of(
    Yup.object({
      id: Yup.number().required(),
      atr_especialidad: Yup.string()
        .min(2, 'La especialidad debe tener al menos 2 caracteres')
        .required('La especialidad es obligatoria')
    })
  ).min(1, 'Al menos una especialidad es requerida')
});

// Esquema para citas
export const appointmentSchema = Yup.object({
  motivo: Yup.string()
    .min(5, 'El motivo debe tener al menos 5 caracteres')
    .max(200, 'El motivo no puede exceder 200 caracteres')
    .required('El motivo de la cita es obligatorio'),
  
  fecha: Yup.date()
    .min(new Date(), 'La fecha debe ser futura')
    .required('La fecha es obligatoria'),
  
  hora: Yup.string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
    .required('La hora es obligatoria'),
  
  estado: Yup.string()
    .oneOf(['PROGRAMADA', 'CONFIRMADA', 'EN_CONSULTA', 'PENDIENTE_PAGO', 'FINALIZADA', 'CANCELADA', 'NO_ASISTIO'], 'Estado inválido')
    .required('El estado es obligatorio'),
  
  pacienteId: Yup.number()
    .required('El paciente es obligatorio'),
  
  medicoId: Yup.number()
    .required('El médico es obligatorio'),
  
  tipoCitaId: Yup.number()
    .required('El tipo de cita es obligatorio')
});

// Esquema para productos farmacéuticos
export const productSchema = Yup.object({
  name: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .required('El nombre del producto es obligatorio'),
  
  code: Yup.string()
    .matches(/^[A-Z0-9]+$/, 'El código debe contener solo letras mayúsculas y números')
    .required('El código del producto es obligatorio'),
  
  quantity: Yup.number()
    .min(0, 'La cantidad no puede ser negativa')
    .required('La cantidad es obligatoria'),
  
  price: Yup.number()
    .min(0, 'El precio no puede ser negativo')
    .required('El precio es obligatorio'),
  
  description: Yup.string()
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  
  category: Yup.string()
    .required('La categoría es obligatoria'),
  
  supplier: Yup.string()
    .required('El proveedor es obligatorio'),
  
  expiration_date: Yup.date()
    .min(new Date(), 'La fecha de vencimiento debe ser futura')
    .required('La fecha de vencimiento es obligatoria'),
  
  min_stock: Yup.number()
    .min(0, 'El stock mínimo no puede ser negativo')
    .required('El stock mínimo es obligatorio'),
  
  max_stock: Yup.number()
    .min(Yup.ref('min_stock'), 'El stock máximo debe ser mayor al mínimo')
    .required('El stock máximo es obligatorio'),
  
  unit: Yup.string()
    .required('La unidad es obligatoria'),
  
  prescription_required: Yup.boolean()
});

// Esquema para tratamientos
export const treatmentSchema = Yup.object({
  nombre_tratamiento: Yup.string()
    .min(3, 'El nombre del tratamiento debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .required('El nombre del tratamiento es obligatorio'),
  
  descripcion: Yup.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .required('La descripción es obligatoria'),
  
  tipo_tratamiento: Yup.string()
    .oneOf([
      'Fisioterapia', 'Farmacológico', 'Quirúrgico', 'Psicoterapia',
      'Rehabilitación', 'Terapia Ocupacional', 'Terapia del Lenguaje',
      'Terapia Respiratoria', 'Terapia Cardiaca', 'Terapia Neurológica', 'Otro'
    ], 'Tipo de tratamiento inválido')
    .required('El tipo de tratamiento es obligatorio'),
  
  duracion: Yup.string()
    .required('La duración es obligatoria'),
  
  frecuencia: Yup.string()
    .required('La frecuencia es obligatoria'),
  
  costo: Yup.number()
    .min(0, 'El costo no puede ser negativo')
    .required('El costo es obligatorio'),
  
  paciente: Yup.string()
    .required('El paciente es obligatorio'),
  
  medico: Yup.string()
    .required('El médico es obligatorio'),
  
  fecha_inicio: Yup.date()
    .min(new Date(), 'La fecha de inicio debe ser futura')
    .required('La fecha de inicio es obligatoria'),
  
  fecha_fin: Yup.date()
    .min(Yup.ref('fecha_inicio'), 'La fecha de fin debe ser posterior a la fecha de inicio')
    .required('La fecha de fin es obligatoria'),
  
  observaciones: Yup.string()
    .max(1000, 'Las observaciones no pueden exceder 1000 caracteres'),
  
  estado: Yup.string()
    .oneOf(['activo', 'pendiente', 'completado', 'cancelado', 'suspendido'], 'Estado inválido')
    .required('El estado es obligatorio')
});

// Esquema para perfil de usuario
export const profileSchema = Yup.object({
  username: Yup.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(30, 'El nombre de usuario no puede exceder 30 caracteres')
    .required('El nombre de usuario es obligatorio'),
  
  email: baseFields.email,
  phone: baseFields.phone,
  
  currentPassword: Yup.string()
    .when('changePassword', {
      is: true,
      then: Yup.string().required('La contraseña actual es obligatoria'),
    }),
  
  newPassword: Yup.string()
    .when('changePassword', {
      is: true,
      then: baseFields.password,
    }),
  
  confirmPassword: Yup.string()
    .when('changePassword', {
      is: true,
      then: baseFields.confirmPassword,
    }),
  
  changePassword: Yup.boolean(),
  dos_fa_enabled: Yup.boolean(),
  
  notifications: Yup.object({
    email: Yup.boolean(),
    sms: Yup.boolean(),
    push: Yup.boolean()
  })
});

// Exportar todos los esquemas
const validationSchemas = {
  userSchema,
  patientSchema,
  doctorSchema,
  appointmentSchema,
  productSchema,
  treatmentSchema,
  profileSchema,
  baseFields,
  patientRegistrationSchema,
  testSchema
};

export default validationSchemas; 
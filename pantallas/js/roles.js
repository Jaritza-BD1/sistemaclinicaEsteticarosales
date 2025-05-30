// Definición de roles y permisos
const ROLES = {
    ADMIN: {
        id: 1,
        name: 'Administrador',
        permissions: {
            userManagement: true,
            createUsers: true,
            editUsers: true,
            deleteUsers: true,
            resetPasswords: true,
            viewAllPatients: true,
            viewAllMedicalRecords: true
        }
    },
    DOCTOR: {
        id: 2,
        name: 'Médico',
        permissions: {
            userManagement: false,
            createUsers: false,
            editUsers: false,
            deleteUsers: false,
            resetPasswords: false,
            viewAllPatients: true,
            viewAllMedicalRecords: true,
            createMedicalRecords: true,
            editMedicalRecords: true
        }
    },
    ASSISTANT: {
        id: 3,
        name: 'Asistente Médico',
        permissions: {
            userManagement: true,
            createUsers: true,
            editUsers: false,
            deleteUsers: false,
            resetPasswords: true,
            viewAllPatients: true,
            viewAllMedicalRecords: false,
            createMedicalRecords: false,
            editMedicalRecords: false,
            scheduleAppointments: true
        }
    }
};

// Configuración de parámetros del sistema
const SYSTEM_PARAMS = {
    ADMIN_DAYS_VALIDITY: 360,
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 20,
    USERNAME_MAX_LENGTH: 30,
    FULLNAME_MAX_LENGTH: 100
};

// Estados de usuario
const USER_STATUS = {
    NEW: 'new',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BLOCKED: 'blocked',
    VACATION: 'vacation'
};

// Mapeo de estados a nombres legibles
const USER_STATUS_NAMES = {
    [USER_STATUS.NEW]: 'Nuevo',
    [USER_STATUS.ACTIVE]: 'Activo',
    [USER_STATUS.INACTIVE]: 'Inactivo',
    [USER_STATUS.BLOCKED]: 'Bloqueado',
    [USER_STATUS.VACATION]: 'Vacaciones'
};
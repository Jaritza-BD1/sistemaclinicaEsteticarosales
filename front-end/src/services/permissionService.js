// front-end/src/services/permissionService.js
import { validatePermissions } from './securityService';

// Definición de roles y permisos
const ROLES = {
  ADMIN: 1,
  DOCTOR: 2,
  NURSE: 3,
  RECEPTIONIST: 4,
  PHARMACIST: 5,
  PATIENT: 6
};

const PERMISSIONS = {
  // Gestión de usuarios
  'users:read': [ROLES.ADMIN],
  'users:write': [ROLES.ADMIN],
  'users:delete': [ROLES.ADMIN],
  
  // Gestión de pacientes
  'patients:read': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST],
  'patients:write': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST],
  'patients:delete': [ROLES.ADMIN],
  
  // Gestión de médicos
  'doctors:read': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST],
  'doctors:write': [ROLES.ADMIN],
  'doctors:delete': [ROLES.ADMIN],
  
  // Gestión de citas
  'appointments:read': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST],
  'appointments:write': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST],
  'appointments:delete': [ROLES.ADMIN, ROLES.DOCTOR],
  
  // Gestión de exámenes
  'exams:read': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE],
  'exams:write': [ROLES.ADMIN, ROLES.DOCTOR],
  'exams:delete': [ROLES.ADMIN, ROLES.DOCTOR],
  
  // Gestión de tratamientos
  'treatments:read': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE],
  'treatments:write': [ROLES.ADMIN, ROLES.DOCTOR],
  'treatments:delete': [ROLES.ADMIN, ROLES.DOCTOR],
  
  // Gestión de farmacia
  'products:read': [ROLES.ADMIN, ROLES.PHARMACIST, ROLES.DOCTOR],
  'products:write': [ROLES.ADMIN, ROLES.PHARMACIST],
  'products:delete': [ROLES.ADMIN, ROLES.PHARMACIST],
  
  // Reportes y estadísticas
  'reports:read': [ROLES.ADMIN, ROLES.DOCTOR],
  'reports:write': [ROLES.ADMIN],
  
  // Configuración del sistema
  'settings:read': [ROLES.ADMIN],
  'settings:write': [ROLES.ADMIN],
  
  // Bitácora y auditoría
  'audit:read': [ROLES.ADMIN],
  'audit:write': [ROLES.ADMIN]
};

// Funciones de validación de permisos
export const hasPermission = (user, permission) => {
  if (!user || !user.atr_id_rol) return false;
  
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(user.atr_id_rol);
};

export const hasAnyPermission = (user, permissions) => {
  return permissions.some(permission => hasPermission(user, permission));
};

export const hasAllPermissions = (user, permissions) => {
  return permissions.every(permission => hasPermission(user, permission));
};

// Funciones para componentes
export const withPermission = (Component, requiredPermission) => {
  return (props) => {
    const { user } = useAuth();
    
    if (!hasPermission(user, requiredPermission)) {
      return <PermissionDenied />;
    }
    
    return <Component {...props} />;
  };
};

export const withAnyPermission = (Component, requiredPermissions) => {
  return (props) => {
    const { user } = useAuth();
    
    if (!hasAnyPermission(user, requiredPermissions)) {
      return <PermissionDenied />;
    }
    
    return <Component {...props} />;
  };
};

// Hook para permisos
export const usePermissions = () => {
  const { user } = useAuth();
  
  return {
    hasPermission: (permission) => hasPermission(user, permission),
    hasAnyPermission: (permissions) => hasAnyPermission(user, permissions),
    hasAllPermissions: (permissions) => hasAllPermissions(user, permissions),
    userRole: user?.atr_id_rol,
    isAdmin: user?.atr_id_rol === ROLES.ADMIN,
    isDoctor: user?.atr_id_rol === ROLES.DOCTOR,
    isNurse: user?.atr_id_rol === ROLES.NURSE,
    isReceptionist: user?.atr_id_rol === ROLES.RECEPTIONIST,
    isPharmacist: user?.atr_id_rol === ROLES.PHARMACIST
  };
};

// Componente de acceso denegado
const PermissionDenied = () => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h6" color="error" gutterBottom>
      Acceso Denegado
    </Typography>
    <Typography variant="body2" color="text.secondary">
      No tienes permisos para acceder a esta funcionalidad.
    </Typography>
  </Box>
);

export default {
  ROLES,
  PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  withPermission,
  withAnyPermission,
  usePermissions
}; 
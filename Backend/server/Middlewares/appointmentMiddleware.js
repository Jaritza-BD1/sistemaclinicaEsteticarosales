// appointmentMiddleware.js

// Middleware para verificar si el usuario tiene permiso para acceder a rutas de appointments
// Puedes personalizar la lógica según los roles o reglas de negocio que necesites

function authorizeAppointment(req, res, next) {
  // Verificar si el usuario está autenticado
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  // Verificar si el usuario tiene un rol válido para appointments
  // Asumiendo que req.user.atr_id_rol contiene el ID del rol
  const userRole = req.user.atr_id_rol;
  
  // Permitir acceso a usuarios con rol 1 (admin) y rol 2 (usuario normal)
  // Ajusta estos números según tu estructura de roles
  if (userRole !== 1 && userRole !== 2) {
    return res.status(403).json({ 
      error: 'No autorizado para acceder a appointments',
      requiredRole: 'Usuario o Administrador'
    });
  }

  // Agregar información del usuario al request para uso posterior
  req.appointmentUser = {
    id: req.user.id,
    role: userRole,
    username: req.user.username || req.user.atr_usuario
  };

  next();
}

module.exports = {
  authorizeAppointment
}; 
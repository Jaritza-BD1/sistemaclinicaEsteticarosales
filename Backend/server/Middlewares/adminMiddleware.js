const adminMiddleware = (req, res, next) => {
  try {
    // Verificar que el usuario existe en el request (añadido por authMiddleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Verificar que el usuario tiene rol de administrador
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verificando permisos de administrador'
    });
  }
};

module.exports = adminMiddleware; 
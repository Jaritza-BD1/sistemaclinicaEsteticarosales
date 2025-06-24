// En tus controladores o servicios
const BitacoraHelper = require('../helpers/bitacoraHelper');

// Ejemplo en un middleware de autenticación
async function login(req, res, next) {
    try {
        // Lógica de autenticación...
        
        // Registrar en bitácora
        await BitacoraHelper.registrarEvento({
            usuarioId: user.id,
            objetoId: 1, // ID del objeto "Login"
            accion: 'Ingreso',
            descripcion: 'Inicio de sesión exitoso',
            ip: req.ip
        });
        
        next();
    } catch (error) {
        next(error);
    }
}
// En tus controladores o servicios
const BitacoraHelper = require('../helpers/bitacoraHelper');

// Ejemplo en un middleware de autenticación
async function login(req, res, next) {
    try {
        // Lógica de autenticación...
        
        // Registrar en bitácora
        await BitacoraHelper.registrarEvento({
            atr_id_usuario: user.id,
            atr_id_objetos: 1, // ID del objeto "Login"
            atr_accion: 'Ingreso',
            atr_descripcion: 'Inicio de sesión exitoso',
            ip_origen: req.ip
        });
        
        next();
    } catch (error) {
        next(error);
    }
}
// controllers/userController.js
const { logError } = require('../helpers/errorHelper');

async function getUser(req, res) {
    try {
        // Lógica del controlador...
    } catch (error) {
        logError('Error al obtener usuario', {
            stack: error.stack,
            endpoint: '/api/users',
            userId: req.user.id,
            ip: req.ip
        });
        
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
}
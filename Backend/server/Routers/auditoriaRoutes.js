const express = require('express');
const router = express.Router();
const BitacoraService = require('../services/bitacoraService');
const { authenticate } = require('../Middlewares/authMiddleware');

// Proteger todas las rutas de auditoría con autenticación
router.use(authenticate);

// Ruta para obtener registros de bitácora
router.get('/auditoria', async (req, res) => {
    try {
        const eventos = await BitacoraService.obtenerEventos({
            fechaInicio: req.query.desde,
            fechaFin: req.query.hasta,
            limit: parseInt(req.query.limit) || 50
        });
        
        res.json(eventos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
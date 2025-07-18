const express = require('express');
const router = express.Router();
const bitacoraController = require('../Controllers/BitacoraController'); // Asegúrate de la ruta correcta

// Ruta para registrar un evento en la bitácora
router.post('/bitacora/registrar', async (req, res) => {
    const { accion, descripcion, idUsuario, idObjeto } = req.body;
    const result = await bitacoraController.registrarEventoBitacora(accion, descripcion, idUsuario, idObjeto);
    if (result.success) {
        return res.status(201).json(result);
    } else {
        return res.status(500).json(result);
    }
});

// Ruta para consultar eventos de la bitácora
router.get('/bitacora/consultar', async (req, res) => {
    const filtros = req.query; // Los filtros se pasarían como parámetros de consulta (ej: /bitacora/consultar?idUsuario=1&accion=Ingreso)
    const result = await bitacoraController.consultarBitacora(filtros);
    if (result.success) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
});

module.exports = router;
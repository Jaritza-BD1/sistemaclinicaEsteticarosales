// Ruta para obtener registros de bitácora
router.get('/auditoria', async (req, res) => {
    try {
        const eventos = await BitacoraHelper.obtenerEventos({
            fechaInicio: req.query.desde,
            fechaFin: req.query.hasta,
            limit: parseInt(req.query.limit) || 50
        });
        
        res.json(eventos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
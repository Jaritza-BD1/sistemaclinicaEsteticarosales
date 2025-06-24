const express = require('express');
const router = express.Router();

// Importar funciones del controlador admin
const { blockUser, resetUserPassword, listLogs, deleteLogEntry } = require('../controllers/adminController');

// Bloquear a un usuario por ID (usar función del controlador como middleware)
router.post('/users/:id/block', blockUser);

// Reiniciar la contraseña de un usuario por ID (usar función del controlador como middleware)
router.put('/users/:id/resetpassword', resetUserPassword);

// Listar todas las entradas de bitácora (logs)
router.get('/logs', listLogs);

// Eliminar una entrada de bitácora por ID
router.delete('/logs/:id', deleteLogEntry);

// Manejador para rutas no encontradas dentro de admin (evita usar comodín '*' directo en Express 5)
router.use((req, res) => {
  res.status(404).send('Ruta no encontrada');
});

module.exports = router;




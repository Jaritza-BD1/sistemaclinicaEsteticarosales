const express = require('express');
const router = express.Router();
const generoController = require('../Controllers/generoController');

router.get('/', generoController.list);
router.get('/:id', generoController.getById);

module.exports = router;

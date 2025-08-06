// backend/server/controllers/ObjetoController.js
const ObjetoService = require('../services/ObjetoService');
const ResponseService = require('../services/responseService');
const logger = require('../utils/logger');
const { generateError } = require('../Middlewares/errorHandler');

class ObjetoController {
    /**
     * Obtiene todos los objetos con paginación.
     * GET /api/objetos
     */
    static async getAllObjetos(req, res, next) {
        try {
            const filters = {
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 10,
                search: req.query.search
            };

            const result = await ObjetoService.getAllObjetos(filters);
            logger.api('ObjetoController: Objetos consultados con paginación.');
            return ResponseService.success(res, result.data, 'Objetos obtenidos exitosamente', 200, result.meta);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene un objeto por su ID.
     * GET /api/objetos/:id
     */
    static async getObjetoById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return ResponseService.badRequest(res, 'ID de objeto inválido');
            }

            const objeto = await ObjetoService.getObjetoById(id);
            logger.api(`ObjetoController: Objeto ${id} consultado.`);
            return ResponseService.success(res, objeto, 'Objeto obtenido exitosamente');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Crea un nuevo objeto.
     * POST /api/objetos
     */
    static async createObjeto(req, res, next) {
        try {
            const { atr_objeto, atr_descripcion, atr_tipo_objeto } = req.body;
            const createdBy = req.user.atr_usuario;

            if (!atr_objeto || !atr_descripcion) {
                return ResponseService.badRequest(res, 'Nombre y descripción del objeto son obligatorios');
            }

            const newObjeto = await ObjetoService.createObjeto({
                atr_objeto,
                atr_descripcion,
                atr_tipo_objeto
            }, createdBy);

            logger.api(`ObjetoController: Objeto ${newObjeto.atr_objeto} creado por ${createdBy}.`);
            return ResponseService.success(res, newObjeto, 'Objeto creado exitosamente', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Actualiza un objeto existente.
     * PUT /api/objetos/:id
     */
    static async updateObjeto(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return ResponseService.badRequest(res, 'ID de objeto inválido');
            }

            const { atr_objeto, atr_descripcion, atr_tipo_objeto } = req.body;
            const modifiedBy = req.user.atr_usuario;

            if (!atr_objeto || !atr_descripcion) {
                return ResponseService.badRequest(res, 'Nombre y descripción del objeto son obligatorios');
            }

            const updatedObjeto = await ObjetoService.updateObjeto(id, {
                atr_objeto,
                atr_descripcion,
                atr_tipo_objeto
            }, modifiedBy);

            logger.api(`ObjetoController: Objeto ${id} actualizado por ${modifiedBy}.`);
            return ResponseService.success(res, updatedObjeto, 'Objeto actualizado exitosamente');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Elimina un objeto.
     * DELETE /api/objetos/:id
     */
    static async deleteObjeto(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return ResponseService.badRequest(res, 'ID de objeto inválido');
            }

            const deletedBy = req.user.atr_usuario;
            const result = await ObjetoService.deleteObjeto(id, deletedBy);

            logger.api(`ObjetoController: Objeto ${id} eliminado por ${deletedBy}.`);
            return ResponseService.success(res, result, 'Objeto eliminado exitosamente');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ObjetoController;
// backend/server/controllers/RolController.js
const RolService = require('../services/RolService');
const ResponseService = require('../services/responseService');
const logger = require('../utils/logger');
const { generateError } = require('../Middlewares/errorHandler');

class RolController {
    /**
     * Obtiene todos los roles con paginación.
     * GET /api/roles
     */
    static async getAllRoles(req, res, next) {
        try {
            const filters = {
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 10,
                search: req.query.search
            };

            const result = await RolService.getAllRoles(filters);
            logger.api('RolController: Roles consultados con paginación.');
            return ResponseService.success(res, result.data, 'Roles obtenidos exitosamente', 200, result.meta);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene un rol por su ID.
     * GET /api/roles/:id
     */
    static async getRolById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return ResponseService.badRequest(res, 'ID de rol inválido');
            }

            const rol = await RolService.getRolById(id);
            logger.api(`RolController: Rol ${id} consultado.`);
            return ResponseService.success(res, rol, 'Rol obtenido exitosamente');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Crea un nuevo rol.
     * POST /api/roles
     */
    static async createRol(req, res, next) {
        try {
            const { atr_rol, atr_descripcion } = req.body;
            const createdBy = req.user.atr_usuario;

            if (!atr_rol || !atr_descripcion) {
                return ResponseService.badRequest(res, 'Nombre y descripción del rol son obligatorios');
            }

            const newRol = await RolService.createRol({
                atr_rol,
                atr_descripcion
            }, createdBy);

            logger.api(`RolController: Rol ${newRol.atr_rol} creado por ${createdBy}.`);
            return ResponseService.success(res, newRol, 'Rol creado exitosamente', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Actualiza un rol existente.
     * PUT /api/roles/:id
     */
    static async updateRol(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return ResponseService.badRequest(res, 'ID de rol inválido');
            }

            const { atr_rol, atr_descripcion } = req.body;
            const modifiedBy = req.user.atr_usuario;

            if (!atr_rol || !atr_descripcion) {
                return ResponseService.badRequest(res, 'Nombre y descripción del rol son obligatorios');
            }

            const updatedRol = await RolService.updateRol(id, {
                atr_rol,
                atr_descripcion
            }, modifiedBy);

            logger.api(`RolController: Rol ${id} actualizado por ${modifiedBy}.`);
            return ResponseService.success(res, updatedRol, 'Rol actualizado exitosamente');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Elimina un rol.
     * DELETE /api/roles/:id
     */
    static async deleteRol(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return ResponseService.badRequest(res, 'ID de rol inválido');
            }

            const deletedBy = req.user.atr_usuario;
            const result = await RolService.deleteRol(id, deletedBy);

            logger.api(`RolController: Rol ${id} eliminado por ${deletedBy}.`);
            return ResponseService.success(res, result, 'Rol eliminado exitosamente');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RolController;
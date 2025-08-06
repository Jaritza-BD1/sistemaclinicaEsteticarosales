// backend/server/controllers/PermisoController.js
const PermisoService = require('../services/PermisoService');
const ResponseService = require('../services/responseService');
const logger = require('../utils/logger');
const { generateError } = require('../Middlewares/errorHandler');

class PermisoController {
    /**
     * Asigna o actualiza los permisos de un rol para un objeto específico.
     * POST /api/permisos/upsert
     */
    static async upsertPermiso(req, res, next) {
        try {
            const { atr_id_rol, atr_id_objeto, atr_permiso_insercion, atr_permiso_eliminacion, atr_permiso_actualizacion, atr_permiso_consultar } = req.body;
            const user = req.user ? req.user.atr_usuario : 'system';

            if (!atr_id_rol || !atr_id_objeto) {
                throw generateError('BAD_REQUEST', 'Los IDs de rol y objeto son obligatorios.');
            }

            // Los permisos son strings, no booleanos
            const permisoData = {
                atr_permiso_insercion: atr_permiso_insercion || '',
                atr_permiso_eliminacion: atr_permiso_eliminacion || '',
                atr_permiso_actualizacion: atr_permiso_actualizacion || '',
                atr_permiso_consultar: atr_permiso_consultar || ''
            };

            const permiso = await PermisoService.upsertPermiso(
                atr_id_rol,
                atr_id_objeto,
                permisoData,
                user
            );
            logger.api(`PermisoController: Permiso para Rol ${atr_id_rol} y Objeto ${atr_id_objeto} gestionado por ${user}`);
            return ResponseService.success(res, permiso, 'Permiso gestionado exitosamente', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene los permisos de un rol para un objeto específico.
     * GET /api/permisos/:idRol/:idObjeto
     */
    static async getPermisoByRolAndObjeto(req, res, next) {
        try {
            const { idRol, idObjeto } = req.params;
            if (isNaN(idRol) || isNaN(idObjeto)) {
                throw generateError('BAD_REQUEST', 'IDs de rol u objeto inválidos.');
            }

            const permiso = await PermisoService.getPermisoByRolAndObjeto(idRol, idObjeto);
            logger.api(`PermisoController: Permiso para Rol ${idRol}, Objeto ${idObjeto} consultado.`);
            return ResponseService.success(res, permiso, 'Permiso obtenido exitosamente');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene todos los permisos para un rol específico.
     * GET /api/permisos/rol/:idRol
     */
    static async getPermisosByRol(req, res, next) {
        try {
            const { idRol } = req.params;
            if (isNaN(idRol)) {
                throw generateError('BAD_REQUEST', 'ID de rol inválido.');
            }
            const permisos = await PermisoService.getPermisosByRol(idRol);
            logger.api(`PermisoController: Permisos para Rol ${idRol} consultados.`);
            return ResponseService.success(res, permisos, 'Permisos obtenidos exitosamente para el rol');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene todos los permisos (con filtros opcionales).
     * GET /api/permisos
     */
    static async getAllPermisos(req, res, next) {
        try {
            const filters = {
                idRol: req.query.idRol ? parseInt(req.query.idRol) : undefined,
                idObjeto: req.query.idObjeto ? parseInt(req.query.idObjeto) : undefined,
            };
            const permisos = await PermisoService.getAllPermisos(filters);
            logger.api('PermisoController: Todos los permisos consultados.');
            return ResponseService.success(res, permisos, 'Todos los permisos obtenidos exitosamente');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Desactiva un permiso específico.
     * DELETE /api/permisos/:idRol/:idObjeto
     */
    static async deactivatePermiso(req, res, next) {
        try {
            const { idRol, idObjeto } = req.params;
            const user = req.user ? req.user.atr_usuario : 'system';

            if (isNaN(idRol) || isNaN(idObjeto)) {
                throw generateError('BAD_REQUEST', 'IDs de rol u objeto inválidos.');
            }

            await PermisoService.deactivatePermiso(idRol, idObjeto, user);
            logger.api(`PermisoController: Permiso para Rol ${idRol}, Objeto ${idObjeto} desactivado por ${user}`);
            return ResponseService.success(res, { message: 'Permiso desactivado exitosamente' }, 'Permiso desactivado exitosamente');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PermisoController;
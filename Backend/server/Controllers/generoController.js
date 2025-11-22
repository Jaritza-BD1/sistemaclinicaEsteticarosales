const ResponseService = require('../services/responseService');
const Genero = require('../Models/Genero');

const generoController = {
  async list(req, res) {
    try {
      const items = await Genero.findAll({ order: [['atr_id_genero', 'ASC']] });
      return ResponseService.success(res, items);
    } catch (error) {
      console.error('Error fetching generos', error);
      return ResponseService.internalError(res, 'Error interno');
    }
  },

  async getById(req, res) {
    try {
      const g = await Genero.findByPk(req.params.id);
      if (!g) return ResponseService.notFound(res, 'Genero no encontrado');
      return ResponseService.success(res, g);
    } catch (error) {
      console.error('Error getting genero', error);
      return ResponseService.internalError(res, 'Error interno');
    }
  }
};

module.exports = generoController;

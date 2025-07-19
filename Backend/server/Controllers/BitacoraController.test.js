const bitacoraController = require('./BitacoraController');
const bitacoraService = require('../services/bitacoraService');
jest.mock('../services/bitacoraService');

describe('BitacoraController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('registrarEventoBitacora', () => {
    it('devuelve éxito si el registro es correcto', async () => {
      bitacoraService.registrarEvento.mockResolvedValue(123);
      const result = await bitacoraController.registrarEventoBitacora('Ingreso', 'Test', 1, 2);
      expect(result.success).toBe(true);
      expect(result.data.idRegistro).toBe(123);
    });
    it('devuelve error si falta un campo', async () => {
      const result = await bitacoraController.registrarEventoBitacora('', 'Test', 1, 2);
      expect(result.success).toBe(false);
    });
    it('devuelve error si el service lanza excepción', async () => {
      bitacoraService.registrarEvento.mockRejectedValue(new Error('Fallo'));
      const result = await bitacoraController.registrarEventoBitacora('Ingreso', 'Test', 1, 2);
      expect(result.success).toBe(false);
    });
  });

  describe('consultarBitacora', () => {
    it('devuelve éxito y array de eventos', async () => {
      bitacoraService.obtenerEventos.mockResolvedValue([{ atr_id_bitacora: 1 }]);
      const result = await bitacoraController.consultarBitacora({ atr_id_usuario: 1 });
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
    it('devuelve error si el service lanza excepción', async () => {
      bitacoraService.obtenerEventos.mockRejectedValue(new Error('Fallo'));
      const result = await bitacoraController.consultarBitacora({ atr_id_usuario: 1 });
      expect(result.success).toBe(false);
    });
  });

  describe('consultarEstadisticasBitacora', () => {
    it('devuelve éxito y array de stats', async () => {
      bitacoraService.obtenerEstadisticas.mockResolvedValue([{ atr_id_usuario: 1 }]);
      const result = await bitacoraController.consultarEstadisticasBitacora('2024-01-01', '2024-01-31');
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
    it('devuelve error si el service lanza excepción', async () => {
      bitacoraService.obtenerEstadisticas.mockRejectedValue(new Error('Fallo'));
      const result = await bitacoraController.consultarEstadisticasBitacora('2024-01-01', '2024-01-31');
      expect(result.success).toBe(false);
    });
  });
}); 
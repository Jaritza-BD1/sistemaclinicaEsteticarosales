const bitacoraService = require('./bitacoraService');
const Bitacora = require('../Models/Bitacora');

jest.mock('../Models/Bitacora');

// Mock para sequelize.query
const sequelize = require('../Config/db');
jest.mock('../Config/db');

// Pruebas para registrarEvento

describe('bitacoraService', () => {
  afterEach(() => jest.clearAllMocks());

  it('registra un evento correctamente', async () => {
    Bitacora.create.mockResolvedValue({ atr_id_bitacora: 1 });
    const id = await bitacoraService.registrarEvento({
      atr_id_usuario: 1,
      atr_id_objetos: 2,
      atr_accion: 'Ingreso',
      atr_descripcion: 'Test',
      ip_origen: '127.0.0.1'
    });
    expect(id).toBe(1);
    expect(Bitacora.create).toHaveBeenCalled();
  });

  it('consulta eventos y retorna array', async () => {
    sequelize.query.mockResolvedValue([[{ atr_id_bitacora: 1 }]]);
    const eventos = await bitacoraService.obtenerEventos({ atr_id_usuario: 1 });
    expect(Array.isArray(eventos)).toBe(true);
    expect(eventos[0].atr_id_bitacora).toBe(1);
  });

  it('consulta eventos y retorna array vacío si no hay resultados', async () => {
    sequelize.query.mockResolvedValue([undefined]);
    const eventos = await bitacoraService.obtenerEventos({ atr_id_usuario: 1 });
    expect(Array.isArray(eventos)).toBe(true);
    expect(eventos.length).toBe(0);
  });

  it('consulta estadísticas y retorna array', async () => {
    Bitacora.findAll.mockResolvedValue([
      { atr_id_usuario: 1, total_eventos: 5, ingresos: 2, actualizaciones: 2, eliminaciones: 1 }
    ]);
    const stats = await bitacoraService.obtenerEstadisticas('2024-01-01', '2024-01-31');
    expect(Array.isArray(stats)).toBe(true);
    expect(stats[0].atr_id_usuario).toBe(1);
  });
}); 
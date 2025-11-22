const cron = require('node-cron');
const { Recordatorio, Appointment, EstadoBitacoraRecordatorio } = require('../Models');
const { registrarEstadoRecordatorio, ESTADOS_RECORDATORIO } = require('../utils/reminderUtils');
const logger = require('../utils/logger');

// Ejecutar cada 5 minutos (ajusta según necesidad)
const schedule = process.env.REMINDER_CRON || '*/5 * * * *';

const job = cron.schedule(
  schedule,
  async () => {
    try {
      logger.info('🔔 Iniciando job de creación automática de recordatorios');

      const now = new Date();
      // Buscar citas en las próximas 24 horas que no tengan recordatorios
      const tomorrow = new Date(now);
      tomorrow.setHours(now.getHours() + 24);

      // Obtener citas confirmadas (asumiendo estado 1 = CONFIRMADA, ajusta según tu lógica)
      const citasProximas = await Appointment.findAll({
        where: {
          atr_fecha_cita: {
            [require('sequelize').Op.between]: [now.toISOString().split('T')[0], tomorrow.toISOString().split('T')[0]]
          },
          atr_id_estado: 1 // CONFIRMADA - ajusta según tus estados
        },
        include: [{
          model: Recordatorio,
          as: 'Recordatorios',
          required: false // LEFT JOIN para obtener citas sin recordatorios
        }]
      });

      for (const cita of citasProximas) {
        try {
          // Verificar si ya existe un recordatorio para esta cita
          const recordatoriosExistentes = await Recordatorio.findAll({
            where: { atr_id_cita: cita.atr_id_cita }
          });

          if (recordatoriosExistentes.length === 0) {
            // Crear recordatorio automático
            // Calcular fecha de envío: 1 hora antes de la cita
            const fechaCita = new Date(`${cita.atr_fecha_cita}T${cita.atr_hora_cita}`);
            const fechaEnvio = new Date(fechaCita);
            fechaEnvio.setHours(fechaEnvio.getHours() - 1); // 1 hora antes

            // Solo crear si la fecha de envío está en el futuro
            if (fechaEnvio > now) {
              const nuevoRecordatorio = await Recordatorio.create({
                atr_id_cita: cita.atr_id_cita,
                atr_fecha_hora_envio: fechaEnvio,
                atr_medio: 'notificación app' // Default, puede ser configurable
              });

              // Registrar estado inicial en bitácora
              await registrarEstadoRecordatorio(
                nuevoRecordatorio.atr_id_recordatorio,
                ESTADOS_RECORDATORIO.PENDIENTE,
                `Recordatorio automático creado para cita ${cita.atr_id_cita} - envío programado para ${fechaEnvio.toISOString()}`
              );

              logger.info(`✅ Recordatorio automático creado para cita ${cita.atr_id_cita}`);
            }
          }
        } catch (error) {
          logger.error(`❌ Error procesando cita ${cita.atr_id_cita}:`, error);
        }
      }

      logger.info('✅ Job de recordatorios completado');
    } catch (error) {
      logger.error('❌ Error en job de recordatorios', error);
    }
  },
  { scheduled: true, timezone: process.env.BACKUP_TIMEZONE || 'America/Honduras' }
);

module.exports = job;
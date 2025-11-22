const cron = require('node-cron');
const { Recordatorio, EstadoBitacoraRecordatorio, Appointment, Patient, Doctor } = require('../Models');
const { registrarEstadoRecordatorio, registrarReintento, confirmarEntrega, ESTADOS_RECORDATORIO } = require('../utils/reminderUtils');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// Ejecutar cada 5 minutos (ajusta según necesidad)
const schedule = process.env.FOLLOWUP_CRON || '*/5 * * * *';

const job = cron.schedule(
  schedule,
  async () => {
    try {
      logger.info('🔔 Iniciando job de recordatorios de consultas');

      // Obtener id para estado 'PENDIENTE' (fallback a 1)
      let pendienteId = 1;
      try {
        const estado = await EstadoBitacoraRecordatorio.findOne({ where: { atr_estado_recordatorio: ESTADOS_RECORDATORIO.PENDIENTE } });
        if (estado) pendienteId = estado.atr_id_estado_recordatorio;
      } catch (e) {
        logger.warn('No se pudo obtener estado PENDIENTE para recordatorios, usando id=1');
      }

      const now = new Date();
      // Buscar recordatorios pendientes con datos completos de la cita
      const recordatoriosPendientes = await Recordatorio.findAll({
        where: {
          atr_fecha_hora_envio: { [require('sequelize').Op.lte]: now },
          atr_cancelacion: false
        },
        include: [
          {
            model: EstadoBitacoraRecordatorio,
            where: {
              atr_estado_recordatorio: ESTADOS_RECORDATORIO.PENDIENTE,
              atr_cancelacion: false
            },
            required: true
          },
          {
            model: Appointment,
            as: 'Appointment',
            include: [
              {
                model: Patient,
                as: 'Patient'
              },
              {
                model: Doctor,
                as: 'Doctor'
              }
            ]
          }
        ]
      });

      for (const recordatorio of recordatoriosPendientes) {
        try {
          const { Appointment: cita, atr_medio } = recordatorio;

          if (!cita) {
            logger.warn(`Recordatorio ${recordatorio.atr_id_recordatorio} no tiene cita asociada`);
            continue;
          }

          if (!cita.Patient) {
            logger.warn(`Cita ${cita.atr_id_cita} no tiene paciente asociado`);
            continue;
          }

          if (!cita.Doctor) {
            logger.warn(`Cita ${cita.atr_id_cita} no tiene doctor asociado`);
            continue;
          }

          logger.info(`Enviando recordatorio id=${recordatorio.atr_id_recordatorio} para cita=${cita.atr_id_cita} via ${atr_medio}`);

          let envioExitoso = false;
          let errorMensaje = '';

          // Implementar envío según el medio
          switch (atr_medio) {
            case 'email':
              try {
                const resultado = await emailService.sendAppointmentReminder(
                  recordatorio,
                  cita,
                  cita.Patient,
                  cita.Doctor
                );
                envioExitoso = resultado.success;
                if (!envioExitoso) {
                  errorMensaje = resultado.error;
                }
              } catch (emailError) {
                logger.error(`Error enviando email para recordatorio ${recordatorio.atr_id_recordatorio}:`, emailError);
                envioExitoso = false;
                errorMensaje = emailError.message;
              }
              break;

            case 'sms':
              // TODO: Implementar envío SMS cuando se configure el servicio
              logger.info(`SMS no implementado aún para recordatorio ${recordatorio.atr_id_recordatorio}`);
              envioExitoso = false;
              errorMensaje = 'Servicio SMS no implementado';
              break;

            case 'notificación app':
              // TODO: Implementar notificaciones push cuando se configure
              logger.info(`Notificación app no implementada aún para recordatorio ${recordatorio.atr_id_recordatorio}`);
              envioExitoso = false;
              errorMensaje = 'Servicio de notificaciones push no implementado';
              break;

            default:
              logger.warn(`Medio desconocido '${atr_medio}' para recordatorio ${recordatorio.atr_id_recordatorio}`);
              envioExitoso = false;
              errorMensaje = `Medio de envío desconocido: ${atr_medio}`;
          }

          // Registrar resultado del envío
          if (envioExitoso) {
            await registrarEstadoRecordatorio(
              recordatorio.atr_id_recordatorio,
              ESTADOS_RECORDATORIO.ENVIADO,
              `Recordatorio enviado exitosamente via ${atr_medio} para cita ${cita.atr_id_cita}`
            );

            // Programar confirmación de entrega (simulada por ahora)
            setTimeout(async () => {
              try {
                await confirmarEntrega(
                  recordatorio.atr_id_recordatorio,
                  `Entrega confirmada via ${atr_medio}`
                );
              } catch (confirmError) {
                logger.error(`Error confirmando entrega para recordatorio ${recordatorio.atr_id_recordatorio}:`, confirmError);
              }
            }, 5000); // Simular 5 segundos para confirmación

          } else {
            // Registrar error y programar reintento
            await registrarEstadoRecordatorio(
              recordatorio.atr_id_recordatorio,
              ESTADOS_RECORDATORIO.ERROR,
              `Error enviando recordatorio via ${atr_medio}: ${errorMensaje}`
            );

            // Programar reintento automático (ejemplo: después de 10 minutos)
            setTimeout(async () => {
              try {
                await registrarReintento(recordatorio.atr_id_recordatorio, 1);
                logger.info(`Reintento programado para recordatorio ${recordatorio.atr_id_recordatorio}`);
              } catch (retryError) {
                logger.error(`Error programando reintento para recordatorio ${recordatorio.atr_id_recordatorio}:`, retryError);
              }
            }, 10 * 60 * 1000); // 10 minutos
          }

        } catch (error) {
          logger.error(`Error procesando recordatorio ${recordatorio.atr_id_recordatorio}:`, error);
        }
      }

      logger.info('✅ Job recordatorios completado');
    } catch (error) {
      logger.error('❌ Error en job de recordatorios', error);
    }
  },
  { scheduled: true, timezone: process.env.BACKUP_TIMEZONE || 'America/Honduras' }
);

module.exports = job;

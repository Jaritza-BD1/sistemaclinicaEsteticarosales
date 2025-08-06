// File: server/Controllers/appointmentController.js
const { Appointment, Patient, Doctor, User, Recordatorio } = require('../Models');
const logger = require('../utils/logger');

module.exports = {
  async create(req, res, next) {
    try {
      const userId = req.user.id;
      const data = { ...req.body, atr_id_usuario: userId };
      
      // Crear la cita
      const appointment = await Appointment.create(data);
      
      // Si hay recordatorio, crearlo
      if (req.body.reminder) {
        await Recordatorio.create({
          atr_id_cita: appointment.atr_id_cita,
          atr_fecha_hora_envio: req.body.reminder,
          atr_medio: 'notificación app',
          atr_contenido: `Recordatorio para tu cita: ${appointment.atr_motivo_cita}`,
          atr_id_estado_recordatorio: 1,
          atr_cancelacion: 0
        });
      }
      
      // Obtener la cita con relaciones
      const appointmentWithRelations = await Appointment.findByPk(appointment.atr_id_cita, {
        include: [
          { model: Patient, as: 'Patient' },
          { model: Doctor, as: 'Doctor' },
          { model: User, as: 'User' },
          { model: Recordatorio, as: 'Recordatorio' }
        ]
      });
      
      res.status(201).json({ success: true, data: appointmentWithRelations });
    } catch (err) {
      logger.error('Error crear cita', err);
      next(err);
    }
  },

  async list(req, res, next) {
    try {
      const appointments = await Appointment.findAll({
        include: [
          { model: Patient, as: 'Patient' },
          { model: Doctor, as: 'Doctor' },
          { model: User, as: 'User' },
          { model: Recordatorio, as: 'Recordatorio' }
        ],
        order: [['atr_fecha_cita', 'DESC'], ['atr_hora_cita', 'DESC']]
      });
      res.json({ success: true, data: appointments });
    } catch (err) {
      logger.error('Error listar citas', err);
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const appointment = await Appointment.findByPk(id, {
        include: [
          { model: Patient, as: 'Patient' },
          { model: Doctor, as: 'Doctor' },
          { model: User, as: 'User' },
          { model: Recordatorio, as: 'Recordatorio' }
        ]
      });
      
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }
      
      res.json({ success: true, data: appointment });
    } catch (err) {
      logger.error('Error obtener cita', err);
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }
      
      // Actualizar la cita
      await appointment.update(updateData);
      
      // Actualizar recordatorio si se proporciona
      if (req.body.reminder !== undefined) {
        const recordatorio = await Recordatorio.findOne({
          where: { atr_id_cita: id }
        });
        
        if (req.body.reminder) {
          if (recordatorio) {
            await recordatorio.update({
              atr_fecha_hora_envio: req.body.reminder,
              atr_contenido: `Recordatorio para tu cita: ${updateData.atr_motivo_cita || appointment.atr_motivo_cita}`
            });
          } else {
            await Recordatorio.create({
              atr_id_cita: id,
              atr_fecha_hora_envio: req.body.reminder,
              atr_medio: 'notificación app',
              atr_contenido: `Recordatorio para tu cita: ${updateData.atr_motivo_cita || appointment.atr_motivo_cita}`,
              atr_id_estado_recordatorio: 1,
              atr_cancelacion: 0
            });
          }
        } else if (recordatorio) {
          await recordatorio.destroy();
        }
      }
      
      // Obtener la cita actualizada con relaciones
      const updatedAppointment = await Appointment.findByPk(id, {
        include: [
          { model: Patient, as: 'Patient' },
          { model: Doctor, as: 'Doctor' },
          { model: User, as: 'User' },
          { model: Recordatorio, as: 'Recordatorio' }
        ]
      });
      
      res.json({ success: true, data: updatedAppointment });
    } catch (err) {
      logger.error('Error actualizar cita', err);
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }
      
      // Eliminar recordatorio asociado
      await Recordatorio.destroy({
        where: { atr_id_cita: id }
      });
      
      // Eliminar la cita
      await appointment.destroy();
      
      res.json({ success: true, message: 'Cita eliminada exitosamente' });
    } catch (err) {
      logger.error('Error eliminar cita', err);
      next(err);
    }
  },

  async confirm(req, res, next) {
    try {
      const { id } = req.params;
      
      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }
      
      await appointment.update({ atr_id_estado: 2 }); // 2 = Confirmada
      
      const updatedAppointment = await Appointment.findByPk(id, {
        include: [
          { model: Patient, as: 'Patient' },
          { model: Doctor, as: 'Doctor' },
          { model: User, as: 'User' },
          { model: Recordatorio, as: 'Recordatorio' }
        ]
      });
      
      res.json({ success: true, data: updatedAppointment });
    } catch (err) {
      logger.error('Error confirmar cita', err);
      next(err);
    }
  },

  async reschedule(req, res, next) {
    try {
      const { id } = req.params;
      const { atr_fecha_cita, atr_hora_cita, atr_motivo_cita } = req.body;
      
      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }
      
      await appointment.update({
        atr_fecha_cita,
        atr_hora_cita,
        atr_motivo_cita: atr_motivo_cita || appointment.atr_motivo_cita
      });
      
      const updatedAppointment = await Appointment.findByPk(id, {
        include: [
          { model: Patient, as: 'Patient' },
          { model: Doctor, as: 'Doctor' },
          { model: User, as: 'User' },
          { model: Recordatorio, as: 'Recordatorio' }
        ]
      });
      
      res.json({ success: true, data: updatedAppointment });
    } catch (err) {
      logger.error('Error reprogramar cita', err);
      next(err);
    }
  },

  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }
      
      await appointment.update({ 
        atr_id_estado: 3, // 3 = Cancelada
        atr_motivo_cita: `${appointment.atr_motivo_cita} - CANCELADA: ${reason || 'Sin motivo especificado'}`
      });
      
      const updatedAppointment = await Appointment.findByPk(id, {
        include: [
          { model: Patient, as: 'Patient' },
          { model: Doctor, as: 'Doctor' },
          { model: User, as: 'User' },
          { model: Recordatorio, as: 'Recordatorio' }
        ]
      });
      
      res.json({ success: true, data: updatedAppointment });
    } catch (err) {
      logger.error('Error cancelar cita', err);
      next(err);
    }
  },

  async getPatients(req, res, next) {
    try {
      const patients = await Patient.findAll({
        attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido'],
        where: { atr_estado_paciente: 'ACTIVO' },
        order: [['atr_nombre', 'ASC']]
      });
      
      const formattedPatients = patients.map(patient => ({
        value: patient.atr_id_paciente,
        label: `${patient.atr_nombre} ${patient.atr_apellido}`
      }));
      
      res.json({ success: true, data: formattedPatients });
    } catch (err) {
      logger.error('Error obtener pacientes', err);
      next(err);
    }
  },

  async getDoctors(req, res, next) {
    try {
      const doctors = await Doctor.findAll({
        attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido'],
        where: { atr_estado_medico: 'ACTIVO' },
        order: [['atr_nombre', 'ASC']]
      });
      
      const formattedDoctors = doctors.map(doctor => ({
        value: doctor.atr_id_medico,
        label: `Dr. ${doctor.atr_nombre} ${doctor.atr_apellido}`
      }));
      
      res.json({ success: true, data: formattedDoctors });
    } catch (err) {
      logger.error('Error obtener médicos', err);
      next(err);
    }
  }
};

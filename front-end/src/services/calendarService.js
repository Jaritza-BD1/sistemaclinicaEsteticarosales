// src/services/calendarService.js
import api from './api';
import moment from 'moment';

class CalendarService {
  static async getEvents() {
    try {
      const response = await api.get('/appointments');
      return response.data.map(cita => ({
        id: String(cita.atr_id_cita),
        title: cita.atr_motivo_cita,
        start: moment(`${cita.atr_fecha_cita} ${cita.atr_hora_cita}`).toDate(),
        end: moment(`${cita.atr_fecha_cita} ${cita.atr_hora_cita}`).add(60, 'minutes').toDate(), // Asume 60 min si no hay duración explícita
        type: 'appointment',
        // Ahora toma el recordatorio del objeto anidado si existe
        reminder: cita.Recordatorio && cita.Recordatorio.atr_fecha_hora_envio ? moment(cita.Recordatorio.atr_fecha_hora_envio).toDate() : null,
        status: cita.atr_id_estado, // Asegúrate de usar el campo correcto para el estado
      }));
    } catch (error) {
      console.error('Error al obtener eventos del calendario:', error);
      throw error;
    }
  }

  static async createEvent(eventData) {
    try {
      const dataToSend = {
        atr_id_paciente: eventData.patientId,
        atr_id_medico: eventData.doctorId,
        atr_id_usuario: eventData.userId,
        atr_fecha_cita: moment(eventData.start).format('YYYY-MM-DD'),
        atr_hora_cita: moment(eventData.start).format('HH:mm:ss'),
        atr_motivo_cita: eventData.title,
        atr_id_tipo_cita: eventData.typeId,
        atr_id_estado: eventData.statusId,
      };

      const appointmentResponse = await api.post('/appointments', dataToSend);

      if (eventData.reminder) {
        const reminderData = {
          atr_id_cita: appointmentResponse.data.atr_id_cita,
          atr_fecha_hora_envio: moment(eventData.reminder).format('YYYY-MM-DD HH:mm:ss'),
          atr_medio: 'notificación app',
          atr_contenido: `Recordatorio para tu cita: ${eventData.title}`,
          atr_id_estado_recordatorio: 1,
          atr_cancelacion: 0
        };
        await api.post('/reminders', reminderData);
      }

      return {
        id: String(appointmentResponse.data.atr_id_cita),
        title: appointmentResponse.data.atr_motivo_cita,
        start: moment(`${appointmentResponse.data.atr_fecha_cita} ${appointmentResponse.data.atr_hora_cita}`).toDate(),
        end: moment(`${appointmentResponse.data.atr_fecha_cita} ${appointmentResponse.data.atr_hora_cita}`).add(60, 'minutes').toDate(),
        type: 'appointment',
        reminder: eventData.reminder,
      };
    } catch (error) {
      console.error('Error al crear evento del calendario:', error);
      throw error;
    }
  }

  static async updateEvent(id, updatedData) {
    try {
      const dataToSend = {
        atr_fecha_cita: moment(updatedData.start).format('YYYY-MM-DD'),
        atr_hora_cita: moment(updatedData.start).format('HH:mm:ss'),
        atr_motivo_cita: updatedData.title,
      };
      const appointmentResponse = await api.put(`/appointments/${id}`, dataToSend);

      // Lógica para actualizar recordatorios. Necesitarías el ID del recordatorio
      // o un endpoint para actualizar por ID de cita. Esto es un placeholder.
      if (updatedData.reminder) {
         // await api.put(`/reminders/by-cita/${id}`, reminderUpdateData);
      } else {
        // Si el recordatorio se eliminó (ej. el usuario desmarca el recordatorio)
        // await api.delete(`/reminders/by-cita/${id}`);
      }


      return {
        id: String(appointmentResponse.data.atr_id_cita),
        title: appointmentResponse.data.atr_motivo_cita,
        start: moment(`${appointmentResponse.data.atr_fecha_cita} ${appointmentResponse.data.atr_hora_cita}`).toDate(),
        end: moment(`${appointmentResponse.data.atr_fecha_cita} ${appointmentResponse.data.atr_hora_cita}`).add(60, 'minutes').toDate(),
        type: 'appointment',
        reminder: updatedData.reminder,
      };
    } catch (error) {
      console.error('Error al actualizar evento del calendario:', error);
      throw error;
    }
  }

  static async deleteEvent(id) {
    try {
      await api.delete(`/appointments/${id}`);
      // También podrías necesitar eliminar el recordatorio asociado
      // await api.delete(`/reminders/by-cita/${id}`);
      return true;
    } catch (error) {
      console.error('Error al eliminar evento del calendario:', error);
      throw error;
    }
  }
}

export default CalendarService;
// src/components/appointments/CalendarView.jsx
import React, { useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAppointments,
  updateAppointment,
  deleteAppointment,
} from '../../redux/appointments/appointmentsSlice';
import EventModal from '../common/EventModal';
import { useCalendar } from '../context/CalendarContext';

// FullCalendar styles are loaded from CDN in public/index.html to avoid
// package export/resolution issues during the build (imports like
// '@fullcalendar/daygrid/main.css' are not exported in the installed
// package versions).
import './CalendarView.css';

const CalendarView = () => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.appointments.items);
  const status = useSelector((state) => state.appointments.status);
  const error = useSelector((state) => state.appointments.error);

  // Usa el hook del contexto para acceder al estado y las funciones
  const { showEditModal, selectedEvent, closeEditModal } = useCalendar();

  const checkReminders = useCallback((eventsToCheck) => {
    const now = moment();
    eventsToCheck.forEach(event => {
      if (event.reminder && moment(event.reminder).isValid() && !event.notified) {
        const reminderTime = moment(event.reminder);
        if (reminderTime.isBetween(now.clone().subtract(1, 'minute'), now.clone().add(1, 'minute'))) {
          alert(`¡Recordatorio! Tienes "${event.title}" programado para hoy a las ${moment(event.start).format('HH:mm')}.`);
          event.notified = true; // Marca como notificado para esta sesión
        }
      }
    });
  }, []);

  // Cargar eventos al montar el componente
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAppointments());
    }
  }, [status, dispatch]);

  // Manejo de recordatorios
  useEffect(() => {
    const reminderInterval = setInterval(() => {
      checkReminders(events);
    }, 60000); // Cada minuto

    return () => clearInterval(reminderInterval);
  }, [events, checkReminders]);

  // Handlers para FullCalendar
  const handleEventClick = (clickInfo) => {
    // Aquí podrías abrir un modal con detalles del evento
    console.log('Evento clickeado:', clickInfo.event);
  };

  const handleEventDrop = async (dropInfo) => {
    const { event } = dropInfo;
    const updatedData = {
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      title: event.title,
      startTime: moment(event.start).format('HH:mm'),
    };
    
    try {
      await dispatch(updateAppointment({ id: event.id, updatedData })).unwrap();
      alert('Evento actualizado exitosamente!');
    } catch (error) {
      console.error('Error al actualizar el evento (drop):', error);
      
      // Manejar diferentes tipos de error
      let errorMessage = 'Error desconocido';
      
      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        } else if (error.toString) {
          errorMessage = error.toString();
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Hubo un error al actualizar el evento: ${errorMessage}`);
      dropInfo.revert();
    }
  };

  const handleEventResize = async (resizeInfo) => {
    const { event } = resizeInfo;
    const updatedData = {
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      title: event.title,
      startTime: moment(event.start).format('HH:mm'),
    };
    
    try {
      await dispatch(updateAppointment({ id: event.id, updatedData })).unwrap();
      alert('Evento actualizado exitosamente!');
    } catch (error) {
      console.error('Error al actualizar el evento (resize):', error);
      
      let errorMessage = 'Error desconocido';
      
      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        } else if (error.toString) {
          errorMessage = error.toString();
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Hubo un error al actualizar el evento: ${errorMessage}`);
      resizeInfo.revert();
    }
  };

  const handleDateSelect = (selectInfo) => {
    // Aquí podrías abrir un modal para crear un nuevo evento
    console.log('Fecha seleccionada:', selectInfo);
  };

  const handleModalSave = async (updatedEventData) => {
    try {
      await dispatch(updateAppointment({ 
        id: updatedEventData.id, 
        updatedData: updatedEventData 
      })).unwrap();
      
      alert('Evento actualizado exitosamente!');
      closeEditModal();
    } catch (error) {
      console.error('Error al actualizar evento desde modal:', error);
      
      let errorMessage = 'Error desconocido';
      
      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        } else if (error.toString) {
          errorMessage = error.toString();
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Hubo un error al actualizar el evento: ${errorMessage}`);
    }
  };

  const handleModalDelete = async (eventId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        await dispatch(deleteAppointment(eventId)).unwrap();
        alert('Evento eliminado exitosamente!');
        closeEditModal();
      } catch (error) {
        console.error('Error al eliminar evento:', error);
        
        let errorMessage = 'Error desconocido';
        
        if (error && typeof error === 'object') {
          if (error.message) {
            errorMessage = error.message;
          } else if (error.error) {
            errorMessage = error.error;
          } else if (error.toString) {
            errorMessage = error.toString();
          }
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        alert(`Hubo un error al eliminar el evento: ${errorMessage}`);
      }
    }
  };

  const eventContent = (arg) => {
    const event = arg.event;
    const isPast = moment(event.start).isBefore(moment(), 'day');
    const isToday = moment(event.start).isSame(moment(), 'day');
    
    return (
      <div className={`event-content ${isPast ? 'past-event' : ''} ${isToday ? 'today-event' : ''}`}>
        <div className="event-title">{event.title}</div>
        <div className="event-time">
          {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
        </div>
        {event.extendedProps.patient && (
          <div className="event-patient">
            Paciente: {event.extendedProps.patient.atr_nombre} {event.extendedProps.patient.atr_apellido}
          </div>
        )}
        {event.extendedProps.doctor && (
          <div className="event-doctor">
            Dr. {event.extendedProps.doctor.atr_nombre} {event.extendedProps.doctor.atr_apellido}
          </div>
        )}
      </div>
    );
  };

  if (status === 'loading') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <div>Cargando calendario...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div>Error al cargar el calendario: {error}</div>
        <button onClick={() => dispatch(fetchAppointments())}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        select={handleDateSelect}
        eventContent={eventContent}
        height="auto"
        locale="es"
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día'
        }}
        dayHeaderFormat={{ weekday: 'long' }}
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
      />

      {/* Modal para editar eventos */}
      {showEditModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
          onClose={closeEditModal}
        />
      )}
    </div>
  );
};

export default CalendarView;
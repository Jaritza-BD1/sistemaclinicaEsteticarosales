// src/components/common/EventModal.jsx
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useCalendar } from '../context/CalendarContext'; // <-- Importa el hook useCalendar
import '../../asset/Style/EventModal.css';

const EventModal = ({ event, onSave, onDelete }) => { // <-- Ya no recibimos 'onClose' como prop
  const { closeEditModal } = useCalendar(); // <-- Obtenemos 'closeEditModal' del contexto

  const [editedEvent, setEditedEvent] = useState(event);

  useEffect(() => {
    // Asegúrate de formatear correctamente las fechas para los inputs datetime-local
    setEditedEvent({
      ...event,
      start: moment(event.start).format('YYYY-MM-DDTHH:mm'),
      end: moment(event.end).format('YYYY-MM-DDTHH:mm'),
      reminder: event.reminder ? moment(event.reminder).format('YYYY-MM-DDTHH:mm') : '',
    });
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Convierte las fechas de nuevo a objetos Date antes de guardar
    const eventToSave = {
      ...editedEvent,
      start: new Date(editedEvent.start),
      end: new Date(editedEvent.end),
      reminder: editedEvent.reminder ? new Date(editedEvent.reminder) : null,
    };
    onSave(eventToSave);
  };

  const handleDelete = () => {
    onDelete(event.id);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Editar Evento / Cita</h3>
        <div className="form-group">
          <label>Título:</label>
          <input
            type="text"
            name="title"
            value={editedEvent.title}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Inicio:</label>
          <input
            type="datetime-local"
            name="start"
            value={editedEvent.start}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Fin:</label>
          <input
            type="datetime-local"
            name="end"
            value={editedEvent.end}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Recordatorio (opcional):</label>
          <input
            type="datetime-local"
            name="reminder"
            value={editedEvent.reminder}
            onChange={handleChange}
          />
        </div>
        <div className="modal-actions">
          <button onClick={handleSave}>Guardar Cambios</button>
          <button onClick={handleDelete} className="delete-button">Eliminar</button>
          <button onClick={closeEditModal}>Cerrar</button> {/* <-- Usa closeEditModal del contexto */}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
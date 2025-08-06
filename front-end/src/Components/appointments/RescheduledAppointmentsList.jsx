import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments } from '../../redux/appointments/appointmentsSlice';

const RescheduledAppointmentsList = () => {
  const dispatch = useDispatch();
  const appointments = useSelector(state => state.appointments.items);
  const status = useSelector(state => state.appointments.status);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchAppointments());
  }, [dispatch, status]);

  const rescheduled = appointments.filter(cita => cita.status === 'Reprogramada');

  return (
    <div>
      <h2>Citas Reprogramadas</h2>
      <ul className="app-list">
        {rescheduled.length === 0 ? (
          <li>No hay citas reprogramadas.</li>
        ) : (
          rescheduled.map(cita => (
            <li key={cita.id}>
              <strong>{cita.title}</strong> | Paciente: {cita.paciente || 'N/A'} | Fecha: {cita.start.toLocaleDateString()} | Motivo: {cita.motivo || 'N/A'}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default RescheduledAppointmentsList; 
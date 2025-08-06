// File: src/components/appointments/ViewAppointments.jsx
import React, {useEffect} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import { fetchAppointments } from '../../redux/appointments/appointmentsSlice';
import { selectAllAppointments } from '../../redux/appointments/appointmentsSelectors';

export default function ViewAppointments() {
  const dispatch = useDispatch();
  const apps     = useSelector(selectAllAppointments);

  useEffect(()=>{ dispatch(fetchAppointments()); },[dispatch]);

  return (
    <ul className="app-list">
      {apps.map(a => <li key={a.atr_id_cita}>{a.atr_fecha_cita} {a.atr_hora_cita}</li>)}
    </ul>
  );
}
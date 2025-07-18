// File: src/components/appointments/AppointmentDetail.jsx
import React from 'react';
import {useParams,useNavigate} from 'react-router-dom';
import {useSelector,useDispatch} from 'react-redux';
import { selectAppointmentById } from '../../redux/appointments/appointmentsSelectors';
import { confirmApp } from '../../redux/appointments/appointmentsSlice';

export default function AppointmentDetail() {
  const {id} = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const appt = useSelector(state => selectAppointmentById(state,id));

  if(!appt) return <div>Cargando...</div>;

  const handleConfirm = async()=>{ await dispatch(confirmApp(id)).unwrap(); navigate('/citas'); };

  return (
    <div>
      <h3>Cita {id}</h3>
      {/* Detail fields */}
      <button onClick={handleConfirm}>Confirmar</button>
    </div>
  );
}

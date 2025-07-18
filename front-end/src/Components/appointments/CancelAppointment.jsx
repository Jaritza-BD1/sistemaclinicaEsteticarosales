// File: src/components/appointments/CancelAppointment.jsx
import React,{useState} from 'react';
import {useDispatch} from 'react-redux';
import { cancelApp } from '../../redux/appointments/appointmentsSlice';

export default function CancelAppointment({appointmentId,onClose}){
  const dispatch=useDispatch();
  const [reason,setReason]=useState('');
  const handleCancel=async()=>{
    await dispatch(cancelApp({id:appointmentId,reason})).unwrap();
    onClose();
  };
  return (
    <div>
      <textarea
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder="Motivo de cancelación"
      />
      <button onClick={handleCancel}>Cancelar cita</button>
    </div>
  );
}

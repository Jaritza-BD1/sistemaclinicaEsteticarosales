// File: src/pages/CancelarCitaPage.jsx
import React from 'react';
import {useParams,useNavigate} from 'react-router-dom';
import CancelAppointment from '../Components/appointments/CancelAppointment';

const CancelarCitaPage = () => {
  const {id} = useParams();
  const nav = useNavigate();
  return <CancelAppointment appointmentId={id} onClose={()=>nav('/citas')}/>;
};
export default CancelarCitaPage;
// File: src/pages/ReprogramarCitaPage.jsx
import React from 'react';
import {useParams} from 'react-router-dom';
import RescheduleAppointment from '../Components/appointments/RescheduleAppointment';

const ReprogramarCitaPage = () => {
  const {id} = useParams();
  return <RescheduleAppointment appointmentId={id}/>;
};
export default ReprogramarCitaPage;
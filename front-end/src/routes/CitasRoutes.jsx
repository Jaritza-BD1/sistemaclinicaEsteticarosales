import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CitasPage from '../pages/CitasPage';
import CitasCalendarioPage from '../pages/CitasCalendarioPage';
import CitasDiaPage from '../pages/CitasDiaPage';
import ConsultationPage from '../pages/ConsultationPage';

export default function CitasRoutes() {
  return (
    <Routes>
      <Route index element={<CitasPage />} />
      <Route path="dia" element={<CitasDiaPage />} />
      <Route path="ver" element={<CitasPage />} />
      <Route path="calendario" element={<CitasCalendarioPage />} />
    <Route path="consulta/:appointmentId" element={<ConsultationPage />} />
    </Routes>
  );
}
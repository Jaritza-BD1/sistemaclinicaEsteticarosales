import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CitasAgendarPage from '../pages/CitasAgendarPage';
import CitasPage from '../pages/CitasPage';
import CitaDetallePage from '../pages/CitaDetallePage';
import CancelarCitaPage from '../pages/CancelarCitaPage';
import ReprogramarCitaPage from '../pages/ReprogramarCitaPage';
import CitasEditarPage from '../pages/CitasEditarPage';
import CitasCalendarioPage from '../pages/CitasCalendarioPage';
import CitasDiaPage from '../pages/CitasDiaPage';
import ConsultationPage from '../pages/ConsultationPage';

export default function CitasRoutes() {
  return (
    <Routes>
      <Route index element={<CitasPage />} />
      <Route path="dia" element={<CitasDiaPage />} />
      <Route path="agendar" element={<CitasAgendarPage />} />
      <Route path="ver" element={<CitasPage />} />
      <Route path="calendario" element={<CitasCalendarioPage />} />
      <Route path="detalle/:id" element={<CitaDetallePage />} />
      <Route path="cancelar/:id" element={<CancelarCitaPage />} />
      <Route path="reprogramar/:id" element={<ReprogramarCitaPage />} />
      <Route path=":id/editar" element={<CitasEditarPage />} />
      <Route path="consulta/:appointmentId" element={<ConsultationPage />} />
    </Routes>
  );
}
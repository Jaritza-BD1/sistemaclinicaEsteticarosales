import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CitasAgendarPage from '../pages/CitasAgendarPage';
import VerCitasPage from '../pages/VerCitasPage';
import CitaDetallePage from '../pages/CitaDetallePage';
import CancelarCitaPage from '../pages/CancelarCitaPage';
import ReprogramarCitaPage from '../pages/ReprogramarCitaPage';

export default function CitasRoutes() {
  return (
    <Routes>
      <Route path="agendar" element={<CitasAgendarPage />} />
      <Route path="ver" element={<VerCitasPage />} />
      <Route path="detalle/:id" element={<CitaDetallePage />} />
      <Route path="cancelar/:id" element={<CancelarCitaPage />} />
      <Route path="reprogramar/:id" element={<ReprogramarCitaPage />} />
    </Routes>
  );
} 
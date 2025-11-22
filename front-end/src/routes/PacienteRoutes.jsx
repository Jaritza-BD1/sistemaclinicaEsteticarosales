import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PatientList from '../Components/patients/PatientList';
import PatientDetail from '../Components/patients/PatientDetail';

export default function PacienteRoutes() {
  return (
    <Routes>
      <Route path="lista" element={<PatientList />} />
      <Route path="detalle/:id" element={<PatientDetail />} />
    </Routes>
  );
}

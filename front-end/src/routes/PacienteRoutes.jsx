import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PatientList from '../Components/patients/PatientList';
import PatientDetail from '../Components/patients/PatientDetail';
import PatientModule from '../Components/patients/PatientModule';

export default function PacienteRoutes() {
  return (
    <Routes>
      <Route index element={<PatientModule />} />
      <Route path="lista" element={<PatientList />} />
      <Route path="detalle/:id" element={<PatientDetail />} />
    </Routes>
  );
}

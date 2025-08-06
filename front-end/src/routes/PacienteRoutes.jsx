import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PatientRegistrationForm from '../Components/patients/PatientRegistrationForm';
import PatientList from '../Components/patients/PatientList';

export default function PacienteRoutes() {
  return (
    <Routes>
      <Route path="registrar" element={<PatientRegistrationForm />} />
      <Route path="lista" element={<PatientList />} />
    </Routes>
  );
}

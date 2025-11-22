import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TreatmentRegister from '../Components/treatment/TreatmentRegister';
import TreatmentsModulePage from '../pages/TreatmentsModulePage';
import { TreatmentProvider } from '../Components/context/TreatmentContext';

export default function TratamientoRoutes() {
  return (
    <TreatmentProvider>
      <Routes>
        <Route index element={<Navigate to="lista" replace />} />
        <Route path="registrar" element={<TreatmentRegister />} />
        <Route path="lista" element={<TreatmentsModulePage />} />
      </Routes>
    </TreatmentProvider>
  );
}

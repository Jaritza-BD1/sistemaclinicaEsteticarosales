import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TreatmentRegister from '../Components/treatment/TreatmentRegister';
import TreatmentList from '../Components/treatment/TreatmentList';
import { TreatmentProvider } from '../Components/context/TreatmentContext';

export default function TratamientoRoutes() {
  return (
    <TreatmentProvider>
      <Routes>
        <Route path="registrar" element={<TreatmentRegister />} />
        <Route path="lista" element={<TreatmentList />} />
      </Routes>
    </TreatmentProvider>
  );
}

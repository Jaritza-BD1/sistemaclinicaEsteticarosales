import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DoctorRegistrationPage from '../pages/DoctorRegistrationPage';
import DoctorListPage from '../pages/DoctorListPage';

export default function DoctorRoutes() {
  return (
    <Routes>
      {/* Index route so `/medicos` shows the list by default */}
      <Route index element={<DoctorListPage />} />
      <Route path="registrar" element={<DoctorRegistrationPage />} />
      <Route path="lista" element={<DoctorListPage />} />
    </Routes>
  );
}

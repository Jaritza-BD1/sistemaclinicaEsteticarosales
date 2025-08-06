import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DoctorRegistrationPage from '../pages/DoctorRegistrationPage';
import DoctorListPage from '../pages/DoctorListPage';

export default function DoctorRoutes() {
  return (
    <Routes>
      <Route path="registrar" element={<DoctorRegistrationPage />} />
      <Route path="lista" element={<DoctorListPage />} />
    </Routes>
  );
}

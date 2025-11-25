import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DoctorList from '../Components/doctors/DoctorList';
import DoctorPage from '../pages/DoctorPage';

export default function DoctorRoutes() {
  return (
    <Routes>
      {/* Index route so `/medicos` shows the list by default */}
      <Route index element={<DoctorList/>} />
      <Route path="lista" element={<DoctorPage />} />
    </Routes>
  );
}

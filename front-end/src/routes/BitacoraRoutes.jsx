import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BitacoraConsulta from '../Components/dashboard/BitacoraConsulta';
import BitacoraEstadisticas from '../Components/dashboard/BitacoraEstadisticas';

const BitacoraRoutes = () => (
  <Routes>
    <Route path="/" element={<BitacoraConsulta />} />
    <Route path="/estadisticas" element={<BitacoraEstadisticas />} />
  </Routes>
);

export default BitacoraRoutes; 
// src/routes/CajaRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PagosPendientesPage from '../pages/PagosPendientesPage';

const CajaRoutes = () => {
  return (
    <Routes>
      <Route path="pagos-pendientes" element={<PagosPendientesPage />} />
      {/* Aquí se pueden agregar más rutas relacionadas con caja en el futuro */}
    </Routes>
  );
};

export default CajaRoutes;
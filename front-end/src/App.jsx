import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/main.css'; // Estilos globales
import LoginPage from './pages/LoginPage';
import AppLayout from './layouts/AppLayout';
import BackupPage from './Components/Backup';
import CitasRoutes from './routes/CitasRoutes';
import MantenimientoDynamicPage from './pages/MantenimientoDynamicPage';
import ConfiguracionParametros from './pages/ConfiguracionParametros';
import PatientPage from './pages/PatientPage';
import DoctorPage from './pages/DoctorPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Otras rutas... */}
        <Route
          path="/citas/*"
          element={
            <AppLayout>
              <CitasRoutes />
            </AppLayout>
          }
        />
        {/* La funcionalidad de crear cita ahora está en pestañas dentro de /citas */}
        <Route
          path="/mantenimiento/:category/:model"
          element={
            <AppLayout>
              <MantenimientoDynamicPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/backup"
          element={
            <AppLayout>
              <BackupPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/backup/crear"
          element={
            <AppLayout>
              <BackupPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/backup/restaurar"
          element={
            <AppLayout>
              <BackupPage />
            </AppLayout>
          }
        />
        <Route
          path="/configuracion/parametros"
          element={
            <AppLayout>
              <ConfiguracionParametros />
            </AppLayout>
          }
        />
        <Route
          path="/pacientes/*"
          element={
            <AppLayout>
              <PatientPage />
            </AppLayout>
          }
        />
        <Route
          path="/medicos"
          element={
            <AppLayout>
              <DoctorPage />
            </AppLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
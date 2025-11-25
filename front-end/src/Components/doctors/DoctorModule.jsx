import React, { useState } from 'react';
import './doctor-module.css';
import { useDispatch } from 'react-redux';
import DoctorList from './DoctorList';
import DoctorRegistrationForm from './DoctorRegistrationForm';
import { createDoctor, updateDoctor } from '../../redux/doctors/doctorsSlice';
import { useNotifications } from '../../context/NotificationsContext';
import ConsultationList from '../patients/ConsultationList';
import ReportsPage from '../../pages/ConsultasMedicosReportesPage';
import CitasDiaPage from '../../pages/CitasDiaPage';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function DoctorModule() {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const { notify } = useNotifications();

  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setViewDetailsModal(true);
  };

  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedDoctor(null);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setRefresh(r => !r);
    notify({ message: 'Médico guardado correctamente', severity: 'success' });
  };

  const handleSave = async (doctorData) => {
    try {
      if (selectedDoctor && selectedDoctor.atr_id_medico) {
        await dispatch(updateDoctor({ id: selectedDoctor.atr_id_medico, doctorData })).unwrap();
      } else {
        await dispatch(createDoctor(doctorData)).unwrap();
      }
      setShowModal(false);
      handleSuccess();
    } catch (err) {
      notify({ message: err?.message || 'Error al guardar médico', severity: 'error' });
      throw err;
    }
  };

  // La eliminación ahora la maneja internamente `DoctorList` (despacha el thunk)
  return (
    <div className="doctor-module-container">
      <header className="module-header">
        <div className="module-head-inner">
          <h1 className="module-title">Gestión de Médicos</h1>
          <h2 className="module-subtitle">Médicos</h2>
        </div>
      </header>

      <DoctorList 
        onEdit={handleEdit}
        onViewDetails={handleViewDetails}
        onRegisterNew={handleAdd}
        refresh={refresh} 
      />

      <div style={{ marginTop: 16 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Lista de Consultas</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ConsultationList />
          </AccordionDetails>
        </Accordion>
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Citas del Día</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <CitasDiaPage />
          </AccordionDetails>
        </Accordion>

        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Reporte de Médicos y Consultas</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ReportsPage />
          </AccordionDetails>
        </Accordion>
      </div>
      <DoctorRegistrationForm
        open={showModal}
        onClose={() => setShowModal(false)}
        initialData={selectedDoctor}
        onSave={handleSave}
        onCancel={() => setShowModal(false)}
        autoCloseOnSave={false}
      />
      {/* Modal para ver detalles (modo lectura) */}
      <DoctorRegistrationForm
        open={viewDetailsModal}
        onClose={() => setViewDetailsModal(false)}
        initialData={selectedDoctor}
        readOnly={true}
        autoCloseOnSave={false}
      />
    </div>
  );
} 
import React, { useState } from 'react';
import { Button, Toast, ToastContainer } from 'react-bootstrap';
import PatientList from './PatientList';
import PatientModal from './PatientModal';
import { deletePatient } from '../../services/patientService';

export default function PatientModule() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', bg: 'success' });

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedPatient(null);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setRefresh(r => !r);
    setToast({ show: true, message: 'Paciente guardado correctamente', bg: 'success' });
  };

  const handleDelete = async (id) => {
    try {
      await deletePatient(id);
      setRefresh(r => !r);
      setToast({ show: true, message: 'Paciente eliminado correctamente', bg: 'success' });
    } catch (error) {
      setToast({ show: true, message: 'Error al eliminar paciente', bg: 'danger' });
    }
  };

  return (
    <div>
      <Button variant="success" className="mb-3" onClick={handleAdd}>+ Nuevo Paciente</Button>
      <PatientList onEdit={handleEdit} onDelete={handleDelete} refresh={refresh} />
      <PatientModal
        show={showModal}
        onHide={() => setShowModal(false)}
        initialData={selectedPatient}
        onSuccess={handleSuccess}
        onError={error => setToast({ show: true, message: error?.response?.data?.message || error?.message || 'Error al guardar paciente', bg: 'danger' })}
      />
      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          onClose={() => setToast({ ...toast, show: false })}
          show={toast.show}
          bg={toast.bg}
          delay={2500}
          autohide
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
} 
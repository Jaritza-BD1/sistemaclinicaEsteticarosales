import React, { useState } from 'react';
import { Button, Toast, ToastContainer } from 'react-bootstrap';
import DoctorList from './DoctorList';
import DoctorModal from './DoctorModal';
import { deleteDoctor } from '../../services/doctorService';

export default function DoctorModule() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', bg: 'success' });

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
    setToast({ show: true, message: 'Médico guardado correctamente', bg: 'success' });
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoctor(id);
      setRefresh(r => !r);
      setToast({ show: true, message: 'Médico eliminado correctamente', bg: 'success' });
    } catch (error) {
      setToast({ show: true, message: 'Error al eliminar médico', bg: 'danger' });
    }
  };

  return (
    <div>
      <Button variant="success" className="mb-3" onClick={handleAdd}>+ Nuevo Médico</Button>
      <DoctorList onEdit={handleEdit} onDelete={handleDelete} refresh={refresh} />
      <DoctorModal
        show={showModal}
        onHide={() => setShowModal(false)}
        initialData={selectedDoctor}
        onSuccess={handleSuccess}
        onError={error => setToast({ show: true, message: error?.response?.data?.message || error?.message || 'Error al guardar médico', bg: 'danger' })}
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
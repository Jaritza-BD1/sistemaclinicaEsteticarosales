import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorRegistrationForm from '../Components/doctors/DoctorRegistrationForm';
import { createDoctor } from '../services/doctorService';
import { Snackbar, Alert } from '@mui/material';

export default function DoctorRegistrationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCancel = () => {
    navigate('/medicos');
  };

  const handleSave = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await createDoctor(formData);
      navigate('/medicos');
    } catch (err) {
      console.error('Error creating doctor:', err);
      setError(err.response?.data?.message || err.message || 'Error al guardar el médico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <DoctorRegistrationForm onSave={handleSave} onCancel={handleCancel} loading={loading} />

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
}

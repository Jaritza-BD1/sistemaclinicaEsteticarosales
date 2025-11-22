import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Button,
  Box,
  Alert
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useAuth } from './context/AuthContext';
import { useConsultations } from '../hooks/useConsultations';

const ConsultationForm = ({ appointmentId, appointment, consultation, onConsultationSaved }) => {
  const { user } = useAuth();
  const { create, update, loading, errors } = useConsultations();

  const [saving, setSaving] = useState(false);

  // Form fields
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [observations, setObservations] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [temperature, setTemperature] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  useEffect(() => {
    if (consultation) {
      // Preload existing consultation data
      setSymptoms(consultation.atr_sintomas_paciente || '');
      setDiagnosis(consultation.atr_diagnostico || '');
      setObservations(consultation.atr_observaciones || '');
      setWeight(consultation.atr_peso || '');
      setHeight(consultation.atr_altura || '');
      setTemperature(consultation.atr_temperatura || '');
      setClinicalNotes(consultation.atr_notas_clinicas || '');
    }
  }, [consultation]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const data = {
        appointmentId: parseInt(appointmentId),
        pacienteId: appointment.atr_id_paciente,
        medicoId: appointment.atr_id_medico,
        sintomas: symptoms,
        diagnostico: diagnosis,
        observaciones: observations,
        peso: weight ? parseFloat(weight) : null,
        altura: height ? parseFloat(height) : null,
        temperatura: temperature ? parseFloat(temperature) : null,
        seguimiento: false, // Default
        sigVisitDia: null // Default
      };

      if (consultation) {
        // Update existing consultation
        await update(consultation.atr_id_consulta, data);
      } else {
        // Create new consultation
        await create(data);
      }

      onConsultationSaved();
    } catch (err) {
      console.error('Error guardando la consulta:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Información de la Consulta</Typography>

        {errors.create && <Alert severity="error" sx={{ mb: 2 }}>{errors.create}</Alert>}
        {errors.update && <Alert severity="error" sx={{ mb: 2 }}>{errors.update}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Síntomas del Paciente"
              multiline
              rows={4}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describa los síntomas presentados por el paciente"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Diagnóstico"
              multiline
              rows={4}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Ingrese el diagnóstico médico"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Observaciones"
              multiline
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observaciones adicionales sobre la consulta"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Peso (kg)"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              inputProps={{ min: 0, max: 500, step: 0.1 }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Altura (cm)"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              inputProps={{ min: 0, max: 300, step: 0.1 }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Temperatura (°C)"
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              inputProps={{ min: 30, max: 45, step: 0.1 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notas Clínicas"
              multiline
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Notas clínicas adicionales, tratamientos recomendados, etc."
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving || loading.create || loading.update}
            size="large"
          >
            {saving || loading.create || loading.update ? 'Guardando...' : (consultation ? 'Actualizar Consulta' : 'Guardar Consulta')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConsultationForm;
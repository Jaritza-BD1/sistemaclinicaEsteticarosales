import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import usePatients from '../../hooks/usePatients';
import useAppointments from '../../hooks/useAppointments';

const SummaryChip = ({ label, value, color = 'primary' }) => (
  <Chip label={`${label}: ${value ?? 0}`} color={color} size="medium" sx={{ mr: 1 }} />
);

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    history,
    loadHistory,
    loadPatient,
    clearHist
  } = usePatients();
  const { setSelectedPatient } = useAppointments();

  useEffect(() => {
    if (!id) return;
    // Load history (includes patient data) and also ensure patient detail loaded
    loadHistory(id).catch(() => {});
    loadPatient(id).catch(() => {});

    return () => {
      // clear history when leaving
      clearHist();
    };
  }, [id, loadHistory, loadPatient, clearHist]);

  const patient = history?.patient || null;
  const meta = history?.meta || {};
  const counts = meta.counts || {};

  const handleSelect = () => {
    if (patient) {
      setSelectedPatient(patient);
      navigate('/citas/agendar');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {patient ? `${patient.atr_nombre} ${patient.atr_apellido}` : 'Paciente'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  <strong>Expediente:</strong> {patient?.atr_numero_expediente || '-'} •
                  <strong style={{ marginLeft: 8 }}>Identidad:</strong> {patient?.atr_identidad || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Fecha de Nacimiento:</strong> {patient?.atr_fecha_nacimiento || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  <strong>Género:</strong> {patient?.atr_genero || patient?.atr_id_genero || '-'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="contained" color="primary" onClick={handleSelect}>
                  Seleccionar para cita
                </Button>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Resumen</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <SummaryChip label="Citas" value={counts.appointments ?? counts.citas ?? 0} color="primary" />
              <SummaryChip label="Consultas" value={counts.consultations ?? counts.consultas ?? 0} color="secondary" />
              <SummaryChip label="Exámenes" value={counts.orders ?? counts.examenes ?? 0} color="info" />
              <SummaryChip label="Tratamientos" value={counts.treatments ?? counts.tratamientos ?? 0} color="success" />
            </Box>
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Historial de Citas</Typography>
            <Divider sx={{ mb: 1 }} />
            <List dense>
              {(history?.citas || []).slice(0, 8).map((cita) => (
                <ListItem key={cita.id || cita.atr_id_cita || Math.random()} divider>
                  <ListItemText
                    primary={`${cita.title || cita.motivo || cita.tipo || cita.tipo_cita || 'Cita'} — ${cita.start ? new Date(cita.start).toLocaleString() : cita.fecha || '-'}`}
                    secondary={`${cita.doctorName || cita.medico || (cita.Doctor && cita.Doctor.atr_nombre) || ''} • ${cita.status || cita.estado || ''}`}
                  />
                </ListItem>
              ))}
              {(!history || (history.citas || []).length === 0) && (
                <ListItem>
                  <ListItemText primary="No hay citas registradas" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Exámenes Recientes</Typography>
            <Divider sx={{ my: 1 }} />
            <List dense>
              {(history?.examenes || history?.orders || []).slice(0, 6).map((ord) => (
                <ListItem key={ord.id || ord.atr_id || Math.random()}>
                  <ListItemText
                    primary={ord.nombre || ord.tipo || ord.examen?.atr_nombre || ord.title || 'Orden de examen'}
                    secondary={ord.createdAt ? new Date(ord.createdAt).toLocaleString() : ord.fecha || ''}
                  />
                </ListItem>
              ))}
              {((history?.examenes || history?.orders || []).length === 0) && (
                <ListItem>
                  <ListItemText primary="No hay órdenes de examen" />
                </ListItem>
              )}
            </List>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Tratamientos</Typography>
            <Divider sx={{ my: 1 }} />
            <List dense>
              {(history?.tratamientos || history?.treatments || []).slice(0, 6).map((t) => (
                <ListItem key={t.id || t.atr_id || Math.random()}>
                  <ListItemText
                    primary={t.nombre_tratamiento || t.atr_nombre || t.title || 'Tratamiento'}
                    secondary={t.estado || t.status || ''}
                  />
                </ListItem>
              ))}
              {((history?.tratamientos || history?.treatments || []).length === 0) && (
                <ListItem>
                  <ListItemText primary="No hay tratamientos registrados" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

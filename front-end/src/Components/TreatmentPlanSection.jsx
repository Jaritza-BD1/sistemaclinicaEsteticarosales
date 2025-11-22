import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  Chip,
  Alert,
  Grid
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import api from '../services/api';

const TreatmentPlanSection = ({ consultationId }) => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [treatmentType, setTreatmentType] = useState('');
  const [sessions, setSessions] = useState(1);
  const [observations, setObservations] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (consultationId) {
      loadTreatments();
    }
  }, [consultationId]);

  const loadTreatments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/consultations/${consultationId}/treatments`);
      setTreatments(res.data.data);
    } catch (err) {
      setError('Error cargando tratamientos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTreatment = async () => {
    if (!treatmentType.trim()) {
      setError('El tipo de tratamiento es requerido');
      return;
    }

    if (sessions < 1) {
      setError('El número de sesiones debe ser al menos 1');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const data = {
        tratamientos: [{
          tipo: treatmentType.trim(),
          sesiones: parseInt(sessions),
          observaciones: observations.trim(),
          productoId: null // Optional, can be added later
        }]
      };

      await api.post(`/consultations/${consultationId}/treatments`, data);
      await loadTreatments(); // Reload treatments

      // Reset form
      setTreatmentType('');
      setSessions(1);
      setObservations('');
      setDialogOpen(false);
    } catch (err) {
      setError('Error creando tratamiento');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getProcedureStatusColor = (status) => {
    switch (status) {
      case 'PROGRAMADO': return 'info';
      case 'COMPLETADO': return 'success';
      case 'CANCELADO': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Plan de Tratamientos Estéticos</Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            disabled={!consultationId}
          >
            Agregar Tratamiento
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Typography>Cargando tratamientos...</Typography>
        ) : treatments.length === 0 ? (
          <Typography color="textSecondary">No hay tratamientos registrados</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha Inicio</TableCell>
                  <TableCell>Tipo de Tratamiento</TableCell>
                  <TableCell>Sesiones</TableCell>
                  <TableCell>Observaciones</TableCell>
                  <TableCell>Estado de Sesiones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {treatments.map((treatment) => (
                  <TableRow key={treatment.atr_id_tratamiento}>
                    <TableCell>{new Date(treatment.atr_fecha_inicio).toLocaleDateString()}</TableCell>
                    <TableCell>{treatment.atr_tipo_tratamiento}</TableCell>
                    <TableCell>{treatment.atr_numero_sesiones}</TableCell>
                    <TableCell>{treatment.atr_observaciones || '-'}</TableCell>
                    <TableCell>
                      {treatment.Procedures?.map((procedure, index) => (
                        <Chip
                          key={index}
                          label={`Sesión ${index + 1}: ${procedure.atr_estado}`}
                          color={getProcedureStatusColor(procedure.atr_estado)}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Create Treatment Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Crear Tratamiento Estético</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Tipo de Tratamiento"
                value={treatmentType}
                onChange={(e) => setTreatmentType(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Ej: Limpieza facial, Peeling químico, etc."
                required
              />
              <TextField
                fullWidth
                label="Número de Sesiones"
                type="number"
                value={sessions}
                onChange={(e) => setSessions(e.target.value)}
                inputProps={{ min: 1, max: 50 }}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Observaciones"
                multiline
                rows={3}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Indicaciones especiales, contraindicaciones, etc."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleCreateTreatment}
              disabled={saving}
            >
              {saving ? 'Creando...' : 'Crear Tratamiento'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TreatmentPlanSection;
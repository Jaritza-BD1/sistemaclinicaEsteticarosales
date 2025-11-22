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
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import api from '../services/api';

const ExamsSection = ({ consultationId }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [examName, setExamName] = useState('');
  const [examObservation, setExamObservation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (consultationId) {
      loadExams();
    }
  }, [consultationId]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/consultations/${consultationId}/exams`);
      setExams(res.data.data);
    } catch (err) {
      setError('Error cargando exámenes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExam = async () => {
    if (!examName.trim()) {
      setError('El nombre del examen es requerido');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const data = {
        exams: [{
          nombre: examName.trim(),
          observacion: examObservation.trim()
        }]
      };

      await api.post(`/consultations/${consultationId}/exams`, data);
      await loadExams(); // Reload exams

      // Reset form
      setExamName('');
      setExamObservation('');
      setDialogOpen(false);
    } catch (err) {
      setError('Error creando orden de examen');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDIENTE': return 'warning';
      case 'EN_PROCESO': return 'info';
      case 'COMPLETADO': return 'success';
      case 'CANCELADO': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Órdenes de Examen</Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            disabled={!consultationId}
          >
            Agregar Examen
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Typography>Cargando exámenes...</Typography>
        ) : exams.length === 0 ? (
          <Typography color="textSecondary">No hay órdenes de examen registradas</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha Solicitud</TableCell>
                  <TableCell>Examen</TableCell>
                  <TableCell>Observación</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Resultado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exams.map((exam) =>
                  exam.detalles?.map((detalle) => (
                    <TableRow key={detalle.atr_id_orden_detalle}>
                      <TableCell>{new Date(exam.atr_fecha_solicitud).toLocaleDateString()}</TableCell>
                      <TableCell>{detalle.examen?.atr_nombre_examen}</TableCell>
                      <TableCell>{detalle.atr_observacion || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={exam.atr_resultados_disponibles ? 'Disponible' : 'Pendiente'}
                          color={exam.atr_resultados_disponibles ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{exam.atr_resultados || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Add Exam Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Agregar Orden de Examen</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Nombre del Examen"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Observación"
                multiline
                rows={3}
                value={examObservation}
                onChange={(e) => setExamObservation(e.target.value)}
                placeholder="Indicaciones adicionales para el examen"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleAddExam}
              disabled={saving}
            >
              {saving ? 'Creando...' : 'Crear Orden'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ExamsSection;
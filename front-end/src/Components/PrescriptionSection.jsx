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
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import api from '../services/api';

const PrescriptionSection = ({ consultationId }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [medicines, setMedicines] = useState([{ medicamentoId: '', nombre: '', dosis: '', frecuencia: '', duracion: '' }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (consultationId) {
      loadPrescriptions();
    }
  }, [consultationId]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/consultations/${consultationId}/prescriptions`);
      setPrescriptions(res.data.data);
    } catch (err) {
      setError('Error cargando recetas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { medicamentoId: '', nombre: '', dosis: '', frecuencia: '', duracion: '' }]);
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field] = value;
    setMedicines(updatedMedicines);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
  };

  const handleCreatePrescription = async () => {
    // Validate medicines
    const validMedicines = medicines.filter(med => med.nombre.trim() && med.dosis.trim() && med.duracion.trim());
    if (validMedicines.length === 0) {
      setError('Debe agregar al menos un medicamento válido');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const data = {
        medicamentos: validMedicines.map(med => ({
          medicamentoId: med.medicamentoId || 1, // Default ID if not selected
          nombre: med.nombre,
          dosis: med.dosis,
          frecuencia: med.frecuencia,
          duracion: med.duracion
        }))
      };

      await api.post(`/consultations/${consultationId}/prescriptions`, data);
      await loadPrescriptions(); // Reload prescriptions

      // Reset form
      setMedicines([{ medicamentoId: '', nombre: '', dosis: '', frecuencia: '', duracion: '' }]);
      setDialogOpen(false);
    } catch (err) {
      setError('Error creando receta');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDIENTE_ENTREGA': return 'warning';
      case 'ENTREGADA': return 'success';
      case 'CANCELADA': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Recetas Médicas</Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            disabled={!consultationId}
          >
            Crear Receta
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Typography>Cargando recetas...</Typography>
        ) : prescriptions.length === 0 ? (
          <Typography color="textSecondary">No hay recetas registradas</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Medicamentos</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prescriptions.map((prescription) => (
                  <TableRow key={prescription.atr_id_receta}>
                    <TableCell>{prescription.atr_fecha_receta}</TableCell>
                    <TableCell>
                      {prescription.medicamentos?.map((med, index) => (
                        <div key={index}>
                          <strong>{med.atr_nombre_medicamento}</strong><br />
                          Dosis: {med.atr_dosis}, Duración: {med.atr_duracion}
                          {med.atr_frecuencia && `, Frecuencia: ${med.atr_frecuencia}`}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={prescription.atr_estado_receta}
                        color={getStatusColor(prescription.atr_estado_receta)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Create Prescription Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Crear Receta Médica</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>Medicamentos</Typography>
              {medicines.map((medicine, index) => (
                <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nombre del Medicamento"
                        value={medicine.nombre}
                        onChange={(e) => handleMedicineChange(index, 'nombre', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Dosis"
                        value={medicine.dosis}
                        onChange={(e) => handleMedicineChange(index, 'dosis', e.target.value)}
                        placeholder="Ej: 500mg, 1 tableta"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Frecuencia"
                        value={medicine.frecuencia}
                        onChange={(e) => handleMedicineChange(index, 'frecuencia', e.target.value)}
                        placeholder="Ej: Cada 8 horas, 3 veces al día"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Duración"
                        value={medicine.duracion}
                        onChange={(e) => handleMedicineChange(index, 'duracion', e.target.value)}
                        placeholder="Ej: 7 días, 2 semanas"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box display="flex" alignItems="center" height="100%">
                        {medicines.length > 1 && (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleRemoveMedicine(index)}
                            size="small"
                          >
                            Remover
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddMedicine}
                sx={{ mb: 2 }}
              >
                Agregar Otro Medicamento
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleCreatePrescription}
              disabled={saving}
            >
              {saving ? 'Creando...' : 'Crear Receta'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PrescriptionSection;
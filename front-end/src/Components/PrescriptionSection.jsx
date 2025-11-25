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
import { Add as AddIcon, Edit as EditIcon, Print as PrintIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoSvg from '../logo.svg';
import api from '../services/api';

const PrescriptionSection = ({ consultationId }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consultationData, setConsultationData] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [medicines, setMedicines] = useState([{ medicamentoId: '', nombre: '', dosis: '', frecuencia: '', duracion: '' }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (consultationId) {
      loadPrescriptions();
    }
    if (consultationId) loadConsultation();
  }, [consultationId]);

  const loadConsultation = async () => {
    try {
      const res = await api.get(`/consultations/${consultationId}`);
      const data = res && res.data ? res.data.data || res.data : null;
      setConsultationData(data);
    } catch (err) {
      console.error('Error cargando consulta', err);
    }
  };

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

  const handlePrintPrescription = async (prescription) => {
    try {
      const svgResponse = await fetch(logoSvg).then(r => r.text());
      const svgBlob = new Blob([svgResponse], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.src = url;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const desiredHeight = 48;
          const scale = desiredHeight / img.height;
          canvas.width = img.width * scale;
          canvas.height = desiredHeight;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imgData = canvas.toDataURL('image/png');
          URL.revokeObjectURL(url);

          const doc = new jsPDF({ unit: 'pt', format: 'a4' });
          const margin = 40;
          const headerHeight = 48;
          const pageWidth = doc.internal.pageSize.getWidth();

          const drawClinicHeader = () => {
            doc.setFillColor(186, 110, 143);
            doc.rect(0, 0, pageWidth, headerHeight, 'F');
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('Clínica Estética Rosales', margin, headerHeight - 14);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
          };

          drawClinicHeader();

          const imgProps = doc.getImageProperties(imgData);
          const imgWidth = 72;
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
          const logoY = headerHeight + 6;
          doc.addImage(imgData, 'PNG', margin, logoY, imgWidth, imgHeight);

          doc.setFontSize(16);
          doc.setFont(undefined, 'bold');
          doc.text('Receta Médica', margin + imgWidth + 12, logoY + 18);
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Generado: ${new Date().toLocaleString()}`, margin + imgWidth + 12, logoY + 36);

          // Doctor info from consultationData
          const doctor = consultationData?.doctor || {};
          const doctorName = `${doctor.atr_nombre || ''} ${doctor.atr_apellido || ''}`.trim() || '-';
          const doctorSpecialty = (
            (doctor.Especialidades && doctor.Especialidades[0] && (doctor.Especialidades[0].atr_especialidad || doctor.Especialidades[0].atr_nombre)) ||
            (doctor.especialidades && doctor.especialidades[0] && (doctor.especialidades[0].atr_especialidad || doctor.especialidades[0].atr_nombre || doctor.especialidades[0].nombre)) ||
            doctor.especialidad ||
            '-'
          );
          const doctorPhone = (
            doctor.telefono || (Array.isArray(doctor.telefonos) && doctor.telefonos[0] && (doctor.telefonos[0].atr_telefono || doctor.telefonos[0].telefono)) || '-'
          );
          const doctorEmail = (
            doctor.correo || (Array.isArray(doctor.correos) && doctor.correos[0] && (doctor.correos[0].atr_correo || doctor.correos[0].correo)) || '-'
          );

          doc.autoTable({
            startY: logoY + imgHeight + 8,
            theme: 'plain',
            styles: { fontSize: 10 },
            body: [
              [{ content: 'Médico', styles: { fontStyle: 'bold' } }, { content: doctorName }],
              [{ content: 'Especialidad', styles: { fontStyle: 'bold' } }, { content: doctorSpecialty }],
              [{ content: 'Teléfono', styles: { fontStyle: 'bold' } }, { content: doctorPhone }],
              [{ content: 'Correo', styles: { fontStyle: 'bold' } }, { content: doctorEmail }]
            ],
            didDrawPage: (data) => { drawClinicHeader(); }
          });

          // Medicines table
          const meds = (prescription.medicamentos || []).map((m, i) => [i + 1, m.atr_nombre_medicamento || m.nombre || m.nombre_medicamento || '', m.atr_dosis || m.dosis || '', m.atr_frecuencia || m.frecuencia || '', m.atr_duracion || m.duracion || '']);

          const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : logoY + imgHeight + 40;
          doc.autoTable({
            startY,
            head: [['#', 'Medicamento', 'Dosis', 'Frecuencia', 'Duración']],
            body: meds,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [245,245,247], textColor: 40 }
          });

          const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : startY + 80;
          doc.setFontSize(9);
          doc.text('Documento generado desde la aplicación.', margin, finalY);

          const fileName = `receta_${prescription.atr_id_receta || Date.now()}.pdf`;
          doc.save(fileName);
        } catch (err) {
          console.error('Error creando PDF de receta', err);
          setError('Error al generar PDF');
        }
      };

      img.onerror = (e) => {
        console.error('Error cargando logo SVG para PDF', e);
        setError('No se pudo cargar el logo para generar el PDF');
      };
    } catch (err) {
      console.error('Error generando PDF', err);
      setError('Error al generar PDF/Imprimir');
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
                  <TableCell align="center">Acciones</TableCell>
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
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => {/* future edit handler */}} title="Editar">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handlePrintPrescription(prescription)} title="Imprimir">
                        <PrintIcon fontSize="small" />
                      </IconButton>
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
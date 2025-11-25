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
import { Add as AddIcon, Edit as EditIcon, Print as PrintIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoSvg from '../logo.svg';
import api from '../services/api';

const ExamsSection = ({ consultationId }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consultationData, setConsultationData] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [examName, setExamName] = useState('');
  const [examObservation, setExamObservation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (consultationId) {
      loadExams();
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

  const handlePrintExam = async (exam) => {
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
          doc.text('Orden de Examen', margin + imgWidth + 12, logoY + 18);
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Generado: ${new Date().toLocaleString()}`, margin + imgWidth + 12, logoY + 36);

          // Doctor info
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

          // Details table
          const rows = (exam.detalles || []).map((d, i) => [i + 1, d.examen?.atr_nombre_examen || '-', d.atr_observacion || '-', exam.atr_resultados_disponibles ? 'Disponible' : 'Pendiente', exam.atr_resultados || '-']);
          const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : logoY + imgHeight + 40;

          doc.autoTable({
            startY,
            head: [['#', 'Examen', 'Observación', 'Estado', 'Resultado']],
            body: rows,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [245,245,247], textColor: 40 }
          });

          const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : startY + 80;
          doc.setFontSize(9);
          doc.text('Documento generado desde la aplicación.', margin, finalY);

          const fileName = `orden_examen_${exam.atr_id_orden_exa || Date.now()}.pdf`;
          doc.save(fileName);
        } catch (err) {
          console.error('Error creando PDF de examen', err);
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
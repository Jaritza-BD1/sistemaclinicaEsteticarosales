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
  MenuItem
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Print as PrintIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoSvg from '../logo.svg';
import api from '../services/api';
import { getAllProducts } from '../services/pharmacyService';

const TreatmentPlanSection = ({ consultationId }) => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [treatmentType, setTreatmentType] = useState('');
  const [sessions, setSessions] = useState(1);
  const [observations, setObservations] = useState('');
  const [productoId, setProductoId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [consultationData, setConsultationData] = useState(null);
  const [loadingConsultation, setLoadingConsultation] = useState(false);

  useEffect(() => {
    if (consultationId) {
      loadTreatments();
    }
    // cargar catálogo de productos para el select (independiente de consultationId)
    loadProducts();
    if (consultationId) loadConsultation();
  }, [consultationId]);

  const loadConsultation = async () => {
    try {
      setLoadingConsultation(true);
      const res = await api.get(`/consultations/${consultationId}`);
      const data = res && res.data ? res.data.data || res.data : null;
      setConsultationData(data);
    } catch (err) {
      console.error('Error cargando consulta', err);
    } finally {
      setLoadingConsultation(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await getAllProducts();
      // Respuesta puede venir en res.data.data o res.data
      const items = res && res.data ? (res.data.data || res.data) : [];
      setProducts(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Error cargando productos', err);
    } finally {
      setLoadingProducts(false);
    }
  };

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

      const tratPayload = {
        tipo: treatmentType.trim(),
        sesiones: parseInt(sessions),
        observaciones: observations.trim()
      };
      if (productoId) {
        tratPayload.productoId = productoId;
      }

      const data = { tratamientos: [tratPayload] };

      if (isEditing && editingId) {
        // Update existing treatment
        await api.put(`/consultations/${consultationId}/treatments/${editingId}`, data);
      } else {
        // Create new treatment
        await api.post(`/consultations/${consultationId}/treatments`, data);
      }
      await loadTreatments(); // Reload treatments

      // Reset form
      setTreatmentType('');
      setSessions(1);
      setObservations('');
      setDialogOpen(false);
      setIsEditing(false);
      setEditingId(null);
    } catch (err) {
      setError('Error creando tratamiento');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (treatment) => {
    // Populate dialog fields with treatment data
    setEditingId(treatment.atr_id_tratamiento);
    setIsEditing(true);
    setTreatmentType(treatment.atr_tipo_tratamiento || '');
    setSessions(treatment.atr_numero_sesiones || 1);
    setObservations(treatment.atr_observaciones || '');
    // Try to preselect product if available
    if (treatment.atr_producto_id) {
      setProductoId(treatment.atr_producto_id);
    } else if (treatment.Producto && treatment.Producto.atr_id_producto) {
      setProductoId(treatment.Producto.atr_id_producto);
    } else {
      setProductoId(null);
    }
    setDialogOpen(true);
  };

  const handlePrintTreatment = async (treatment) => {
    try {
      // Generate PDF using jsPDF + autotable and embed logo.svg (convert to PNG via canvas)
      const svgResponse = await fetch(logoSvg).then(r => r.text());
      const svgBlob = new Blob([svgResponse], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.src = url;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const desiredHeight = 48; // px for logo in PDF
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

          // Draw header on first page
          drawClinicHeader();

          let cursorY = headerHeight + 12;

          // Add logo
          const imgProps = doc.getImageProperties(imgData);
          const imgWidth = 72; // pts
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
          const logoY = headerHeight + 6;
          doc.addImage(imgData, 'PNG', margin, logoY, imgWidth, imgHeight);

          // Header text (to the right of logo)
          doc.setFontSize(16);
          doc.setFont(undefined, 'bold');
          doc.text('Plan de Tratamiento Estético', margin + imgWidth + 12, logoY + 18);
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Generado: ${new Date().toLocaleString()}`, margin + imgWidth + 12, logoY + 36);

          // Patient and doctor info (if available)
          const patient = consultationData?.patient || {};
          const doctor = consultationData?.doctor || {};
          const patientName = `${patient.atr_nombre || ''} ${patient.atr_apellido || ''}`.trim() || '-';
          const patientId = patient.atr_identidad || '-';
          const doctorName = `${doctor.atr_nombre || ''} ${doctor.atr_apellido || ''}`.trim() || '-';

          // Extract specialty: try several shapes (Especialidades array, especialidades, especialidad)
          const doctorSpecialty = (
            (doctor.Especialidades && doctor.Especialidades[0] && (doctor.Especialidades[0].atr_especialidad || doctor.Especialidades[0].atr_nombre)) ||
            (doctor.especialidades && doctor.especialidades[0] && (doctor.especialidades[0].atr_especialidad || doctor.especialidades[0].atr_nombre || doctor.especialidades[0].nombre)) ||
            doctor.especialidad ||
            '-'
          );

          // Extract phone and email: accept flat fields or arrays
          const doctorPhone = (
            doctor.telefono ||
            (Array.isArray(doctor.telefonos) && doctor.telefonos[0] && (doctor.telefonos[0].atr_telefono || doctor.telefonos[0].telefono || doctor.telefonos[0].value)) ||
            '-'
          );
          const doctorEmail = (
            doctor.correo ||
            (Array.isArray(doctor.correos) && doctor.correos[0] && (doctor.correos[0].atr_correo || doctor.correos[0].correo || doctor.correos[0].email)) ||
            '-'
          );

          doc.autoTable({
            startY: cursorY + imgHeight - 6,
            theme: 'plain',
            styles: { fontSize: 10 },
            body: [
              [{ content: 'Paciente', styles: { fontStyle: 'bold' } }, { content: patientName }],
              [{ content: 'Documento', styles: { fontStyle: 'bold' } }, { content: patientId }],
              [{ content: 'Médico', styles: { fontStyle: 'bold' } }, { content: doctorName }],
              [{ content: 'Especialidad', styles: { fontStyle: 'bold' } }, { content: doctorSpecialty }],
              [{ content: 'Teléfono', styles: { fontStyle: 'bold' } }, { content: doctorPhone }],
              [{ content: 'Correo', styles: { fontStyle: 'bold' } }, { content: doctorEmail }]
            ],
            didDrawPage: (data) => {
              // Draw clinic header on each page
              drawClinicHeader();
            }
          });

          cursorY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : cursorY + imgHeight + 18;

          // Treatment details
          doc.setFontSize(11);
          const details = [
            ['Tipo', treatment.atr_tipo_tratamiento || '-'],
            ['Fecha Inicio', treatment.atr_fecha_inicio ? new Date(treatment.atr_fecha_inicio).toLocaleDateString() : '-'],
            ['Sesiones', treatment.atr_numero_sesiones?.toString() || '-'],
            ['Observaciones', (treatment.atr_observaciones || '-').toString()]
          ];

          doc.autoTable({
            startY: cursorY,
            theme: 'plain',
            styles: { fontSize: 10 },
            tableLineWidth: 0,
            body: details.map(d => [{ content: d[0], styles: { fontStyle: 'bold' } }, { content: d[1] }]),
            didDrawCell: (data) => {}
          });

          cursorY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : cursorY + 80;

          // Procedures table
          const procedures = (treatment.Procedures || []).map((p, i) => ({
            no: i + 1,
            fecha: p.atr_fecha ? new Date(p.atr_fecha).toLocaleDateString() : '-',
            estado: p.atr_estado || '-'
          }));

          doc.autoTable({
            startY: cursorY,
            head: [['#', 'Fecha', 'Estado']],
            body: procedures.map(row => [row.no, row.fecha, row.estado]),
            styles: { fontSize: 10 },
            headStyles: { fillColor: [245,245,247], textColor: 40 }
          });

          // Footer note
          const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : cursorY + 80;
          doc.setFontSize(9);
          doc.text('Documento generado desde la aplicación.', margin, finalY);

          // Save PDF
          const fileName = `tratamiento_${treatment.atr_id_tratamiento || Date.now()}.pdf`;
          doc.save(fileName);
        } catch (err) {
          console.error('Error creando PDF', err);
          setError('Error al generar PDF');
        }
      };

      img.onerror = (e) => {
        console.error('Error cargando logo SVG para PDF', e);
        setError('No se pudo cargar el logo para generar el PDF');
      };
    } catch (err) {
      console.error('Error imprimiendo tratamiento', err);
      setError('Error al generar PDF/Imprimir');
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
                  <TableCell align="center">Acciones</TableCell>
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
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => openEditDialog(treatment)} title="Editar">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handlePrintTreatment(treatment)} title="Imprimir">
                        <PrintIcon fontSize="small" />
                      </IconButton>
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
              <Box sx={{ mt: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="Producto (opcional)"
                  value={productoId || ''}
                  onChange={(e) => setProductoId(e.target.value ? Number(e.target.value) : null)}
                  helperText={loadingProducts ? 'Cargando productos...' : 'Seleccione un producto relacionado al tratamiento'}
                >
                  <MenuItem value="">Ninguno</MenuItem>
                  {products.map(p => (
                    <MenuItem key={p.atr_id_producto} value={p.atr_id_producto}>
                      {p.atr_nombre_producto} {p.atr_precio_venta_unitario ? `- $${Number(p.atr_precio_venta_unitario).toFixed(2)}` : ''}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
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
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { Visibility as VisibilityIcon, Delete as DeleteIcon, Print as PrintIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoSvg from '../../logo.svg';
import * as consultationService from '../../services/consultationService';

const HistorialConsultas = ({ patientId }) => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    if (patientId) loadConsultas(patientId);
  }, [patientId]);

  const loadConsultas = async (pid) => {
    try {
      setLoading(true);
      setError('');
      const res = await consultationService.fetchConsultationsByPatient(pid);
      const data = res && res.data ? (res.data.data || res.data) : [];
      setConsultas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando historiales de consulta', err);
      setError('No se pudieron cargar las consultas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta consulta? Esta acción no se puede deshacer.')) return;
    try {
      await consultationService.deleteConsultation(id);
      setConsultas(prev => prev.filter(c => (c.atr_id_consulta || c.id) !== id && (c.id || c.atr_id_consulta) !== id));
    } catch (err) {
      console.error('Error eliminando consulta', err);
      alert('Error al eliminar la consulta');
    }
  };

  const handlePrint = async (consulta) => {
    try {
      const svgText = await fetch(logoSvg).then(r => r.text());
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.src = url;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const desiredHeight = 72;
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
          doc.text('Historial de Consulta Médica', margin + imgWidth + 12, logoY + 18);
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Generado: ${new Date().toLocaleString()}`, margin + imgWidth + 12, logoY + 36);

          const startY = logoY + imgHeight + 12;

          const patientName = (consulta?.patient?.atr_nombre || consulta?.patient?.nombre || consulta?.paciente?.atr_nombre || '') + ' ' + (consulta?.patient?.atr_apellido || consulta?.patient?.apellido || consulta?.paciente?.atr_apellido || '');

          doc.autoTable({
            startY,
            theme: 'plain',
            styles: { fontSize: 10 },
            body: [
              [{ content: 'Paciente', styles: { fontStyle: 'bold' } }, { content: patientName.trim() || '-' }],
              [{ content: 'Fecha', styles: { fontStyle: 'bold' } }, { content: consulta?.atr_fecha_consulta ? new Date(consulta.atr_fecha_consulta).toLocaleString() : '-' }],
              [{ content: 'Médico', styles: { fontStyle: 'bold' } }, { content: consulta?.medico?.nombreCompleto || consulta?.doctor?.atr_nombre || consulta?.medico?.atr_nombre || '-' }],
              [{ content: 'Notas', styles: { fontStyle: 'bold' } }, { content: consulta?.atr_notas_clinicas || consulta?.notas || '-' }],
              [{ content: 'Seguimiento', styles: { fontStyle: 'bold' } }, { content: consulta?.atr_seguimiento ? String(consulta.atr_seguimiento) : (consulta?.atr_estado_seguimiento || '-') }]
            ],
            didDrawPage: () => drawClinicHeader()
          });

          const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : startY + 80;
          doc.setFontSize(9);
          doc.text('Documento generado desde la aplicación.', margin, finalY);
          doc.save(`consulta_${consulta?.atr_id_consulta || consulta?.id || Date.now()}.pdf`);
        } catch (err) {
          console.error('Error creando PDF de consulta', err);
          alert('Error generando PDF');
        }
      };

      img.onerror = (e) => { console.error('Error cargando logo para PDF', e); alert('No se pudo cargar el logo para el PDF'); };
    } catch (err) {
      console.error('Error generando PDF', err);
      alert('Error generando PDF');
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 2 }} variant="outlined">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Historial de Consultas</Typography>
          <Typography variant="body2" color="text.secondary">{patientId ? `Paciente: ${patientId}` : ''}</Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={2}><CircularProgress /></Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : consultas.length === 0 ? (
          <Typography color="text.secondary">No hay consultas registradas</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Médico</TableCell>
                  <TableCell>Notas</TableCell>
                  <TableCell>Seguimiento</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consultas.map(c => (
                  <TableRow key={c.atr_id_consulta || c.id} hover>
                    <TableCell>{c.atr_fecha_consulta ? new Date(c.atr_fecha_consulta).toLocaleString() : (c.fecha || '-')}</TableCell>
                    <TableCell>{(c.medico && (c.medico.nombreCompleto || c.medico.atr_nombre)) || c.atr_medico_nombre || '-'}</TableCell>
                    <TableCell>{(c.atr_notas_clinicas || c.notas || '').slice(0, 120)}</TableCell>
                    <TableCell>{c.atr_estado_seguimiento || (c.atr_seguimiento ? 'Pendiente' : 'No aplica') || '-'}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Ver">
                          <IconButton size="small" onClick={() => setViewing(c)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => handleDelete(c.atr_id_consulta || c.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Imprimir PDF">
                          <IconButton size="small" onClick={() => handlePrint(c)}>
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={!!viewing} onClose={() => setViewing(null)} maxWidth="md" fullWidth>
          <DialogTitle>Detalle de Consulta</DialogTitle>
          <DialogContent dividers>
            {viewing ? (
              <Box>
                <Typography><strong>Fecha:</strong> {viewing.atr_fecha_consulta ? new Date(viewing.atr_fecha_consulta).toLocaleString() : '-'}</Typography>
                <Typography><strong>Médico:</strong> {(viewing.medico && (viewing.medico.nombreCompleto || viewing.medico.atr_nombre)) || viewing.atr_medico_nombre || '-'}</Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Notas Clínicas</Typography>
                  <Typography variant="body2">{viewing.atr_notas_clinicas || viewing.notas || '-'}</Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Seguimiento</Typography>
                  <Typography variant="body2">{viewing.atr_estado_seguimiento || (viewing.atr_seguimiento ? 'Pendiente' : 'No aplica') || '-'}</Typography>
                </Box>
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewing(null)}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default HistorialConsultas;

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
import PrintIcon from '@mui/icons-material/Print';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoSvg from '../logo.svg';
import api from '../services/api';
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
  const [sigVisitDia, setSigVisitDia] = useState('');
  const [sigVisitError, setSigVisitError] = useState('');

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
      setSigVisitDia(consultation.atr_sig_visit_dia ? new Date(consultation.atr_sig_visit_dia).toISOString().slice(0,16) : '');
    }
  }, [consultation]);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate required next-visit date
      if (!sigVisitDia) {
        setSigVisitError('Fecha de siguiente visita es requerida');
        setSaving(false);
        return;
      }

      const data = {
        appointmentId: parseInt(appointmentId),
        pacienteId: appointment.atr_id_paciente,
        medicoId: appointment.atr_id_medico,
        sintomas: symptoms,
        diagnostico: diagnosis,
        observaciones: observations,
        peso: weight ? parseFloat(weight) : null,
        // El campo de altura en el formulario está en centímetros (cm).
        // El backend espera metros (valor entre 0 y 3), por lo que convertimos.
        altura: height ? (parseFloat(height) / 100) : null,
        temperatura: temperature ? parseFloat(temperature) : null,
        seguimiento: false, // Default
        sigVisitDia: sigVisitDia ? new Date(sigVisitDia).toISOString() : null
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

  const handlePrintConsultation = async () => {
    try {
      let consultationData = consultation || null;
      const appointmentData = appointment || {};

      // If patient or doctor info is missing, try reloading the consultation from the API
      const needsReload = !consultationData || !consultationData.patient || !consultationData.doctor;
      if (needsReload) {
        try {
          if (consultationData && consultationData.atr_id_consulta) {
            const res = await api.get(`/consultations/${consultationData.atr_id_consulta}`);
            const data = res && res.data ? (res.data.data || res.data) : null;
            if (data) consultationData = data;
          } else if (appointmentId) {
            // Try loading by appointment (route: /consultations/appointment/:appointmentId)
            const res = await api.get(`/consultations/appointment/${appointmentId}`);
            const data = res && res.data ? (res.data.data || res.data) : null;
            if (data) consultationData = data;
          }
        } catch (reloadErr) {
          console.warn('No se pudo recargar la consulta desde la API, se usará la información disponible', reloadErr);
        }
      }

      // Load SVG and convert to PNG via canvas
      const svgText = await fetch(logoSvg).then(r => r.text());
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
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
          doc.text('Resumen de Consulta', margin + imgWidth + 12, logoY + 18);
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Generado: ${new Date().toLocaleString()}`, margin + imgWidth + 12, logoY + 36);

          // Extract patient and doctor info (tolerant)
          const patient = consultationData.patient || appointmentData.paciente || appointmentData.patient || {};
          const patientName = patient.atr_nombre || patient.atr_nombre_paciente || patient.nombre || patient.fullName || '-';

          const doctor = consultationData.doctor || appointmentData.medico || appointmentData.doctor || {};
          const doctorName = `${doctor.atr_nombre || doctor.nombre || doctor.firstName || ''} ${doctor.atr_apellido || doctor.apellido || doctor.lastName || ''}`.trim() || '-';
          const doctorSpecialty = (doctor.Especialidades && doctor.Especialidades[0] && (doctor.Especialidades[0].atr_especialidad || doctor.Especialidades[0].atr_nombre)) || doctor.especialidad || '-';
          const doctorPhone = doctor.telefono || (Array.isArray(doctor.telefonos) && (doctor.telefonos[0]?.atr_telefono || doctor.telefonos[0]?.telefono)) || '-';
          const doctorEmail = doctor.correo || (Array.isArray(doctor.correos) && (doctor.correos[0]?.atr_correo || doctor.correos[0]?.correo)) || '-';

          doc.autoTable({
            startY: logoY + imgHeight + 8,
            theme: 'plain',
            styles: { fontSize: 10 },
            body: [
              [{ content: 'Paciente', styles: { fontStyle: 'bold' } }, { content: patientName }],
              [{ content: 'Médico', styles: { fontStyle: 'bold' } }, { content: doctorName }],
              [{ content: 'Especialidad', styles: { fontStyle: 'bold' } }, { content: doctorSpecialty }],
              [{ content: 'Teléfono', styles: { fontStyle: 'bold' } }, { content: doctorPhone }],
              [{ content: 'Correo', styles: { fontStyle: 'bold' } }, { content: doctorEmail }]
            ],
            didDrawPage: (data) => { drawClinicHeader(); }
          });

          // Consultation details table
          const rows = [];
          rows.push(['Síntomas', consultationData.atr_sintomas_paciente || '']);
          rows.push(['Diagnóstico', consultationData.atr_diagnostico || '']);
          rows.push(['Observaciones', consultationData.atr_observaciones || '']);
          rows.push(['Peso (kg)', consultationData.atr_peso ? String(consultationData.atr_peso) : '']);
          rows.push(['Altura (m)', consultationData.atr_altura ? String(consultationData.atr_altura) : '']);
          rows.push(['Temperatura (°C)', consultationData.atr_temperatura ? String(consultationData.atr_temperatura) : '']);
          rows.push(['Notas clínicas', consultationData.atr_notas_clinicas || clinicalNotes || '']);
          rows.push(['Siguiente visita', consultationData.atr_sig_visit_dia ? new Date(consultationData.atr_sig_visit_dia).toLocaleString() : (sigVisitDia ? new Date(sigVisitDia).toLocaleString() : '')]);

          const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : logoY + imgHeight + 40;

          doc.autoTable({
            startY,
            theme: 'grid',
            styles: { fontSize: 10 },
            body: rows.map(r => [{ content: r[0], styles: { fontStyle: 'bold' } }, { content: r[1] }]),
          });

          const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : startY + 80;
          doc.setFontSize(9);
          doc.text('Documento generado desde la aplicación.', margin, finalY);

          const fileName = `consulta_${consultationData.atr_id_consulta || Date.now()}.pdf`;
          doc.save(fileName);
        } catch (err) {
          console.error('Error creando PDF de consulta', err);
          window.alert('Error al generar PDF');
        }
      };

      img.onerror = (e) => {
        console.error('Error cargando logo SVG para PDF', e);
        window.alert('No se pudo cargar el logo para generar el PDF');
      };
    } catch (err) {
      console.error('Error generando PDF', err);
      window.alert('Error al generar PDF/Imprimir');
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

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Fecha y hora siguiente visita"
              type="datetime-local"
              value={sigVisitDia}
              onChange={(e) => { setSigVisitDia(e.target.value); setSigVisitError(''); }}
              InputLabelProps={{ shrink: true }}
              error={!!sigVisitError}
              helperText={sigVisitError}
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

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrintConsultation}
            disabled={saving}
            size="large"
          >
            Imprimir PDF
          </Button>

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
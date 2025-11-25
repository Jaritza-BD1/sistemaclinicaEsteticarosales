import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  TextField,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { fetchDoctors as fetchDoctorsThunk } from '../redux/doctors/doctorsSlice';
import { selectAllConsultations } from '../redux/consultations/consultationsSlice';
import { useNotifications } from '../context/NotificationsContext';

// Página: Consultas y Médicos - Reportes
// Contiene dos paneles colapsables: Reporte de Médicos y Reporte de Consultas
// Lógica mapeada: filtros básicos, generación de dataset filtrado y export CSV (simple)

function downloadCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const header = Object.keys(rows[0]);
  const csv = [header.join(','), ...rows.map(r => header.map(h => `"${String(r[h] ?? '')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function ConsultasMedicosReportesPage() {
  const dispatch = useDispatch();
  const consultations = useSelector(selectAllConsultations) || [];
  const doctors = useSelector(state => state.doctors.items || []);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    if (!doctors || doctors.length === 0) dispatch(fetchDoctorsThunk({ page: 1, pageSize: 500 }));
  }, [doctors, dispatch]);

  const filteredConsultations = useMemo(() => {
    return (consultations || []).filter(c => {
      const date = new Date(c?.atr_fecha_consulta || c?.fecha || null);
      if (fromDate) {
        const f = new Date(fromDate);
        if (isFinite(f) && date < f) return false;
      }
      if (toDate) {
        const t = new Date(toDate);
        if (isFinite(t) && date > t) return false;
      }
      if (selectedDoctor) {
        const did = c?.atr_id_medico ?? c?.medico?.atr_id_medico ?? c?.medico?.id ?? c?.doctor?.id;
        const selId = selectedDoctor?.atr_id_medico ?? selectedDoctor?.id;
        if (!did || String(did) !== String(selId)) return false;
      }
      return true;
    });
  }, [consultations, fromDate, toDate, selectedDoctor]);

  const buildDoctorsReport = useMemo(() => {
    // Example aggregation: count of consultations per doctor in the filtered set
    const map = new Map();
    filteredConsultations.forEach(c => {
      const did = c?.atr_id_medico ?? c?.medico?.atr_id_medico ?? c?.medico?.id ?? c?.doctor?.id;
      const name = (c?.medico?.atr_nombre || c?.medico?.nombre || c?.doctor?.nombre || '') + ' ' + (c?.medico?.atr_apellido || c?.medico?.apellido || c?.doctor?.apellido || '');
      if (!did) return;
      const key = String(did);
      if (!map.has(key)) map.set(key, { doctorId: key, doctorName: name.trim(), consultations: 0 });
      map.get(key).consultations += 1;
    });
    return Array.from(map.values());
  }, [filteredConsultations]);

  const onExportConsultationsCSV = () => {
    const rows = filteredConsultations.map(c => ({
      id: c.atr_id_consulta ?? c.id,
      fecha: c.atr_fecha_consulta ?? c.fecha,
      paciente: c?.paciente?.atr_nombre ? `${c.paciente.atr_nombre} ${c.paciente.atr_apellido || ''}` : (c?.patient?.nombre || ''),
      medico: c?.medico?.atr_nombre ? `${c.medico.atr_nombre} ${c.medico.atr_apellido || ''}` : (c?.doctor?.nombre || ''),
      notas: c.atr_notas_clinicas ?? c.notas ?? ''
    }));
    downloadCSV(`consultas_report_${Date.now()}.csv`, rows);
  };

  const { notify } = useNotifications();

  const onExportConsultationsPDF = () => {
    notify({ message: 'Generación de PDF no disponible sin dependencias externas; descargando CSV como alternativa.', severity: 'warning' });
    onExportConsultationsCSV();
  };

  const onExportDoctorsPDF = () => {
    notify({ message: 'Generación de PDF no disponible sin dependencias externas; descargando CSV como alternativa.', severity: 'warning' });
    onExportDoctorsCSV();
  };

  const onExportDoctorsCSV = () => {
    const rows = buildDoctorsReport.map(r => ({ doctorId: r.doctorId, doctorName: r.doctorName, consultations: r.consultations }));
    downloadCSV(`medicos_report_${Date.now()}.csv`, rows);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Reportes - Consultas y Médicos</Typography>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}> 
          <Typography variant="subtitle1">Reporte de Consultas</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField label="Desde" type="date" size="small" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField label="Hasta" type="date" size="small" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} />

              <Autocomplete
                options={doctors}
                getOptionLabel={(o) => o?.atr_nombre ? `${o.atr_nombre} ${o.atr_apellido || ''}` : (o?.nombre || '')}
                value={selectedDoctor}
                onChange={(_, v) => setSelectedDoctor(v)}
                sx={{ width: 320 }}
                renderInput={(params) => <TextField {...params} label="Médico (opcional)" size="small" />}
              />

              <Button variant="contained" onClick={onExportConsultationsCSV}>Exportar Consultas CSV</Button>
              <Button variant="outlined" onClick={onExportConsultationsPDF}>Exportar Consultas (PDF)</Button>
            </Stack>

            <Typography variant="body2">Total consultas (filtradas): {filteredConsultations.length}</Typography>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}> 
          <Typography variant="subtitle1">Reporte de Médicos</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Typography variant="body2">Resumen de consultas por médico dentro del rango/filtros seleccionados.</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={onExportDoctorsCSV}>Exportar Médicos CSV</Button>
              <Button variant="outlined" onClick={onExportDoctorsPDF}>Exportar Médicos (PDF)</Button>
            </Stack>
            <Box sx={{ mt: 1 }}>
              {buildDoctorsReport.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No hay datos para mostrar.</Typography>
              ) : (
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                  <Box component="thead">
                    <Box component="tr">
                      <Box component="th" sx={{ textAlign: 'left', pr: 2 }}>Médico</Box>
                      <Box component="th" sx={{ textAlign: 'left' }}>Consultas</Box>
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {buildDoctorsReport.map(r => (
                      <Box component="tr" key={r.doctorId}>
                        <Box component="td" sx={{ pr: 2 }}>{r.doctorName || r.doctorId}</Box>
                        <Box component="td">{r.consultations}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Button, TextField, Autocomplete, Pagination } from '@mui/material';
import ConsultationSummaryCard from '../../Components/consultations/ConsultationSummaryCard';
import { fetchDoctors as fetchDoctorsThunk } from '../../redux/doctors/doctorsSlice';
import { fetchAllConsultations, selectAllConsultations, selectConsultationsMeta } from '../../redux/consultations/consultationsSlice';

export default function ConsultationList({ patientId, onOpenNew }) {
  const dispatch = useDispatch();
  const consultations = useSelector(selectAllConsultations);
  const meta = useSelector(selectConsultationsMeta);
  const doctors = useSelector(state => state.doctors.items || []);

  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [page, setPage] = useState(meta.page || 1);
  const pageSize = meta.pageSize || 10;

  useEffect(() => {
    // Ensure we have a doctor list for the filter
    if (!doctors || doctors.length === 0) {
      try {
        dispatch(fetchDoctorsThunk({ page: 1, pageSize: 200 }));
      } catch (e) {
        // no-op
      }
    }
  }, [doctors, dispatch]);

  // Fetch consultations whenever filters or pagination change
  useEffect(() => {
    const params = {
      page,
      pageSize,
      search: search?.trim() || undefined,
      doctorId: selectedDoctor ? (selectedDoctor.atr_id_medico ?? selectedDoctor.id) : undefined,
      patientId: patientId || undefined
    };
    try {
      dispatch(fetchAllConsultations(params));
    } catch (err) {
      console.error('No se pudieron cargar consultas globales:', err);
    }
  }, [page, pageSize, search, selectedDoctor, patientId, dispatch]);

  // Use consultations from the store (server-driven)
  const allConsultations = useMemo(() => {
    return (consultations || []).slice().sort((a, b) => {
      const da = new Date(a?.atr_fecha_consulta || a?.fecha || 0).getTime();
      const db = new Date(b?.atr_fecha_consulta || b?.fecha || 0).getTime();
      return db - da; // newest first
    });
  }, [consultations]);

  // Apply filters: patientId (if provided), selectedDoctor and search text
  const filtered = useMemo(() => {
    return allConsultations.filter(c => {
      if (patientId) {
        const pid = c?.atr_id_paciente ?? c?.patientId ?? c?.paciente?.atr_id_paciente ?? c?.paciente?.id;
        if (!pid || String(pid) !== String(patientId)) return false;
      }
      if (selectedDoctor) {
        const did = c?.atr_id_medico ?? c?.medico?.atr_id_medico ?? c?.medico?.id ?? c?.doctor?.atr_id_medico ?? c?.doctor?.id;
        if (!did || String(did) !== String(selectedDoctor.atr_id_medico ?? selectedDoctor.id ?? selectedDoctor.atr_id)) return false;
      }
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        const patientName = (c?.paciente?.atr_nombre || c?.paciente?.nombre || c?.patient?.atr_nombre || '') + ' ' + (c?.paciente?.atr_apellido || c?.paciente?.apellido || c?.patient?.atr_apellido || '');
        const doctorName = (c?.medico?.atr_nombre || c?.medico?.nombre || c?.doctor?.atr_nombre || '') + ' ' + (c?.medico?.atr_apellido || c?.medico?.apellido || c?.doctor?.atr_apellido || '');
        const notes = (c?.atr_notas_clinicas || c?.notas || '').toString();
        if (!(patientName.toLowerCase().includes(q) || doctorName.toLowerCase().includes(q) || notes.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [allConsultations, patientId, selectedDoctor, search]);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flex: '0 0 auto' }}>Consultas</Typography>

        <TextField
          placeholder="Buscar paciente, médico o notas..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1 }}
        />

        <Autocomplete
          options={doctors}
          getOptionLabel={(option) => option?.atr_nombre ? `${option.atr_nombre} ${option.atr_apellido || ''}` : (option?.nombre || '')}
          value={selectedDoctor}
          onChange={(_, newVal) => setSelectedDoctor(newVal)}
          renderInput={(params) => <TextField {...params} label="Filtrar por médico" size="small" />}
          sx={{ width: 280 }}
        />

        <Button variant="contained" size="small" onClick={onOpenNew}>+ Nueva Consulta</Button>
      </Box>

      {filtered.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No hay consultas que coincidan con los filtros.</Typography>
      ) : (
        <Box>
          {filtered.map(c => (
            <ConsultationSummaryCard key={c.atr_id_consulta ?? c.id} consultation={c} onView={() => console.log('Ver consulta', c.atr_id_consulta)} />
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={Math.max(1, Math.ceil((meta.total || 0) / (pageSize || 10)))}
              page={page}
              onChange={(_, p) => setPage(p)}
              color="primary"
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}

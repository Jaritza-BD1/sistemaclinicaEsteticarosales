import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Button } from '@mui/material';
import ConsultationSummaryCard from '../../Components/consultations/ConsultationSummaryCard';

export default function ConsultationList({ patientId, onOpenNew }) {
  const consultationsState = useSelector(state => state.consultations || { itemsByPatient: {} });
  const items = consultationsState.itemsByPatient[patientId] || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Consultas</Typography>
        <Button variant="contained" size="small" onClick={onOpenNew}>+ Nueva Consulta</Button>
      </Box>

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No hay consultas para este paciente.</Typography>
      ) : (
        <Box>
          {items.map(c => (
            <ConsultationSummaryCard key={c.atr_id_consulta} consultation={c} onView={() => console.log('Ver consulta', c.atr_id_consulta)} />
          ))}
        </Box>
      )}
    </Box>
  );
}

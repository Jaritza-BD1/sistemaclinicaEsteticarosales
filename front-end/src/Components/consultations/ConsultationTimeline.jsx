import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

export default function ConsultationTimeline({ consultations = [] }) {
  if (!consultations || consultations.length === 0) {
    return <Typography variant="body2" color="text.secondary">No hay eventos en la línea de tiempo.</Typography>;
  }

  const sorted = [...consultations].sort((a, b) => new Date(b.atr_fecha_consulta) - new Date(a.atr_fecha_consulta));

  return (
    <Box>
      {sorted.map((c) => (
        <Box key={c.atr_id_consulta} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{new Date(c.atr_fecha_consulta).toLocaleString()}</Typography>
          <Typography variant="body2" color="text.secondary">{c.atr_notas_clinicas}</Typography>
          <Divider sx={{ mt: 1 }} />
        </Box>
      ))}
    </Box>
  );
}

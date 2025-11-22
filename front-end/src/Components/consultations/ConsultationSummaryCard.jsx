import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button } from '@mui/material';

export default function ConsultationSummaryCard({ consultation, onView }) {
  if (!consultation) return null;

  const dateLabel = consultation.atr_fecha_consulta ? new Date(consultation.atr_fecha_consulta).toLocaleString() : 'Sin fecha';
  const status = consultation.atr_estado_seguimiento || (consultation.atr_seguimiento ? 'PENDIENTE' : 'SIN_SEGUIMIENTO');

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Consulta #{consultation.atr_id_consulta || '—'}
          </Typography>
          <Typography variant="body2" color="text.secondary">{dateLabel}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>{consultation.atr_notas_clinicas || 'Sin notas'}</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
          <Chip label={status} size="small" color={status === 'COMPLETADO' ? 'success' : status === 'PENDIENTE' ? 'warning' : 'default'} />
          <Button size="small" variant="outlined" onClick={() => onView && onView(consultation)}>Ver</Button>
        </Box>
      </CardContent>
    </Card>
  );
}

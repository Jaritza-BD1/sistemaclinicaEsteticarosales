import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, IconButton, Switch, Button, Typography } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Helper: days of week
const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

// horarios: { lunes: [{start:'08:00', end:'17:00'}], martes: [...] }
export default function DoctorSchedule({ value = {}, onChange }) {
  // Ensure shape
  const getDayKey = (index) => DAYS[index];

  const ensureDay = (day) => {
    if (!value[day]) return [];
    return value[day];
  };

  const setDay = (day, intervals) => {
    const next = { ...value, [day]: intervals };
    onChange && onChange(next);
  };

  const toggleDayEnabled = (day, enabled) => {
    if (enabled) {
      if (!value[day] || value[day].length === 0) setDay(day, [{ start: '08:00', end: '17:00' }]);
    } else {
      setDay(day, []);
    }
  };

  const updateInterval = (day, idx, field, val) => {
    const arr = ensureDay(day).slice();
    arr[idx] = { ...arr[idx], [field]: val };
    setDay(day, arr);
  };

  const addInterval = (day) => {
    const arr = ensureDay(day).slice();
    arr.push({ start: '08:00', end: '17:00' });
    setDay(day, arr);
  };

  const removeInterval = (day, idx) => {
    const arr = ensureDay(day).slice();
    arr.splice(idx, 1);
    setDay(day, arr);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Horarios de Atención</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Día</TableCell>
              <TableCell>Habilitado</TableCell>
              <TableCell>Intervalos</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {DAYS.map((day, dIdx) => {
              const intervals = ensureDay(day);
              const enabled = intervals && intervals.length > 0;
              return (
                <TableRow key={day}>
                  <TableCell>{day}</TableCell>
                  <TableCell>
                    <Switch checked={enabled} onChange={(e) => toggleDayEnabled(day, e.target.checked)} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {enabled ? intervals.map((it, idx) => {
                        // validate this interval locally to give immediate UI feedback
                        const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
                        const start = it.start || '';
                        const end = it.end || '';
                        let startError = '';
                        let endError = '';
                        if (!start || !end) {
                          if (!start) startError = 'Falta hora de inicio';
                          if (!end) endError = 'Falta hora de fin';
                        } else {
                          if (!timeRegex.test(start)) startError = 'Formato inválido (HH:MM)';
                          if (!timeRegex.test(end)) endError = 'Formato inválido (HH:MM)';
                          if (timeRegex.test(start) && timeRegex.test(end) && start >= end) {
                            startError = 'Inicio debe ser < fin';
                            endError = 'Fin debe ser > inicio';
                          }
                        }

                        return (
                          <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <TextField
                              label="Desde"
                              type="time"
                              value={start || '08:00'}
                              onChange={(e) => updateInterval(day, idx, 'start', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              size="small"
                              error={!!startError}
                              helperText={startError}
                            />
                            <TextField
                              label="Hasta"
                              type="time"
                              value={end || '17:00'}
                              onChange={(e) => updateInterval(day, idx, 'end', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              size="small"
                              error={!!endError}
                              helperText={endError}
                            />
                            <IconButton size="small" color="error" onClick={() => removeInterval(day, idx)}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        );
                      }) : (
                        <Typography variant="body2" color="text.secondary">No disponible</Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => addInterval(day)}
                      disabled={!enabled}
                    >
                      Agregar
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

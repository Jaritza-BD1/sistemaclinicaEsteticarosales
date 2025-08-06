import React from 'react';
import { Box, Paper, Typography, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Datos de ejemplo (en una app real vendrían de la API)
const exampleAppointments = [
  { id: 1, status: 'Pendiente', doctor: 'Dr. Juan López' },
  { id: 2, status: 'Confirmada', doctor: 'Dra. Sofía García' },
  { id: 3, status: 'Realizada', doctor: 'Dr. Juan López' },
  { id: 4, status: 'Cancelada', doctor: 'Dr. Miguel Torres' },
  { id: 5, status: 'Pendiente', doctor: 'Dra. Sofía García' },
  { id: 6, status: 'Reprogramada', doctor: 'Dr. Juan López' },
  { id: 7, status: 'Pendiente', doctor: 'Dr. Juan López' },
];

const estados = ['Pendiente', 'Confirmada', 'Realizada', 'Cancelada', 'Reprogramada'];

function countByStatus(appointments) {
  return estados.map(status => ({
    status,
    count: appointments.filter(a => a.status === status).length
  }));
}

function countByDoctor(appointments) {
  const doctors = [...new Set(appointments.map(a => a.doctor))];
  return doctors.map(doctor => ({
    doctor,
    ...Object.fromEntries(estados.map(status => [status, appointments.filter(a => a.doctor === doctor && a.status === status).length]))
  }));
}

const CitasReportesPage = () => {
  const resumenEstados = countByStatus(exampleAppointments);
  const resumenDoctores = countByDoctor(exampleAppointments);

  return (
    <Box sx={{ bgcolor: '#f8f8f8', minHeight: '100vh', py: 4 }}>
      <Paper elevation={3} sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, md: 4 }, borderRadius: 4, boxShadow: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AssessmentIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" color="primary" fontWeight={600}>Reporte de Citas</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>Resumen por Estado</Typography>
        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          {resumenEstados.map(({ status, count }) => (
            <Paper key={status} sx={{ p: 2, minWidth: 120, textAlign: 'center', bgcolor: '#fafafa' }}>
              <Typography variant="subtitle2" color="text.secondary">{status}</Typography>
              <Typography variant="h5" color="primary.main" fontWeight={700}>{count}</Typography>
            </Paper>
          ))}
        </Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Citas por Médico y Estado</Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Médico</TableCell>
                {estados.map(status => (
                  <TableCell key={status} align="center">{status}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {resumenDoctores.map(row => (
                <TableRow key={row.doctor}>
                  <TableCell>{row.doctor}</TableCell>
                  {estados.map(status => (
                    <TableCell key={status} align="center">{row[status]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="body2" color="text.secondary">
          * Este reporte es solo un ejemplo visual. Puedes conectar los datos reales de tu backend fácilmente.
        </Typography>
      </Paper>
    </Box>
  );
};

export default CitasReportesPage; 
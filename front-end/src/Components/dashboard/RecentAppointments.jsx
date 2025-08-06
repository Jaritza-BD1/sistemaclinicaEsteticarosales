import React from 'react';
import { Card, CardContent, CardHeader, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Typography } from '@mui/material';
import './dashboard.css';

const RecentAppointments = () => {
  const appointments = [
    { id: 1, patient: 'María González', service: 'Botox', time: '10:00 AM', status: 'completado' },
    { id: 2, patient: 'Laura Martínez', service: 'Limpieza facial', time: '11:30 AM', status: 'pendiente' },
    { id: 3, patient: 'Carlos Sánchez', service: 'Depilación láser', time: '02:15 PM', status: 'cancelado' }
  ];

  const statusColor = {
    completado: 'success',
    pendiente: 'warning',
    cancelado: 'error'
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardHeader title={<Typography variant="h6">Últimas Citas</Typography>} />
      <CardContent>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Paciente</TableCell>
                <TableCell>Servicio</TableCell>
                <TableCell>Hora</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map(app => (
                <TableRow key={app.id}>
                  <TableCell>{app.patient}</TableCell>
                  <TableCell>{app.service}</TableCell>
                  <TableCell>{app.time}</TableCell>
                  <TableCell>
                    <Chip label={app.status} color={statusColor[app.status]} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default RecentAppointments;
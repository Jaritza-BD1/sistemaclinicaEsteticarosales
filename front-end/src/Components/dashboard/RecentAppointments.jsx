import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import './dashboard.css';

const RecentAppointments = () => {
  const appointments = [
    { id: 1, patient: 'María González', service: 'Botox', time: '10:00 AM', status: 'completado' },
    { id: 2, patient: 'Laura Martínez', service: 'Limpieza facial', time: '11:30 AM', status: 'pendiente' },
    { id: 3, patient: 'Carlos Sánchez', service: 'Depilación láser', time: '02:15 PM', status: 'cancelado' }
  ];

  const statusVariant = {
    completado: 'success',
    pendiente: 'warning',
    cancelado: 'danger'
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5>Últimas Citas</h5>
      </Card.Header>
      <Card.Body>
        <Table striped hover>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Servicio</th>
              <th>Hora</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(app => (
              <tr key={app.id}>
                <td>{app.patient}</td>
                <td>{app.service}</td>
                <td>{app.time}</td>
                <td>
                  <Badge bg={statusVariant[app.status]}>
                    {app.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default RecentAppointments;
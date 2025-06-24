import React from 'react';
import { Card,ListGroup } from 'react-bootstrap';
import './dashboard.css';

const UpcomingSchedule = () => {
  const schedule = [
    { time: '09:00 AM', patient: 'Ana López', service: 'Consulta inicial' },
    { time: '10:30 AM', patient: 'Sofía Ramírez', service: 'Relleno facial' },
    { time: '12:00 PM', patient: 'Elena Castro', service: 'Peeling químico' }
  ];

  return (
    <Card>
      <Card.Header>
        <h5>Próximas Citas</h5>
      </Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
          {schedule.map((item, index) => (
            <ListGroup.Item key={index}>
              <div className="d-flex justify-content-between">
                <strong>{item.time}</strong>
                <span>{item.patient}</span>
              </div>
              <div className="text-muted">{item.service}</div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default UpcomingSchedule;
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import './dashboard.css';
const StatsSummary = () => {
  const stats = [
    { title: 'Citas Hoy', value: 8, variant: 'primary' },
    { title: 'Pacientes Nuevos', value: 3, variant: 'success' },
    { title: 'Tratamientos', value: 5, variant: 'info' },
    { title: 'Ingresos', value: '$12,450', variant: 'warning' }
  ];

  return (
    <Row className="stats-summary">
      {stats.map((stat, index) => (
        <Col md={3} key={index}>
          <Card bg={stat.variant} text="white" className="mb-4">
            <Card.Body>
              <Card.Title>{stat.title}</Card.Title>
              <Card.Text className="display-6">{stat.value}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatsSummary;
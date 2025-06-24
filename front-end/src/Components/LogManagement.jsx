// src/components/LogManagement.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Table, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from './context/AuthContext';
import './log-management.css';

const LogManagement = () => {
  const { user, token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ username: '', action: '', from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch logs with current filters
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });
      const res = await axios.get('/api/admin/logs', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
    } catch {
      setError('No se pudieron cargar los registros');
    } finally {
      setLoading(false);
    }
  }, [filters, token]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ username: '', action: '', from: '', to: '' });
  };

  const handleDelete = async (id) => {
    if (user?.role !== 'admin') return;
    if (!window.confirm('¿Eliminar registro?')) return;
    try {
      await axios.delete(`/api/admin/logs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(prev => prev.filter(l => l.id !== id));
    } catch {
      setError('Error al eliminar registro');
    }
  };

  return (
    <div className="log-management p-4">
      <h4 className="mb-3">Gestión de Bitácora</h4>

      <Form className="mb-3">
        <Row className="align-items-end">
          <Col md={3}>
            <Form.Label>Usuario</Form.Label>
            <Form.Control
              name="username"
              value={filters.username}
              onChange={handleChange}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Acción</Form.Label>
            <Form.Control
              name="action"
              value={filters.action}
              onChange={handleChange}
            />
          </Col>
          <Col md={2}>
            <Form.Label>Desde</Form.Label>
            <Form.Control
              type="date"
              name="from"
              value={filters.from}
              onChange={handleChange}
            />
          </Col>
          <Col md={2}>
            <Form.Label>Hasta</Form.Label>
            <Form.Control
              type="date"
              name="to"
              value={filters.to}
              onChange={handleChange}
            />
          </Col>
          <Col md={2} className="d-flex gap-2">
            <Button variant="primary" onClick={fetchLogs}>Filtrar</Button>
            <Button variant="outline-secondary" onClick={clearFilters}>Limpiar</Button>
          </Col>
        </Row>
      </Form>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Spinner animation="border" />
      ) : logs.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Fecha</th>
              {user?.role === 'admin' && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.username}</td>
                <td>{log.action}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                {user?.role === 'admin' && (
                  <td>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(log.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">No hay registros que mostrar.</Alert>
      )}
    </div>
  );
};

export default LogManagement;

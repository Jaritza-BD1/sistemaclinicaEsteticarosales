// src/components/LogManagement.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spinner, Alert } from 'react-bootstrap';
import './log-management.css';

const LogManagement = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/logs');
      setLogs(res.data);
    } catch {
      setError('Error cargando la bitácora');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>ID</th>
          <th>Usuario</th>
          <th>Acción</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        {logs.map(log => (
          <tr key={log.id}>
            <td>{log.id}</td>
            <td>{log.username}</td>
            <td>{log.action}</td>
            <td>{new Date(log.createdAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default LogManagement;

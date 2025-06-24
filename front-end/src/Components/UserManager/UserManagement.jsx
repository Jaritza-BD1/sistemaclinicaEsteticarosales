import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import './user-management.css';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdPassword, setCreatedPassword] = useState('');
  const [createError, setCreateError] = useState('');

  const [resetResult, setResetResult] = useState(null);
  const [actionLoading, setActionLoading] = useState({}); // { [id]: bool }

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setError('');
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data.data);
    } catch {
      setError('No se pudieron cargar los usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    setCreateError('');
    try {
      const payload = {
        username: newUsername,
        email: newEmail,
        autoGenerate,
        password: autoGenerate ? undefined : newPassword,
      };
      const res = await axios.post('/api/admin/users', payload);
      setCreatedPassword(res.data.plainPassword);
      // Refresh list after creation
      await fetchUsers();
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Error al crear');
    } finally {
      setCreating(false);
    }
  };

  const handleBlock = async (id) => {
    if (user?.role !== 'admin') return;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await axios.patch(`/api/admin/users/${id}/block`);
      await fetchUsers();
    } catch {
      setError('Error al bloquear');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleReset = async (id) => {
    if (user?.role !== 'admin') return;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      const res = await axios.patch(`/api/admin/users/${id}/reset-password`);
      setResetResult({ id, password: res.data.nuevaContraseña });
      await fetchUsers();
    } catch {
      setError('Error al resetear');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Reset form and alerts when modal closes
  const handleModalClose = () => {
    setShowCreate(false);
    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    setAutoGenerate(false);
    setCreateError('');
    setCreatedPassword('');
  };

  return (
    <div className="user-management p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Gestión de Usuarios</h3>
        <Button onClick={() => setShowCreate(true)}>Crear Usuario</Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loadingUsers ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Vence</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.status}</td>
                <td>{u.password_expires_at ? new Date(u.password_expires_at).toLocaleDateString() : '-'}</td>
                <td className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="warning"
                    disabled={actionLoading[u.id]}
                    onClick={() => handleBlock(u.id)}
                  >
                    {actionLoading[u.id] ? <Spinner size="sm" animation="border" /> : 'Bloquear'}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={actionLoading[u.id]}
                    onClick={() => handleReset(u.id)}
                  >
                    {actionLoading[u.id] ? <Spinner size="sm" animation="border" /> : 'Resetear'}
                  </Button>
                  {resetResult?.id === u.id && (
                    <small className="ms-2 text-success">
                      Nueva: {resetResult.password}
                    </small>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Crear Usuario Modal */}
      <Modal show={showCreate} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {createError && (
            <Alert variant="danger" dismissible onClose={() => setCreateError('')}>
              {createError}
            </Alert>
          )}
          {createdPassword && (
            <Alert variant="success" dismissible onClose={() => setCreatedPassword('')}>
              Contraseña generada: <strong>{createdPassword}</strong>
            </Alert>
          )}
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-2 d-flex align-items-center">
              <Form.Check
                type="checkbox"
                label="Autogenerar contraseña"
                checked={autoGenerate}
                onChange={e => setAutoGenerate(e.target.checked)}
              />
            </Form.Group>
            {!autoGenerate && (
              <Form.Group className="mb-2">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            disabled={creating}
            onClick={handleCreate}
          >
            {creating ? <Spinner size="sm" animation="border" /> : 'Crear'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;


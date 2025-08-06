import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './pending-users.css';

const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const response = await api.get('/admin/pending-users');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching pending users:', err);
        setError('Error al cargar usuarios pendientes');
        setLoading(false);
      }
    };
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await api.post(`/admin/approve-user/${userId}`);
      setUsers(users.filter(user => user.atr_id_usuario !== userId));
      setSuccessMsg('Usuario aprobado exitosamente');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error approving user:', err);
      setError('Error al aprobar usuario');
    }
  };

  const handleReject = async (userId) => {
    const confirm = window.confirm('¿Estás seguro de que deseas rechazar este usuario?');
    if (!confirm) return;
    try {
      await api.post(`/admin/reject-user/${userId}`);
      setUsers(users.filter(user => user.atr_id_usuario !== userId));
      setSuccessMsg('Usuario rechazado exitosamente');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error rejecting user:', err);
      setError('Error al rechazar usuario');
    }
  };

  return (
    <div className="pending-users-container">
      <div className="pending-users-header">
        <h1>Usuarios Pendientes de Aprobación</h1>
        <div className="header-info">
          <span className="pending-count">{users.length} usuarios pendientes</span>
        </div>
      </div>

      {successMsg && (
        <div className="success-message">
          ✅ {successMsg}
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando usuarios pendientes...</p>
        </div>
      ) : users.length > 0 ? (
        <>
          <div className="pagination-info">
            <p>
              Mostrando {users.length} usuarios pendientes de aprobación
            </p>
          </div>

          <table className="pending-users-table">
            <thead>
              <tr>
                <th>ID Usuario</th>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.atr_id_usuario}>
                  <td>{user.atr_id_usuario}</td>
                  <td>
                    <span className="username-badge">
                      {user.atr_usuario}
                    </span>
                  </td>
                  <td>{user.atr_nombre_usuario}</td>
                  <td>
                    <div className="email-cell">
                      {user.atr_correo_electronico}
                    </div>
                  </td>
                  <td>
                    {user.atr_fecha_creacion ? 
                      new Date(user.atr_fecha_creacion).toLocaleDateString('es-ES') : 
                      'Fecha no disponible'
                    }
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleApprove(user.atr_id_usuario)}
                      className="action-button approve-button"
                      title="Aprobar usuario"
                    >
                      ✅ Aprobar
                    </button>
                    <button
                      onClick={() => handleReject(user.atr_id_usuario)}
                      className="action-button reject-button"
                      title="Rechazar usuario"
                    >
                      ❌ Rechazar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div className="no-data-message">
          <h3>No hay usuarios pendientes</h3>
          <p>No se encontraron usuarios pendientes de aprobación en el sistema.</p>
        </div>
      )}
    </div>
  );
};

export default PendingUsers;
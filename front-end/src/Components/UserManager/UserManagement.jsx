import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../context/AuthContext';
import './user-management.css';
import ModalForm from '../common/ModalForm';
import UserForm from './UserForm';
import {
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

const UserManagement = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 10; // Número de registros por página

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [actionLoading, setActionLoading] = useState({}); // { [id]: bool }
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState({ action: '', id: null, label: '' });
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddUser = () => {
    setUserModalOpen(true);
  };
  
  const handleCloseUser = () => setUserModalOpen(false);
  
  const handleUserSuccess = () => {
    setUserModalOpen(false);
    fetchUsers(currentPage);
  };

  // Fetch users with pagination
  const fetchUsers = useCallback(async (page = 1) => {
    setLoadingUsers(true);
    setError('');
    try {
      const params = {
        page: page,
        limit: itemsPerPage
      };
      
      const res = await api.get('/admin/users', { params });
      
      if (res.data && res.data.data) {
        setUsers(res.data.data || []);
        setTotalPages(res.data.meta?.pages || 1);
        setTotalRecords(res.data.meta?.total || 0);
      } else {
        setUsers([]);
        setTotalPages(1);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('No se pudieron cargar los usuarios');
      setUsers([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setLoadingUsers(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [fetchUsers, currentPage]);

  // Función para manejar cambios de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleBlock = async (id) => {
    if (!isAdmin()) return;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      console.debug('Request: PATCH /admin/users/' + id + '/block');
      const resp = await api.patch(`/admin/users/${id}/block`);
      console.debug('Response:', resp);
      setSuccessMessage('Usuario bloqueado correctamente');
      await fetchUsers(currentPage);
    } catch (err) {
      console.error('Error blocking user:', err);
      const msg = err?.message || err?.body?.message || (err?.response && err.response.message) || 'Error al bloquear usuario';
      setError(msg);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleUnblock = async (id) => {
    if (!isAdmin()) return;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      console.debug('Request: PATCH /admin/users/' + id + '/unblock');
      const resp = await api.patch(`/admin/users/${id}/unblock`);
      console.debug('Response:', resp);
      setSuccessMessage('Usuario desbloqueado correctamente');
      await fetchUsers(currentPage);
    } catch (err) {
      console.error('Error unblocking user:', err);
      const msg = err?.message || err?.body?.message || (err?.response && err.response.message) || 'Error al desbloquear usuario';
      setError(msg);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleReset = async (id) => {
    if (!isAdmin()) return;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      console.debug('Request: PUT /admin/users/' + id + '/reset-password');
      const res = await api.put(`/admin/users/${id}/reset-password`);
      console.debug('Response:', res);
      const nueva = res.nuevaContraseña || res.data?.nuevaContraseña || '';
      setResetResult({ id, password: nueva });
      setSuccessMessage(nueva ? `Contraseña reseteada: ${nueva}` : 'Contraseña reseteada correctamente');
      await fetchUsers(currentPage);
    } catch (err) {
      console.error('Error resetting password:', err);
      const msg = err?.message || err?.body?.message || (err?.response && err.response.message) || 'Error al resetear contraseña';
      setError(msg);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Abre el diálogo de confirmación con payload (acción, id, label opcional)
  const openConfirm = (action, id, label) => {
    setConfirmPayload({ action, id, label });
    setConfirmOpen(true);
  };

  const handleDelete = async (id) => {
    if (!isAdmin()) return;
    openConfirm('delete', id, 'Eliminar usuario');
  };

  const handleConfirm = async () => {
    const { action, id } = confirmPayload;
    setConfirmOpen(false);
    if (!action || !id) return;

    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      if (action === 'delete') {
        console.debug('Request: DELETE /admin/users/' + id);
        const resp = await api.delete(`/admin/users/${id}`);
        console.debug('Response:', resp);
        setSuccessMessage('Usuario eliminado correctamente');
        await fetchUsers(currentPage);
      }
      if (action === 'block') {
        await handleBlock(id);
      }
      if (action === 'unblock') {
        await handleUnblock(id);
      }
      if (action === 'reset') {
        await handleReset(id);
      }
    } catch (err) {
      console.error('Error executing confirm action:', err);
      const msg = err?.message || err?.body?.message || (err?.response && err.response.message) || 'Error al ejecutar la acción';
      setError(msg);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h1>Gestión de Usuarios</h1>
        <button onClick={handleAddUser} className="add-user-button">
          ➕ Crear Usuario
        </button>
      </div>

      {error && (
        <div className="error-message">
                      {typeof error === 'string' ? error : 'Error desconocido'}
        </div>
      )}

      {/* Información de paginación */}
      {!loadingUsers && users.length > 0 && (
        <div className="pagination-info">
          <p>
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalRecords)} de {totalRecords} usuarios
          </p>
        </div>
      )}

      {loadingUsers ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      ) : users.length > 0 ? (
        <>
          <table className="user-table">
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
                <tr key={u.atr_id_usuario}>
                  <td>{u.atr_id_usuario}</td>
                  <td>{u.atr_usuario}</td>
                  <td>{u.atr_correo_electronico}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(u.atr_estado_usuario)}`}>
                      {u.atr_estado_usuario}
                    </span>
                  </td>
                  <td>{u.atr_fecha_vencimiento ? new Date(u.atr_fecha_vencimiento).toLocaleDateString('es-ES') : '-'}</td>
                  <td className="actions-cell">
                    <button
                      className={`action-button block-button ${actionLoading[u.atr_id_usuario] ? 'loading' : ''}`}
                      disabled={actionLoading[u.atr_id_usuario]}
                      onClick={() => openConfirm('block', u.atr_id_usuario, `Bloquear ${u.atr_usuario}`)}
                      title="Bloquear usuario"
                    >
                      {actionLoading[u.atr_id_usuario] ? '⏳' : '🔒'}
                    </button>
                    
                    {u.atr_estado_usuario === 'BLOQUEADO' && (
                      <button
                        className={`action-button unblock-button ${actionLoading[u.atr_id_usuario] ? 'loading' : ''}`}
                        disabled={actionLoading[u.atr_id_usuario]}
                        onClick={() => openConfirm('unblock', u.atr_id_usuario, `Desbloquear ${u.atr_usuario}`)}
                        title="Desbloquear usuario"
                      >
                        {actionLoading[u.atr_id_usuario] ? '⏳' : '🔓'}
                      </button>
                    )}
                    
                    <button
                      className={`action-button reset-button ${actionLoading[u.atr_id_usuario] ? 'loading' : ''}`}
                      disabled={actionLoading[u.atr_id_usuario]}
                      onClick={() => openConfirm('reset', u.atr_id_usuario, `Resetear contraseña ${u.atr_usuario}`)}
                      title="Resetear contraseña"
                    >
                      {actionLoading[u.atr_id_usuario] ? '⏳' : '🔄'}
                    </button>
                    
                    <button
                      className={`action-button delete-button ${actionLoading[u.atr_id_usuario] ? 'loading' : ''}`}
                      disabled={actionLoading[u.atr_id_usuario]}
                      onClick={() => handleDelete(u.atr_id_usuario)}
                      title="Eliminar usuario"
                    >
                      {actionLoading[u.atr_id_usuario] ? '⏳' : '🗑️'}
                    </button>
                    
                    {resetResult?.id === u.atr_id_usuario && (
                      <div className="reset-result">
                        Nueva: {resetResult.password}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación mejorada */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(1)} 
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ⏮️ Primera
              </button>
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ◀️ Anterior
              </button>
              
              <span className="page-info">
                Página {currentPage} de {totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Siguiente ▶️
              </button>
              <button 
                onClick={() => handlePageChange(totalPages)} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Última ⏭️
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="no-data-message">
          <h3>No hay usuarios</h3>
          <p>No se encontraron usuarios en el sistema.</p>
        </div>
      )}

      {/* Crear Usuario Modal */}
      <ModalForm open={userModalOpen} onClose={handleCloseUser} title="Crear Usuario">
        <UserForm onSuccess={handleUserSuccess} />
      </ModalForm>
      {/* Dialogo de confirmación reutilizable */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title">{confirmPayload.label || 'Confirmar acción'}</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas continuar con esta acción?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="secondary">Cancelar</Button>
          <Button onClick={handleConfirm} color="primary" variant="contained">Confirmar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de éxito */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Snackbar de error (usa estado error existente) */}
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

// Función auxiliar para obtener la clase CSS del badge según el estado
const getStatusClass = (status) => {
  switch (status) {
    case 'ACTIVO':
      return 'success';
    case 'BLOQUEADO':
      return 'danger';
    case 'PENDIENTE_APROBACION':
      return 'warning';
    case 'INACTIVO':
      return 'secondary';
    default:
      return 'secondary';
  }
};

export default UserManagement;


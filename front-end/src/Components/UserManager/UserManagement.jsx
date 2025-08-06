import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../context/AuthContext';
import './user-management.css';
import ModalForm from '../common/ModalForm';
import UserForm from './UserForm';

const UserManagement = () => {
  const { user } = useAuth();
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
    if (user?.role !== 'admin') return;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.patch(`/admin/users/${id}/block`);
      await fetchUsers(currentPage);
    } catch (err) {
      console.error('Error blocking user:', err);
      setError('Error al bloquear usuario');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleUnblock = async (id) => {
    if (user?.role !== 'admin') return;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.patch(`/admin/users/${id}/unblock`);
      await fetchUsers(currentPage);
    } catch (err) {
      console.error('Error unblocking user:', err);
      setError('Error al desbloquear usuario');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleReset = async (id) => {
    if (user?.role !== 'admin') return;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      const res = await api.put(`/admin/users/${id}/reset-password`);
      setResetResult({ id, password: res.data.nuevaContraseña });
      await fetchUsers(currentPage);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Error al resetear contraseña');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id) => {
    if (user?.role !== 'admin') return;
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) return;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.delete(`/admin/users/${id}`);
      await fetchUsers(currentPage);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Error al eliminar usuario');
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
                      onClick={() => handleBlock(u.atr_id_usuario)}
                      title="Bloquear usuario"
                    >
                      {actionLoading[u.atr_id_usuario] ? '⏳' : '🔒'}
                    </button>
                    
                    {u.atr_estado_usuario === 'BLOQUEADO' && (
                      <button
                        className={`action-button unblock-button ${actionLoading[u.atr_id_usuario] ? 'loading' : ''}`}
                        disabled={actionLoading[u.atr_id_usuario]}
                        onClick={() => handleUnblock(u.atr_id_usuario)}
                        title="Desbloquear usuario"
                      >
                        {actionLoading[u.atr_id_usuario] ? '⏳' : '🔓'}
                      </button>
                    )}
                    
                    <button
                      className={`action-button reset-button ${actionLoading[u.atr_id_usuario] ? 'loading' : ''}`}
                      disabled={actionLoading[u.atr_id_usuario]}
                      onClick={() => handleReset(u.atr_id_usuario)}
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


import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Add as AddIcon
} from '@mui/icons-material';
import api from '../../services/api';
import NewRolModal from './NewRolModal';
import EditRolModal from './EditRolModal';
import './roles-permissions.css';

const RolesManagement = ({ onNotification }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newRolModalOpen, setNewRolModalOpen] = useState(false);
  const [editRolModalOpen, setEditRolModalOpen] = useState(false);
  const [selectedRol, setSelectedRol] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rolToDelete, setRolToDelete] = useState(null);
  const [error, setError] = useState('');

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [dense, setDense] = useState(false);
  const itemsPerPage = 10;

  // Cargar roles (memoizada para evitar warnings de dependencias en useEffect)
  const fetchRoles = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: page,
        limit: itemsPerPage
      };
      if (searchTerm) params.search = searchTerm;

      console.log('Fetching roles with params:', params);
      const response = await api.get('/roles', { params });
      console.log('Roles response:', response);
      
      // Normalizar formatos de respuesta (array directo o { data, meta })
      const payload = response.data;
      const rolesArray = Array.isArray(payload) ? payload : (payload && (payload.data || payload.roles)) || [];
      const meta = (payload && payload.meta) || response.meta || {};

      setRoles(rolesArray);
      setTotalPages(meta?.totalPages || meta?.total_pages || 1);
      setTotalRecords(meta?.total || 0);
      
      console.log('Roles state updated:', rolesArray);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Error al cargar los roles');
      onNotification('Error al cargar los roles', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, itemsPerPage, onNotification]);

  // Cargar roles al montar el componente
  useEffect(() => {
    console.log('Component mounted, fetching roles...');
    fetchRoles(currentPage);
  }, [currentPage, fetchRoles]);

  // Cargar roles cuando cambian los filtros
  useEffect(() => {
    console.log('Filters changed, resetting to first page...');
    // Solo resetear la página; el otro useEffect (dependiente de currentPage)
    // se encargará de llamar a fetchRoles y evitar llamadas duplicadas.
    setCurrentPage(1);
  }, [searchTerm]);

  // Manejar cambio de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchRoles(pageNumber);
  };

  // Crear nuevo rol
  const handleCreateRol = async (rolData) => {
    try {
      await api.post('/roles', rolData);
      onNotification('Rol creado exitosamente');
      setNewRolModalOpen(false);
      fetchRoles(currentPage);
    } catch (error) {
      console.error('Error creating role:', error);
      onNotification('Error al crear el rol', 'error');
    }
  };

  // Editar rol
  const handleEditRol = async (id, rolData) => {
    try {
      await api.put(`/roles/${id}`, rolData);
      onNotification('Rol actualizado exitosamente');
      setEditRolModalOpen(false);
      fetchRoles(currentPage);
    } catch (error) {
      console.error('Error updating role:', error);
      onNotification('Error al actualizar el rol', 'error');
    }
  };

  // Eliminar rol
  const handleDeleteRol = async () => {
    if (!rolToDelete) return;

    try {
      await api.delete(`/roles/${rolToDelete.atr_id_rol}`);
      onNotification('Rol eliminado exitosamente');
      setDeleteDialogOpen(false);
      setRolToDelete(null);
      fetchRoles(currentPage);
    } catch (error) {
      console.error('Error deleting role:', error);
      onNotification('Error al eliminar el rol', 'error');
    }
  };

  const openEditModal = (rol) => {
    setSelectedRol(rol);
    setEditRolModalOpen(true);
  };

  const openDeleteDialog = (rol) => {
    setRolToDelete(rol);
    setDeleteDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  console.log('Current roles state:', roles);
  console.log('Loading state:', loading);

  return (
    <div className="roles-permissions-container">
      <h1>Gestión de Roles</h1>

      {/* Sección de filtros */}
      <div className="filter-section">
        <div>
          <label>Buscar Roles</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
          />
        </div>
        
        <div className="button-group">
          <button onClick={() => fetchRoles(currentPage)} className="filter-button">
            🔍 Buscar
          </button>
          <button onClick={clearFilters} className="clear-button">
            🗑️ Limpiar
          </button>
        </div>
      </div>

      {/* Header de sección */}
      <div className="section-header">
        <h2>Lista de Roles</h2>
        <div className="header-actions">
          <FormControlLabel
            control={
              <Switch
                checked={dense}
                onChange={(e) => setDense(e.target.checked)}
              />
            }
            label="Vista compacta"
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewRolModalOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
              }
            }}
          >
            Nuevo Rol
          </Button>
        </div>
      </div>

      {error && (
        <div className="error-message">
                      {typeof error === 'string' ? error : 'Error desconocido'}
        </div>
      )}

      {/* Información de paginación */}
      {!loading && roles.length > 0 && (
        <div className="pagination-info">
          <p>
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalRecords)} de {totalRecords} roles
          </p>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando roles...</p>
        </div>
      ) : roles.length > 0 ? (
        <>
          <table className="roles-permissions-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Rol</th>
                <th>Descripción</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((rol) => (
                <tr key={rol.atr_id_rol}>
                  <td>{rol.atr_id_rol}</td>
                  <td>
                    <strong>{rol.atr_rol}</strong>
                  </td>
                  <td>
                    <div className="description-cell">
                      {rol.atr_descripcion || 'Sin descripción'}
                    </div>
                  </td>
                  <td>
                    {rol.atr_fecha_creacion ? new Date(rol.atr_fecha_creacion).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <button
                      className="action-button edit"
                      onClick={() => openEditModal(rol)}
                      title="Editar rol"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => openDeleteDialog(rol)}
                      title="Eliminar rol"
                      disabled={rol.atr_id_rol === 1}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
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
          <h3>No hay roles</h3>
          <p>
            No se encontraron roles con los filtros aplicados.
            {searchTerm && (
              <span> Intenta ajustar los filtros de búsqueda.</span>
            )}
          </p>
        </div>
      )}

      {/* Modal para crear nuevo rol */}
      <NewRolModal
        open={newRolModalOpen}
        onClose={() => setNewRolModalOpen(false)}
        onSubmit={handleCreateRol}
      />

      {/* Modal para editar rol */}
      <EditRolModal
        open={editRolModalOpen}
        onClose={() => setEditRolModalOpen(false)}
        onSubmit={handleEditRol}
        rol={selectedRol}
      />

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el rol "{rolToDelete?.atr_rol}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteRol} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RolesManagement; 
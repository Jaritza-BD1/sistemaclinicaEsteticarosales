import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControlLabel as MuiFormControlLabel,
  Switch
} from '@mui/material';
import {
  Save as SaveIcon
} from '@mui/icons-material';
import api from '../../services/api';
import './roles-permissions.css';

const PermissionsManagement = ({ onNotification }) => {
  const [roles, setRoles] = useState([]);
  const [objects, setObjects] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [currentPermissions, setCurrentPermissions] = useState({
    atr_permiso_insercion: '',
    atr_permiso_eliminacion: '',
    atr_permiso_actualizacion: '',
    atr_permiso_consultar: ''
  });
  const [error, setError] = useState('');

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [dense, setDense] = useState(false);
  const itemsPerPage = 10;

  // Cargar datos iniciales
  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      const [rolesResponse, objectsResponse] = await Promise.all([
        api.get('/roles'),
        api.get('/objetos', { 
          params: {
            page: currentPage,
            limit: itemsPerPage
          }
        })
      ]);

      console.log('Roles response:', rolesResponse);
      console.log('Objects response:', objectsResponse);

      // El interceptor ya devuelve response.data, así que accedemos directamente
      setRoles(rolesResponse.data || []);
      setObjects(objectsResponse.data || []);
      setTotalRecords(objectsResponse.meta?.total || 0);
      setTotalPages(objectsResponse.meta?.totalPages || 1);

      if (rolesResponse.data?.length > 0) {
        setSelectedRole(rolesResponse.data[0].atr_id_rol.toString());
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Error al cargar los datos iniciales');
      onNotification('Error al cargar los datos iniciales', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cargar permisos para un rol específico
  const fetchPermissions = async (roleId) => {
    if (!roleId) return;

    setLoading(true);
    try {
      const response = await api.get(`/permisos/rol/${roleId}`);
      console.log('Permissions response:', response);
      // El interceptor ya devuelve response.data, así que accedemos directamente
      setPermissions(response.data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setError('Error al cargar los permisos');
      onNotification('Error al cargar los permisos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cargar objetos con paginación
  const fetchObjects = async (page = currentPage) => {
    setLoading(true);
    try {
      const response = await api.get('/objetos', {
        params: {
          page: page,
          limit: itemsPerPage
        }
      });
      console.log('Objects response:', response);
      // El interceptor ya devuelve response.data, así que accedemos directamente
      setObjects(response.data || []);
      setTotalRecords(response.meta?.total || 0);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching objects:', error);
      setError('Error al cargar los objetos');
      onNotification('Error al cargar los objetos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchPermissions(selectedRole);
    }
  }, [selectedRole]);

  useEffect(() => {
    fetchObjects();
  }, [currentPage, itemsPerPage]);

  // Manejar cambio de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchObjects(pageNumber);
  };

  // Obtener permisos para un objeto específico
  const getPermissionsForObject = (objectId) => {
    const permission = permissions.find(p => p.atr_id_objeto === objectId);
    return permission || {
      atr_permiso_insercion: '',
      atr_permiso_eliminacion: '',
      atr_permiso_actualizacion: '',
      atr_permiso_consultar: ''
    };
  };

  // Verificar si un permiso está habilitado (string no vacío)
  const isPermissionEnabled = (permissionValue) => {
    return permissionValue && permissionValue.trim() !== '';
  };

  // Abrir diálogo de permisos
  const openPermissionDialog = (object) => {
    const currentPerms = getPermissionsForObject(object.atr_id_objetos);
    setCurrentPermissions(currentPerms);
    setSelectedObject(object);
    setPermissionDialogOpen(true);
  };

  // Guardar permisos
  const savePermissions = async () => {
    if (!selectedRole || !selectedObject) return;

    setSaving(true);
    try {
      await api.post('/permisos/upsert', {
        atr_id_rol: parseInt(selectedRole),
        atr_id_objeto: selectedObject.atr_id_objetos,
        ...currentPermissions
      });

      onNotification('Permisos guardados exitosamente');
      setPermissionDialogOpen(false);
      fetchPermissions(selectedRole);
    } catch (error) {
      console.error('Error saving permissions:', error);
      onNotification('Error al guardar los permisos', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Manejar cambios en permisos
  const handlePermissionChange = (permission) => {
    setCurrentPermissions(prev => ({
      ...prev,
      [permission]: prev[permission] ? '' : 'HABILITADO'
    }));
  };

  // Renderizar badge de permiso
  const renderPermissionBadge = (hasPermission, label) => (
    <span className={`permission-badge ${isPermissionEnabled(hasPermission) ? 'success' : 'secondary'}`}>
      {label}
    </span>
  );

  return (
    <div className="roles-permissions-container">
      <h1>Gestión de Permisos</h1>

      {/* Sección de filtros */}
      <div className="filter-section">
        <div>
          <label>Seleccionar Rol</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={loading}
          >
            {roles.map((role) => (
              <option key={role.atr_id_rol} value={role.atr_id_rol.toString()}>
                {role.atr_rol} - {role.atr_descripcion}
              </option>
            ))}
          </select>
        </div>
        
        <div className="button-group">
          <button 
            onClick={() => {
              fetchPermissions(selectedRole);
              fetchObjects();
            }} 
            className="filter-button"
            disabled={loading || !selectedRole}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Header de sección */}
      <div className="section-header">
        <h2>Permisos por Objeto</h2>
        <div className="header-actions">
          <MuiFormControlLabel
            control={
              <Switch
                checked={dense}
                onChange={(e) => setDense(e.target.checked)}
              />
            }
            label="Vista compacta"
          />
        </div>
      </div>

      {error && (
        <div className="error-message">
                      {typeof error === 'string' ? error : 'Error desconocido'}
        </div>
      )}

      {/* Información de paginación */}
      {!loading && objects.length > 0 && (
        <div className="pagination-info">
          <p>
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalRecords)} de {totalRecords} objetos
          </p>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando permisos...</p>
        </div>
      ) : objects.length > 0 ? (
        <>
          <table className="roles-permissions-table">
            <thead>
              <tr>
                <th>Objeto</th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th>Permisos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {objects.map((object) => {
                const perms = getPermissionsForObject(object.atr_id_objetos);
                return (
                  <tr key={object.atr_id_objetos}>
                    <td>
                      <strong>{object.atr_objeto}</strong>
                    </td>
                    <td>
                      <div className="description-cell">
                        {object.atr_descripcion || 'Sin descripción'}
                      </div>
                    </td>
                    <td>
                      <span className="permission-badge primary">
                        {object.atr_tipo_objeto || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {renderPermissionBadge(perms.atr_permiso_consultar, 'Consultar')}
                        {renderPermissionBadge(perms.atr_permiso_insercion, 'Insertar')}
                        {renderPermissionBadge(perms.atr_permiso_actualizacion, 'Actualizar')}
                        {renderPermissionBadge(perms.atr_permiso_eliminacion, 'Eliminar')}
                      </div>
                    </td>
                    <td>
                      <button
                        className="action-button security"
                        onClick={() => openPermissionDialog(object)}
                        title="Editar permisos"
                      >
                        🔐
                      </button>
                    </td>
                  </tr>
                );
              })}
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
          <h3>No hay objetos</h3>
          <p>
            No se encontraron objetos para mostrar.
          </p>
        </div>
      )}

      {/* Diálogo de permisos */}
      <Dialog open={permissionDialogOpen} onClose={() => setPermissionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Editar Permisos: {selectedObject?.atr_objeto}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Selecciona los permisos que deseas habilitar para este objeto:
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={isPermissionEnabled(currentPermissions.atr_permiso_consultar)}
                  onChange={() => handlePermissionChange('atr_permiso_consultar')}
                />
              }
              label="Consultar"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={isPermissionEnabled(currentPermissions.atr_permiso_insercion)}
                  onChange={() => handlePermissionChange('atr_permiso_insercion')}
                />
              }
              label="Insertar"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={isPermissionEnabled(currentPermissions.atr_permiso_actualizacion)}
                  onChange={() => handlePermissionChange('atr_permiso_actualizacion')}
                />
              }
              label="Actualizar"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={isPermissionEnabled(currentPermissions.atr_permiso_eliminacion)}
                  onChange={() => handlePermissionChange('atr_permiso_eliminacion')}
                />
              }
              label="Eliminar"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={savePermissions}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {saving ? 'Guardando...' : 'Guardar Permisos'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PermissionsManagement; 
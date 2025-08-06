// src/components/LogManagement.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import api from '../services/api';
import './log-management.css';

const LogManagement = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ idUsuario: '', accion: '', from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 10; // Número de registros por página
  
  // Fetch logs with current filters and paginación
  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const offset = (page - 1) * itemsPerPage;
      const params = {
        limit: itemsPerPage,
        offset: offset,
        ...filters
      };
      
      // Solo incluir filtros que tengan valor
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const res = await api.get('/admin/logs', { params }); 
      
      if (res.data && res.data.data) {
        setLogs(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalRecords(res.data.pagination?.totalRecords || 0);
      } else {
        setLogs([]);
        setTotalPages(1);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('No se pudieron cargar los registros');
      setLogs([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [filters, itemsPerPage]);

  useEffect(() => {
    fetchLogs(currentPage);
  }, [fetchLogs, currentPage]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ idUsuario: '', accion: '', from: '', to: '' });
    setCurrentPage(1); // Volver a la primera página al limpiar filtros
  };

  const handleFilter = () => {
    setCurrentPage(1); // Volver a la primera página al aplicar filtros
    fetchLogs(1);
  };

  const handleDelete = async (id) => {
    if (user?.role !== 'admin') return;
    if (!window.confirm('¿Está seguro de que desea eliminar este registro?')) return;
    try {
      await api.delete(`/admin/logs/${id}`);
      // Recargar la página actual después de eliminar
      fetchLogs(currentPage);
    } catch (err) {
      console.error('Error deleting log:', err);
      setError('Error al eliminar registro');
    }
  };

  // Función para manejar cambios de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="log-management-container">
      <h1>Gestión de Bitácora del Sistema</h1>

      <div className="filter-section">
        <div>
          <label>ID Usuario</label>
          <input
            type="text"
            name="idUsuario"
            value={filters.idUsuario}
            onChange={handleChange}
            placeholder="Ingrese ID de usuario"
          />
        </div>
        
        <div>
          <label>Acción</label>
          <select
            name="accion"
            value={filters.accion}
            onChange={handleChange}
          >
            <option value="">Todas las acciones</option>
            <option value="Ingreso">Ingreso</option>
            <option value="Nuevo">Nuevo</option>
            <option value="Update">Update</option>
            <option value="Delete">Delete</option>
            <option value="Consulta">Consulta</option>
          </select>
        </div>
        
        <div>
          <label>Desde</label>
          <input
            type="date"
            name="from"
            value={filters.from}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label>Hasta</label>
          <input
            type="date"
            name="to"
            value={filters.to}
            onChange={handleChange}
          />
        </div>
        
        <div className="button-group">
          <button onClick={handleFilter} className="filter-button">
            🔍 Consultar
          </button>
          <button onClick={clearFilters} className="clear-button">
            🗑️ Limpiar
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {typeof error === 'string' ? error : 'Error desconocido'}
        </div>
      )}

      {/* Información de paginación */}
      {!loading && logs.length > 0 && (
        <div className="pagination-info">
          <p>
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalRecords)} de {totalRecords} registros
          </p>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando registros...</p>
        </div>
      ) : logs.length > 0 ? (
        <>
          <table className="log-table">
            <thead>
              <tr>
                <th>ID Bitácora</th>
                <th>ID Usuario</th>
                <th>Acción</th>
                <th>Fecha</th>
                <th>Descripción</th>
                {user?.role === 'admin' && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.idUsuario}</td>
                  <td>
                    <span className={`action-badge ${getActionClass(log.accion)}`}>
                      {log.accion}
                    </span>
                  </td>
                  <td>{log.fecha ? new Date(log.fecha).toLocaleDateString('es-ES') : ''}</td>
                  <td>
                    <div className="description-cell">
                      {log.descripcion || 'Sin descripción'}
                    </div>
                  </td>
                  {user?.role === 'admin' && (
                    <td>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(log.id)}
                        title="Eliminar registro"
                      >
                        🗑️
                      </button>
                    </td>
                  )}
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
          <h3>No hay registros</h3>
          <p>
            No se encontraron registros de bitácora con los filtros aplicados.
            {Object.values(filters).some(f => f !== '') && (
              <span> Intenta ajustar los filtros de búsqueda.</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

// Función auxiliar para obtener la clase CSS del badge según la acción
const getActionClass = (action) => {
  switch (action) {
    case 'Ingreso':
      return 'success';
    case 'Nuevo':
      return 'primary';
    case 'Update':
      return 'warning';
    case 'Delete':
      return 'danger';
    case 'Consulta':
      return 'info';
    default:
      return 'secondary';
  }
};

export default LogManagement;

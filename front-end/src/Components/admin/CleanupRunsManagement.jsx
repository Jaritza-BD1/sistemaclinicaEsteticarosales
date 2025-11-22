import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress
} from '@mui/material';
import api from '../../services/api';
import './../../pages/RolandPermissionpage.css';

const itemsPerPage = 10;

const CleanupRunsManagement = ({ onNotification }) => {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [runningCleanup, setRunningCleanup] = useState(false);

  const fetchRuns = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: itemsPerPage };
      const resp = await api.get('/admin/cleanup-runs', { params });
      const payload = resp.data || {};
      const data = Array.isArray(payload.data) ? payload.data : (payload.data || []);
      const meta = payload.meta || {};
      setRuns(data);
      setTotalPages(meta.totalPages || meta.total_pages || 1);
      setTotalRecords(meta.total || 0);
    } catch (err) {
      console.error('Error fetching cleanup runs', err);
      onNotification('Error al cargar ejecuciones de limpieza', 'error');
    } finally {
      setLoading(false);
    }
  }, [onNotification]);

  useEffect(() => {
    fetchRuns(currentPage);
  }, [currentPage, fetchRuns]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/admin/uploads/preview');
      const candidates = resp.data?.candidates || resp.data || [];
      setPreviewData(candidates);
      setPreviewOpen(true);
    } catch (err) {
      console.error('Error previewing uploads', err);
      onNotification('Error al obtener vista previa', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCleanup = async () => {
    if (!window.confirm('¿Deseas ejecutar la limpieza ahora? Los archivos detectados se moverán a la papelera.')) return;
    setRunningCleanup(true);
    try {
      const resp = await api.post('/admin/uploads/cleanup');
      const result = resp.data || {};
      onNotification('Limpieza ejecutada: ' + (result.moved_count || result.moved || 0));
      fetchRuns(currentPage);
    } catch (err) {
      console.error('Error running cleanup', err);
      onNotification('Error al ejecutar la limpieza', 'error');
    } finally {
      setRunningCleanup(false);
    }
  };

  return (
    <div className="roles-permissions-container">
      <h1>Gestión de Limpieza de Uploads</h1>

      <div className="section-header">
        <h2>Ejecuciones de Limpieza</h2>
        <div className="header-actions">
          <Button variant="contained" onClick={handlePreview} disabled={loading}>
            Vista previa de archivos huérfanos
          </Button>
          <Button variant="contained" color="warning" onClick={handleRunCleanup} disabled={runningCleanup} sx={{ ml: 2 }}>
            {runningCleanup ? 'Ejecutando...' : 'Ejecutar limpieza ahora'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          <Table className="roles-permissions-table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Mover</TableCell>
                <TableCell>Eliminar</TableCell>
                <TableCell>Detalles</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {runs.map((r) => (
                <TableRow key={r.atr_id_cleanup}>
                  <TableCell>{r.atr_id_cleanup}</TableCell>
                  <TableCell>{r.atr_tipo}</TableCell>
                  <TableCell>{r.atr_fecha_ejecucion ? new Date(r.atr_fecha_ejecucion).toLocaleString() : '-'}</TableCell>
                  <TableCell>{r.atr_moved_count ?? r.moved_count ?? 0}</TableCell>
                  <TableCell>{r.atr_deleted_count ?? r.deleted_count ?? 0}</TableCell>
                  <TableCell>
                    <Button onClick={() => {
                      setPreviewData(r.atr_details || r.details || []);
                      setPreviewOpen(true);
                    }}>Ver</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="pagination" style={{ marginTop: 12 }}>
              <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="pagination-btn">⏮️ Primera</button>
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">◀️ Anterior</button>
              <span className="page-info">Página {currentPage} de {totalPages}</span>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">Siguiente ▶️</button>
              <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="pagination-btn">Última ⏭️</button>
            </div>
          )}
        </>
      )}

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Vista previa - Archivos detectados</DialogTitle>
        <DialogContent>
          {Array.isArray(previewData) && previewData.length > 0 ? (
            <Box>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Path</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Tamaño (bytes)</TableCell>
                    <TableCell>Modificado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.map((f, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{f.path || f.relativePath || f.fullPath || f}</TableCell>
                      <TableCell>{f.basename || f.name || '-'}</TableCell>
                      <TableCell>{f.size ?? '-'}</TableCell>
                      <TableCell>{f.mtime ? new Date(f.mtime).toLocaleString() : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Typography>No se encontraron archivos.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CleanupRunsManagement;

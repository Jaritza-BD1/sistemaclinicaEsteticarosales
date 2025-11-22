import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import api from '../../services/api';
import '../../pages/RolandPermissionpage.css';

const TrashManagement = ({ onNotification }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('');

  const fetchTrash = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await api.get('/admin/uploads/trash');
      const data = resp.data?.files || resp.data || [];
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching trash', err);
      onNotification('Error cargando la papelera', 'error');
    } finally {
      setLoading(false);
    }
  }, [onNotification]);

  useEffect(() => { fetchTrash(); }, [fetchTrash]);

  const toggleSelect = (key) => {
    const ns = new Set(selected);
    if (ns.has(key)) ns.delete(key); else ns.add(key);
    setSelected(ns);
  };

  const totalPages = Math.max(1, Math.ceil(files.length / itemsPerPage));
  const paginatedFiles = files.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const gotoPage = (p) => {
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    setCurrentPage(p);
  };

  const toPreviewUrl = (filePath) => {
    if (!filePath) return null;
    // Build public URL from server absolute path returned by backend
    // Normalize backslashes then remove trailing /api or trailing slash
    const baseRaw = (api.defaults.baseURL || '').replace(/\\/g, '/');
    const base = baseRaw.replace(/\/api(\/)?$/i, '').replace(/\/$/, '');
    // find the uploads/... segment in the server absolute path
    const normalized = filePath.replace(/\\/g, '/');
    const m = normalized.match(/(uploads\/.*)$/i);
    if (!m) return null;
    return `${base}/${m[1].replace(/\\/g, '/')}`;
  };

  const openPreview = (file) => {
    const url = toPreviewUrl(file.path || file.relativePath || file.name || '');
    if (!url) return onNotification('No se puede previsualizar este archivo', 'warning');
    const ext = (file.name || '').split('.').pop()?.toLowerCase();
    if (['jpg','jpeg','png','gif','webp','bmp'].includes(ext)) setPreviewType('image');
    else if (ext === 'pdf') setPreviewType('pdf');
    else setPreviewType('other');
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const handleRestore = async () => {
    if (selected.size === 0) return onNotification('Selecciona al menos un archivo', 'warning');
    setConfirmAction('restore');
    setConfirmOpen(true);
  };

  const handleDeletePermanent = async () => {
    if (selected.size === 0) return onNotification('Selecciona al menos un archivo', 'warning');
    setConfirmAction('delete');
    setConfirmOpen(true);
  };

  const performConfirmed = async () => {
    setConfirmOpen(false);
    const arr = Array.from(selected);
    if (arr.length === 0) return;
    let successCount = 0;
    try {
      if (confirmAction === 'restore') {
        for (const key of arr) {
          try {
            await api.post('/admin/uploads/trash/restore', { trashPath: key });
            successCount++;
          } catch (e) {
            console.error('Error restoring', key, e);
          }
        }
        onNotification(`${successCount} archivos restaurados`, successCount ? 'success' : 'error');
      } else {
        for (const key of arr) {
          try {
            await api.post('/admin/uploads/trash/delete', { trashPath: key });
            successCount++;
          } catch (e) {
            console.error('Error deleting', key, e);
          }
        }
        onNotification(`${successCount} archivos eliminados permanentemente`, successCount ? 'success' : 'error');
      }
      setSelected(new Set());
      fetchTrash();
    } catch (err) {
      console.error('Error performing action on trash', err);
      onNotification('Error al procesar la acción', 'error');
    }
  };

  return (
    <div className="roles-permissions-container">
      <h1>Papelera de Uploads</h1>

      <div className="section-header">
        <h2>Archivos en papelera</h2>
        <div className="header-actions">
          <Button variant="contained" onClick={fetchTrash} disabled={loading}>Refrescar</Button>
          <Button variant="contained" color="success" onClick={handleRestore} sx={{ ml: 1 }}>Restaurar</Button>
          <Button variant="contained" color="error" onClick={handleDeletePermanent} sx={{ ml: 1 }}>Eliminar permanentemente</Button>
        </div>
      </div>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : (
        files.length > 0 ? (
          <>
            <Table className="roles-permissions-table">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Preview</TableCell>
                  <TableCell>Path</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Tamaño</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedFiles.map((f, idx) => (
                  <TableRow key={(currentPage-1)*itemsPerPage + idx}>
                    <TableCell>
                      <Checkbox checked={selected.has(f.path)} onChange={() => toggleSelect(f.path)} />
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const name = f.name || f.basename || '';
                        const ext = name.split('.').pop()?.toLowerCase();
                        const url = toPreviewUrl(f.path || f.relativePath || name);
                        if (['jpg','jpeg','png','gif','webp','bmp'].includes(ext) && url) {
                          return <img src={url} alt={name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6 }} />;
                        }
                        if (ext === 'pdf') return <PictureAsPdfIcon sx={{ fontSize: 38 }} />;
                        return <span style={{ color: '#666' }}>—</span>;
                      })()}
                    </TableCell>
                    <TableCell style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.path || f.relativePath || '-'}</TableCell>
                    <TableCell>{f.basename || f.name || '-'}</TableCell>
                    <TableCell>{f.size ?? '-'}</TableCell>
                    <TableCell>{f.mtime ? new Date(f.mtime).toLocaleString() : '-'}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => openPreview(f)}>Previsualizar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="pagination" style={{ marginTop: 12 }}>
                <button onClick={() => gotoPage(1)} disabled={currentPage === 1} className="pagination-btn">⏮️ Primera</button>
                <button onClick={() => gotoPage(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">◀️ Anterior</button>
                <span className="page-info">Página {currentPage} de {totalPages}</span>
                <button onClick={() => gotoPage(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">Siguiente ▶️</button>
                <button onClick={() => gotoPage(totalPages)} disabled={currentPage === totalPages} className="pagination-btn">Última ⏭️</button>
              </div>
            )}
          </>
        ) : (
          <Typography sx={{ p: 2 }}>No hay archivos en la papelera.</Typography>
        )
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar acción</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro? Esta acción no se puede deshacer si eliges eliminar permanentemente.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={performConfirmed} color={confirmAction === 'delete' ? 'error' : 'success'} variant="contained">Sí, continuar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Previsualización</DialogTitle>
        <DialogContent>
          {previewType === 'image' && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <img src={previewUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }} />
            </Box>
          )}
          {previewType === 'pdf' && (
            <iframe src={previewUrl} title="pdf-preview" style={{ width: '100%', height: '80vh', border: 'none' }} />
          )}
          {previewType === 'other' && (
            <Typography>Tipo de archivo no previsualizable en el navegador.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TrashManagement;

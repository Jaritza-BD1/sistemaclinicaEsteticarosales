import React, { useEffect, useState } from 'react';
import backupApi from '../../services/backupApi';

export default function BackupPage() {
  const [history, setHistory] = useState({ data: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ server: 'localhost', database: '', user: '', password: '', fileName: 'manual-backup' });

  useEffect(() => {
    loadHistory(page);
  }, [page]);

  async function loadHistory(p = 1) {
    setLoading(true);
    try {
      const res = await backupApi.getBackupHistory(p, 20);
      setHistory(res);
    } catch (err) {
      console.error(err);
      alert('Error cargando historial: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await backupApi.createBackup(form);
      alert('Backup solicitado (revise el historial)');
      await loadHistory();
    } catch (err) {
      console.error(err);
      alert('Error creando backup: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(filePath) {
    if (!window.confirm('¿Restaurar desde ' + filePath + ' ?')) return;
    setLoading(true);
    try {
      await backupApi.restoreBackup({ server: form.server, database: form.database || 'restored_db', backupFile: filePath });
      alert('Restauración iniciada');
    } catch (err) {
      console.error(err);
      alert('Error restaurando: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Gestión de Backups</h2>

      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <div>
          <label>Servidor</label>
          <input value={form.server} onChange={e => setForm({ ...form, server: e.target.value })} />
        </div>
        <div>
          <label>Base de datos</label>
          <input value={form.database} onChange={e => setForm({ ...form, database: e.target.value })} />
        </div>
        <div>
          <label>Usuario</label>
          <input value={form.user} onChange={e => setForm({ ...form, user: e.target.value })} />
        </div>
        <div>
          <label>Contraseña</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        <div>
          <label>Nombre de archivo (prefijo)</label>
          <input value={form.fileName} onChange={e => setForm({ ...form, fileName: e.target.value })} />
        </div>
        <button type="submit" disabled={loading}>Crear Backup</button>
      </form>

      <h3>Historial</h3>
      {loading && <div>Cargando...</div>}
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Archivo</th>
            <th>Tamaño</th>
            <th>Creado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {history.data.map(h => (
            <tr key={h.id}>
              <td>{h.fileName}</td>
              <td>{h.size}</td>
              <td>{new Date(h.createdAt).toLocaleString()}</td>
              <td>
                <a href={backupApi.downloadBackupUrl(h.fileName)} target="_blank" rel="noreferrer">Descargar</a>
                {' '}
                <button onClick={() => handleRestore(h.path)}>Restaurar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 8 }}>
        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</button>
        <span style={{ margin: '0 8px' }}>Página {history.page} / {history.pages} (Total: {history.total})</span>
        <button disabled={page >= history.pages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
      </div>
    </div>
  );
}

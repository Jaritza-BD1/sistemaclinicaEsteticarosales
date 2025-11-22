const API_BASE = process.env.REACT_APP_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error en la petición');
  }
  return res.json();
}

export async function createBackup(data) {
  return request('/api/admin/backup/create', { method: 'POST', body: JSON.stringify(data) });
}

export async function getBackupHistory(page = 1, limit = 20) {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  return request(`/api/admin/backup/history?${q.toString()}`);
}

export async function restoreBackup(data) {
  return request('/api/admin/backup/restore', { method: 'POST', body: JSON.stringify(data) });
}

export async function deleteBackup(backupId) {
  return request(`/api/admin/backup/${backupId}`, { method: 'DELETE' });
}

export async function downloadBackupUrl(backupId) {
  // return a full URL for download
  return `${API_BASE}/api/admin/backup/download/${backupId}`;
}

export default { createBackup, getBackupHistory, restoreBackup, deleteBackup, downloadBackupUrl };

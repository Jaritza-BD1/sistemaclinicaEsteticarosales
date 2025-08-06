import api from './api';

export const backupService = {
  // Probar conexión a la base de datos
  async testConnection(connectionConfig) {
    try {
      const response = await api.post('/admin/backup/test-connection', connectionConfig);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al probar la conexión');
    }
  },

  // Crear backup
  async createBackup(backupConfig) {
    try {
      const response = await api.post('/admin/backup/create', backupConfig);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear el backup');
    }
  },

  // Obtener servidores disponibles
  async getAvailableServers() {
    try {
      const response = await api.get('/admin/backup/servers');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo servidores:', error);
      return ['CRISTIAN', '(local)', 'localhost'];
    }
  },

  // Obtener bases de datos disponibles
  async getAvailableDatabases(server) {
    try {
      const response = await api.get(`/admin/backup/databases?server=${server}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo bases de datos:', error);
      return ['Farmacia', 'master', 'tempdb'];
    }
  },

  // Restaurar backup
  async restoreBackup(restoreConfig) {
    try {
      const response = await api.post('/admin/backup/restore', restoreConfig);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al restaurar el backup');
    }
  },

  // Obtener historial de backups
  async getBackupHistory() {
    try {
      const response = await api.get('/admin/backup/history');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener el historial');
    }
  },

  // Eliminar backup
  async deleteBackup(backupId) {
    try {
      const response = await api.delete(`/admin/backup/${backupId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar el backup');
    }
  },

  // Descargar backup
  async downloadBackup(backupId) {
    try {
      const response = await api.get(`/admin/backup/download/${backupId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al descargar el backup');
    }
  },

  // Funciones para jobs automáticos
  async createJob(jobConfig) {
    try {
      const response = await api.post('/admin/scheduler/jobs', jobConfig);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear el job automático');
    }
  },

  async getJobs() {
    try {
      const response = await api.get('/admin/scheduler/jobs');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener los jobs');
    }
  },

  async getJobStats() {
    try {
      const response = await api.get('/admin/scheduler/jobs/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  async updateJob(jobId, jobConfig) {
    try {
      const response = await api.put(`/admin/scheduler/jobs/${jobId}`, jobConfig);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el job');
    }
  },

  async deleteJob(jobId) {
    try {
      const response = await api.delete(`/admin/scheduler/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar el job');
    }
  },

  async startJob(jobId) {
    try {
      const response = await api.post(`/admin/scheduler/jobs/${jobId}/start`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al iniciar el job');
    }
  },

  async stopJob(jobId) {
    try {
      const response = await api.post(`/admin/scheduler/jobs/${jobId}/stop`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al detener el job');
    }
  },

  async executeJob(jobId) {
    try {
      const response = await api.post(`/admin/scheduler/jobs/${jobId}/execute`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al ejecutar el job');
    }
  }
}; 
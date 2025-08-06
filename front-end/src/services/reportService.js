// front-end/src/services/reportService.js
import { hasPermission } from './permissionService';

// Tipos de reportes disponibles
const REPORT_TYPES = {
  APPOINTMENTS: 'appointments',
  PATIENTS: 'patients',
  DOCTORS: 'doctors',
  EXAMS: 'exams',
  TREATMENTS: 'treatments',
  PHARMACY: 'pharmacy',
  FINANCIAL: 'financial',
  AUDIT: 'audit'
};

// Configuración de reportes
const REPORT_CONFIG = {
  [REPORT_TYPES.APPOINTMENTS]: {
    name: 'Reporte de Citas',
    permissions: ['appointments:read'],
    charts: ['daily', 'weekly', 'monthly', 'doctor_performance'],
    exports: ['pdf', 'excel', 'csv']
  },
  [REPORT_TYPES.PATIENTS]: {
    name: 'Reporte de Pacientes',
    permissions: ['patients:read'],
    charts: ['demographics', 'age_distribution', 'gender_distribution', 'geographic'],
    exports: ['pdf', 'excel', 'csv']
  },
  [REPORT_TYPES.DOCTORS]: {
    name: 'Reporte de Médicos',
    permissions: ['doctors:read'],
    charts: ['workload', 'specialty_distribution', 'performance_metrics'],
    exports: ['pdf', 'excel', 'csv']
  },
  [REPORT_TYPES.EXAMS]: {
    name: 'Reporte de Exámenes',
    permissions: ['exams:read'],
    charts: ['exam_types', 'results_distribution', 'pending_exams'],
    exports: ['pdf', 'excel', 'csv']
  },
  [REPORT_TYPES.TREATMENTS]: {
    name: 'Reporte de Tratamientos',
    permissions: ['treatments:read'],
    charts: ['treatment_types', 'success_rate', 'duration_analysis'],
    exports: ['pdf', 'excel', 'csv']
  },
  [REPORT_TYPES.PHARMACY]: {
    name: 'Reporte de Farmacia',
    permissions: ['products:read'],
    charts: ['inventory_levels', 'sales_analysis', 'expiring_products'],
    exports: ['pdf', 'excel', 'csv']
  },
  [REPORT_TYPES.FINANCIAL]: {
    name: 'Reporte Financiero',
    permissions: ['reports:read'],
    charts: ['revenue_analysis', 'cost_analysis', 'profit_margin'],
    exports: ['pdf', 'excel', 'csv']
  },
  [REPORT_TYPES.AUDIT]: {
    name: 'Reporte de Auditoría',
    permissions: ['audit:read'],
    charts: ['user_activity', 'system_events', 'security_events'],
    exports: ['pdf', 'excel', 'csv']
  }
};

// Funciones de generación de reportes
export const generateReport = async (reportType, filters = {}, user) => {
  try {
    // Validar permisos
    const config = REPORT_CONFIG[reportType];
    if (!config || !hasPermission(user, config.permissions[0])) {
      throw new Error('No tienes permisos para generar este reporte');
    }

    // Construir parámetros del reporte
    const reportParams = {
      type: reportType,
      filters,
      user: user.id,
      timestamp: new Date().toISOString()
    };

    // Simular llamada a API
    const response = await fetch('/api/reports/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(reportParams)
    });

    if (!response.ok) {
      throw new Error('Error al generar el reporte');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generando reporte:', error);
    throw error;
  }
};

// Función para obtener datos de gráficos
export const getChartData = async (reportType, chartType, filters = {}, user) => {
  try {
    const config = REPORT_CONFIG[reportType];
    if (!config || !hasPermission(user, config.permissions[0])) {
      throw new Error('No tienes permisos para acceder a estos datos');
    }

    const response = await fetch('/api/reports/chart-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        reportType,
        chartType,
        filters,
        user: user.id
      })
    });

    if (!response.ok) {
      throw new Error('Error al obtener datos del gráfico');
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo datos del gráfico:', error);
    throw error;
  }
};

// Función para exportar reportes
export const exportReport = async (reportId, format, user) => {
  try {
    const response = await fetch(`/api/reports/${reportId}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        format,
        user: user.id
      })
    });

    if (!response.ok) {
      throw new Error('Error al exportar el reporte');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${reportId}.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Error exportando reporte:', error);
    throw error;
  }
};

// Función para obtener reportes disponibles
export const getAvailableReports = (user) => {
  return Object.entries(REPORT_CONFIG)
    .filter(([_, config]) => 
      config.permissions.some(permission => hasPermission(user, permission))
    )
    .map(([type, config]) => ({
      type,
      name: config.name,
      charts: config.charts,
      exports: config.exports
    }));
};

// Función para programar reportes
export const scheduleReport = async (reportType, schedule, user) => {
  try {
    const config = REPORT_CONFIG[reportType];
    if (!config || !hasPermission(user, config.permissions[0])) {
      throw new Error('No tienes permisos para programar este reporte');
    }

    const response = await fetch('/api/reports/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        reportType,
        schedule,
        user: user.id
      })
    });

    if (!response.ok) {
      throw new Error('Error al programar el reporte');
    }

    return await response.json();
  } catch (error) {
    console.error('Error programando reporte:', error);
    throw error;
  }
};

// Hook para reportes
export const useReports = () => {
  const { user } = useAuth();
  
  return {
    generateReport: (reportType, filters) => generateReport(reportType, filters, user),
    getChartData: (reportType, chartType, filters) => getChartData(reportType, chartType, filters, user),
    exportReport: (reportId, format) => exportReport(reportId, format, user),
    scheduleReport: (reportType, schedule) => scheduleReport(reportType, schedule, user),
    getAvailableReports: () => getAvailableReports(user),
    hasReportPermission: (reportType) => {
      const config = REPORT_CONFIG[reportType];
      return config && config.permissions.some(permission => hasPermission(user, permission));
    }
  };
};

export default {
  REPORT_TYPES,
  REPORT_CONFIG,
  generateReport,
  getChartData,
  exportReport,
  getAvailableReports,
  scheduleReport,
  useReports
}; 
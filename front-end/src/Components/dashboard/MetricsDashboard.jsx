import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useCache } from '../../services/cacheService';
import { usePermissions } from '../../services/permissionService';

function MetricsDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { getStats } = useCache();
  const { hasPermission } = usePermissions();

  const [metrics, setMetrics] = useState({
    formPerformance: {
      averageLoadTime: 1.2,
      successRate: 95.8,
      errorRate: 4.2,
      totalSubmissions: 1247
    },
    securityMetrics: {
      sanitizedInputs: 100,
      blockedAttacks: 23,
      csrfValidations: 100,
      permissionChecks: 100
    },
    cacheMetrics: {
      hitRate: 87.5,
      memoryUsage: 2.4,
      cacheSize: 45,
      maxSize: 100
    },
    userMetrics: {
      activeUsers: 23,
      totalUsers: 156,
      formsCompleted: 89,
      formsInProgress: 12
    }
  });

  useEffect(() => {
    // Simular actualización de métricas en tiempo real
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        formPerformance: {
          ...prev.formPerformance,
          totalSubmissions: prev.formPerformance.totalSubmissions + Math.floor(Math.random() * 3)
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getPerformanceColor = (value) => {
    if (value >= 90) return 'success';
    if (value >= 70) return 'warning';
    return 'error';
  };

  const getSecurityColor = (value) => {
    if (value === 100) return 'success';
    if (value >= 95) return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ color: 'primary.main', mb: 3, display: 'flex', alignItems: 'center' }}>
        <TrendingUpIcon sx={{ mr: 1 }} />
        Dashboard de Métricas
      </Typography>

      <Grid container spacing={3}>
        {/* Performance de Formularios */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            border: '1px solid',
            borderColor: 'primary.200'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                <SpeedIcon sx={{ mr: 1 }} />
                Performance de Formularios
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Tiempo de Carga Promedio
                </Typography>
                <Typography variant="h4" color="primary">
                  {metrics.formPerformance.averageLoadTime}s
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Tasa de Éxito
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={metrics.formPerformance.successRate}
                  color={getPerformanceColor(metrics.formPerformance.successRate)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {metrics.formPerformance.successRate}%
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`${metrics.formPerformance.totalSubmissions} envíos`}
                  color="primary"
                  size="small"
                />
                <Chip 
                  label={`${metrics.formPerformance.errorRate}% errores`}
                  color="error"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Métricas de Seguridad */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            border: '1px solid',
            borderColor: 'primary.200'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                <SecurityIcon sx={{ mr: 1 }} />
                Métricas de Seguridad
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {metrics.securityMetrics.sanitizedInputs}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Datos Sanitizados
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">
                      {metrics.securityMetrics.blockedAttacks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ataques Bloqueados
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {metrics.securityMetrics.csrfValidations}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Validaciones CSRF
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {metrics.securityMetrics.permissionChecks}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Verificaciones de Permisos
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Métricas de Cache */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            border: '1px solid',
            borderColor: 'primary.200'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                <CheckIcon sx={{ mr: 1 }} />
                Performance de Cache
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Tasa de Aciertos
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={metrics.cacheMetrics.hitRate}
                  color={getPerformanceColor(metrics.cacheMetrics.hitRate)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {metrics.cacheMetrics.hitRate}%
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6" color="primary">
                    {metrics.cacheMetrics.cacheSize}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Items en Cache
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="h6" color="primary">
                    {metrics.cacheMetrics.memoryUsage}MB
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uso de Memoria
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`${Math.round((metrics.cacheMetrics.cacheSize / metrics.cacheMetrics.maxSize) * 100)}% ocupado`}
                  color="info"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Métricas de Usuarios */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            border: '1px solid',
            borderColor: 'primary.200'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ mr: 1 }} />
                Actividad de Usuarios
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {metrics.userMetrics.activeUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Usuarios Activos
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {metrics.userMetrics.totalUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de Usuarios
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {metrics.userMetrics.formsCompleted}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Formularios Completados
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {metrics.userMetrics.formsInProgress}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      En Progreso
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default MetricsDashboard; 
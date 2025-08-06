import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import './dashboard.css';
const StatsSummary = () => {
  const stats = [
    { title: 'Citas Hoy', value: 8, color: 'primary' },
    { title: 'Pacientes Nuevos', value: 3, color: 'success' },
    { title: 'Tratamientos', value: 5, color: 'info' },
    { title: 'Ingresos', value: '$12,450', color: 'warning' }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={{ bgcolor: (theme) => theme.palette[stat.color].main, color: '#fff', borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ opacity: 0.85 }}>
                {stat.title}
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsSummary;
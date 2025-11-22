import React from 'react';
import { useAuth } from '../Components/context/AuthContext';
import DashboardHeader from '../Components/dashboard/DashboardHeader';
import StatsSummary from '../Components/dashboard/StatsSummary';
import RecentAppointments from '../Components/dashboard/RecentAppointments';
import UpcomingSchedule from '../Components/dashboard/UpcomingSchedule';
import { Grid, Box, Container } from '@mui/material';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box sx={{ mb: 4 }}>
        <DashboardHeader user={user} />
      </Box>
      <StatsSummary />
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid xs={12} md={8}>
          <RecentAppointments />
        </Grid>
        <Grid xs={12} md={4}>
          <UpcomingSchedule />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

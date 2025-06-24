import React from 'react';
import { useAuth } from '../Components/context/AuthContext';
import DashboardHeader from '../Components/dashboard/DashboardHeader';
import StatsSummary from '../Components/dashboard/StatsSummary';
import RecentAppointments from '../Components/dashboard/RecentAppointments';
import UpcomingSchedule from '../Components/dashboard/UpcomingSchedule';

const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="dashboard-container">
      <DashboardHeader user={user} />
      
      <div className="dashboard-content">
        <StatsSummary />
        
        <div className="dashboard-grid">
          <RecentAppointments />
          <UpcomingSchedule />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
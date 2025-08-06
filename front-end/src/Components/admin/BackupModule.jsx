import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Container
} from '@mui/material';
import BackupCreate from './BackupCreate';
import BackupRestore from './BackupRestore';
import BackupJobs from './BackupJobs';

const BackupModule = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Backup de Base de Datos
      </Typography>
      
      <Paper elevation={3} sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                fontSize: '1.1rem',
                fontWeight: 600,
                py: 2
              }
            }}
          >
            <Tab label="Crear Backup" />
            <Tab label="Restaurar Backup" />
            <Tab label="Jobs Automáticos" />
          </Tabs>
        </Box>
        
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && <BackupCreate />}
          {activeTab === 1 && <BackupRestore />}
          {activeTab === 2 && <BackupJobs />}
        </Box>
      </Paper>
    </Container>
  );
};

export default BackupModule; 
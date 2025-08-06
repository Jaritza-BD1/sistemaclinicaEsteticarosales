import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import TopAppBar from '../Components/common/TopAppBar';
import SideBar from '../Components/common/SideBar';

const drawerWidth = 260;

const AppLayout = ({ children }) => {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      <TopAppBar onMenuToggle={handleDrawerToggle} />
      <SideBar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { 
            xs: '100%', 
            sm: `calc(100% - ${drawerWidth}px)` 
          },
          mt: { xs: '56px', sm: '64px' },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar 
          sx={{ 
            display: { xs: 'block', sm: 'none' },
            minHeight: { xs: '56px', sm: '64px' }
          }} 
        />
        
        <Box sx={{
          maxWidth: '100%',
          overflowX: 'auto',
          '& > *': {
            minWidth: { xs: '100%', sm: 'auto' }
          }
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout; 
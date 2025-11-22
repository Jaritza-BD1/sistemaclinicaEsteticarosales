import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar, useTheme } from '@mui/material';
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#ffffff' }}>
      <CssBaseline />
      
      <TopAppBar onMenuToggle={handleDrawerToggle} />
      <SideBar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      
      <Box
        component="main"
        sx={{
          position: 'relative',
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { 
            xs: '100%', 
            sm: `calc(100% - ${drawerWidth}px)` 
          },
          mt: { xs: '48px', sm: '56px' },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          /* Move page-level scrolling to the layout so all pages respect
             TopAppBar and Sidebar margins. Set maxHeight relative to the
             TopAppBar height for each breakpoint and enable vertical scroll. */
          maxHeight: { xs: 'calc(100vh - 48px)', sm: 'calc(100vh - 56px)' },
          overflowY: 'auto',
        }}
      >
        <Toolbar 
          sx={{ 
            display: { xs: 'block', sm: 'none' },
            minHeight: { xs: '48px', sm: '56px' }
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
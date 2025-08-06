import React from 'react';
import { Box, CssBaseline, Container, useTheme, useMediaQuery } from '@mui/material';

const AuthLayout = ({ children }) => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: theme.palette.background.default 
    }}>
      <CssBaseline />
      <Container 
        maxWidth="sm" 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: { xs: 2, sm: 4 }
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default AuthLayout; 
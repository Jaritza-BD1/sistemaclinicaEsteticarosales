// frontend/src/components/common/TopAppBar.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext'; // Asegúrate de la ruta correcta a tu AuthContext

const drawerWidth = 260; // Necesario para desplazar el contenido principal

const TopAppBar = ({ onMenuToggle }) => {
  const { logout, user: fullUser } = useAuth(); // Obtén el usuario y la función de logout

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: 'secondary.main', // Color de tu tema para la barra superior
        zIndex: (theme) => theme.zIndex.drawer + 1, // Asegura que esté por encima del Drawer
      }}
    >
      <Toolbar>
        {/* Icono para alternar el menú lateral (si el sidebar es colapsable en móviles/desktop) */}
        {/* En un diseño de escritorio con sidebar siempre visible, podrías omitir este IconButton */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuToggle} // Esta prop será para que el componente padre pueda abrir/cerrar el sidebar
          sx={{ mr: 2, display: { sm: 'none' } }} // Solo visible en pantallas pequeñas si el sidebar es responsive
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Centro Médico Rosales
        </Typography>

        {/* Información del Usuario y Botón de Cerrar Sesión */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {fullUser && (
            <>
              <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                <AccountCircleIcon />
              </Avatar>
              <Typography variant="subtitle1" color="inherit" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                Hola, {fullUser.username || 'Usuario'}
              </Typography>
            </>
          )}
          <Button color="inherit" onClick={logout}>
            Cerrar Sesión
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopAppBar;
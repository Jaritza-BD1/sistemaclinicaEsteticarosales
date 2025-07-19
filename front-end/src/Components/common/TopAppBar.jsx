// frontend/src/components/common/TopAppBar.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext'; // Asegúrate de la ruta correcta a tu AuthContext
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para la navegación

const drawerWidth = 260; // Necesario para desplazar el contenido principal

const TopAppBar = ({ onMenuToggle }) => {
  const { logout, user: fullUser } = useAuth(); // Obtén el usuario y la función de logout
  const navigate = useNavigate(); // Hook para la navegación programática

  // Estado para controlar el menú del usuario
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleEditProfile = () => {
    handleCloseUserMenu();
    navigate('/perfil/editar'); // Navega a la ruta para editar el perfil
    // Aquí puedes añadir lógica adicional si es necesario
  };

  const handleChangePassword = () => {
    handleCloseUserMenu();
    navigate('/change-password'); // Navega a la ruta para cambiar la contraseña
    // Aquí puedes añadir lógica adicional si es necesario
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout(); // Llama a la función de cerrar sesión de tu AuthContext
  };

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
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'white' }}>
          Centro Médico Rosales
        </Typography>

        {/* Información del Usuario y Menú Desplegable */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {fullUser && (
            <>
              {/* Usamos IconButton para el icono de usuario que abrirá el menú */}
              <IconButton
                sx={{ p: 0 }}
                onClick={handleOpenUserMenu}
                aria-controls={anchorElUser ? 'menu-appbar' : undefined}
                aria-haspopup="true"
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  <AccountCircleIcon />
                </Avatar>
                {/* Mostrar el nombre de usuario solo en pantallas más grandes */}
                <Typography variant="subtitle1" color="inherit" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                  Hola, {fullUser.username || 'Usuario'}
                </Typography>
              </IconButton>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={handleEditProfile}>
                  <Typography textAlign="center">Editar Perfil</Typography>
                </MenuItem>
                <MenuItem onClick={handleChangePassword}>
                  <Typography textAlign="center">Cambiar Contraseña</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Typography textAlign="center">Cerrar Sesión</Typography>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopAppBar;
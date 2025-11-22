// frontend/src/components/common/TopAppBar.jsx
import React from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Box, Avatar, Menu, MenuItem, Button, Dialog,
  DialogTitle, DialogActions, Badge, DialogContent, useTheme, useMediaQuery // Importar useTheme y useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { useAuth } from '../context/AuthContext'; // Asegúrate de la ruta correcta a tu AuthContext
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para la navegación

const drawerWidth = 260; // Necesario para desplazar el contenido principal

const TopAppBar = ({ onMenuToggle }) => {
  const { logout, user: fullUser } = useAuth(); // Obtén el usuario y la función de logout
  const navigate = useNavigate(); // Hook para la navegación programática
  const theme = useTheme(); // Acceder al tema principal de la aplicación
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detecta si la pantalla es pequeña

  // Use the global theme palette for consistent colors across the app
  const pastelThemePalette = theme.palette;


  // Estado para controlar el menú del usuario
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleEditProfile = () => {
    handleCloseUserMenu();
    navigate('/perfil/editar'); // Navega a la ruta para editar el perfil
  };

  const handleChangePassword = () => {
    handleCloseUserMenu();
    navigate('/change-password'); // Navega a la ruta para cambiar la contraseña
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    setLogoutDialogOpen(true);
  };
  const confirmLogout = () => {
    setLogoutDialogOpen(false);
    logout(); // Llama a la función de cerrar sesión de tu AuthContext
  };
  const cancelLogout = () => setLogoutDialogOpen(false);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: pastelThemePalette.secondary.main, // Color de la barra superior (rosa suave)
        zIndex: (t) => t.zIndex.drawer + 1, // Asegura que esté por encima del Drawer
        boxShadow: 3, // Sombra sutil para darle profundidad
      }}
    >
  <Toolbar sx={{ minHeight: { xs: 48, sm: 56 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: { xs: 1, sm: 2 } }}> {/* Flexbox para control de alineación. Altura reducida y padding responsivo */}
        {/* Lado Izquierdo - Botón de menú y otros iconos */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {/* Icono para alternar el menú lateral (más visible y con feedback) */}
          <IconButton
            color="inherit" // Hereda el color del AppBar
            aria-label="open drawer"
            edge="start"
            onClick={onMenuToggle}
            sx={{
              mr: isMobile ? 1 : 1.5, // Margen responsivo reducido
              display: { sm: 'none' }, // Solo visible en pantallas pequeñas
              bgcolor: 'rgba(255,255,255,0.06)', // Fondo sutil para el icono
              borderRadius: 2, // Bordes redondeados
              transition: 'background 0.2s', // Transición suave
              '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' }, // Efecto hover
              color: pastelThemePalette.primary.contrastText, // Color del icono
              p: { xs: 0.75, sm: 1 }, // Padding responsivo reducido
            }}
          >
            <MenuIcon fontSize={isMobile ? "small" : "medium"} /> {/* Tamaño responsivo del icono */}
          </IconButton>

          {/* Iconos de Notificaciones y Ayuda (alineados a la izquierda del título en desktop, o junto al menú en móvil) */}
          <IconButton color="inherit" sx={{ mr: isMobile ? 1 : 1.5, color: pastelThemePalette.primary.contrastText }}>
            <Badge badgeContent={3} color="error"> {/* Badge con el color de error del tema */}
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" sx={{ mr: isMobile ? 0 : 1.5, color: pastelThemePalette.primary.contrastText }} onClick={() => setHelpOpen(true)}>
            <HelpOutlineIcon />
          </IconButton>
        </Box>

        {/* Título de la Aplicación - Flexible para ocupar espacio */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1, // Permite que ocupe el espacio restante
            color: pastelThemePalette.primary.contrastText, // Color del texto
            letterSpacing: 1, // Espaciado entre letras
            textAlign: { xs: 'center', md: 'left' }, // Centrado en móvil, izquierda en desktop
            fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.25rem' }, // Tamaño de fuente responsivo y reducido
            position: { xs: 'absolute', md: 'static' }, // Para centrar en móviles
            left: '50%',
            transform: { xs: 'translateX(-50%)', md: 'none' },
          }}
        >
          Centro Médico Rosales
        </Typography>

        {/* Lado Derecho - Información del Usuario y Menú Desplegable */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, ml: 'auto' }}> {/* ml: 'auto' empuja este Box a la derecha */}
          {fullUser && (
            <>
              <IconButton
                sx={{
                    p: 0,
                    ml: { xs: 0, sm: 0.75 }, // Margen izquierdo responsivo reducido
                    border: '2px solid', // Borde para el avatar/botón
                    borderColor: pastelThemePalette.primary.contrastText, // Color del borde
                    bgcolor: 'rgba(255,255,255,0.06)', // Fondo sutil
                    borderRadius: 2, // Bordes redondeados
                    transition: 'background 0.2s',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
                    display: 'flex', // Asegura que avatar y texto estén en línea
                    alignItems: 'center',
                  }}
                onClick={handleOpenUserMenu}
                aria-controls={anchorElUser ? 'menu-appbar' : undefined}
                aria-haspopup="true"
                color="inherit" // Hereda el color del AppBar
              >
                <Avatar sx={{
                    width: { xs: 28, sm: 32 }, // Tamaño responsivo del avatar reducido
                    height: { xs: 28, sm: 32 },
                    bgcolor: pastelThemePalette.primary.dark, // Color de fondo del avatar
                    color: pastelThemePalette.primary.contrastText, // Color del texto/icono del avatar
                  }}>
                  {fullUser.avatarUrl
                    ? <img src={fullUser.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (fullUser.username ? fullUser.username[0].toUpperCase() : <AccountCircleIcon fontSize="medium" sx={{ color: pastelThemePalette.primary.contrastText }} />)
                  }
                </Avatar>
                  <Typography variant="subtitle1" color="inherit" sx={{ ml: 1, mr: 1, display: { xs: 'none', sm: 'block' }, fontWeight: 500, fontSize: '0.95rem' }}>
                  Hola, {fullUser.username || 'Usuario'}
                </Typography>
              </IconButton>
              <Menu
                sx={{ mt: '45px' }} // Desplazamiento del menú hacia abajo
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                PaperProps={{
                  sx: {
                    minWidth: 200,
                    borderRadius: 2, // Bordes redondeados para el Paper del menú
                    boxShadow: 3, // Sombra para el menú
                    bgcolor: pastelThemePalette.primary.main, // Fondo del menú (rosa claro)
                    color: pastelThemePalette.primary.contrastText, // Color del texto del menú
                  }
                }}
              >
                <MenuItem onClick={handleEditProfile} sx={{ gap: 1, '&:hover': { bgcolor: pastelThemePalette.primary.dark } }}>
                  <EditIcon fontSize="small" sx={{ color: pastelThemePalette.primary.contrastText }} />
                  <Typography textAlign="center" color="inherit">Editar Perfil</Typography>
                </MenuItem>
                <MenuItem onClick={handleChangePassword} sx={{ gap: 1, '&:hover': { bgcolor: pastelThemePalette.primary.dark } }}>
                  <LockResetIcon fontSize="small" sx={{ color: pastelThemePalette.primary.contrastText }} />
                  <Typography textAlign="center" color="inherit">Cambiar Contraseña</Typography>
                </MenuItem>
                <Box sx={{ my: 0.5, borderBottom: '1px solid rgba(255,255,255,0.2)' }} /> {/* Divisor blanco transparente */}
                <MenuItem onClick={handleLogout} sx={{ gap: 1, color: pastelThemePalette.error.main, '&:hover': { bgcolor: pastelThemePalette.primary.dark } }}> {/* Color rojo para cerrar sesión */}
                  <LogoutIcon fontSize="small" />
                  <Typography textAlign="center" color="inherit">Cerrar Sesión</Typography>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
      {/* Modal de ayuda/soporte */}
      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, bgcolor: pastelThemePalette.primary.main, color: pastelThemePalette.primary.contrastText } }}>
        <DialogTitle sx={{ color: pastelThemePalette.secondary.contrastText, fontWeight: 'bold' }}>Soporte y Ayuda</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Necesitas ayuda? Puedes contactar a soporte en <b style={{ color: pastelThemePalette.primary.dark }}>soporte@centromedico.com</b> o llamar al <b style={{ color: pastelThemePalette.primary.dark }}>+504 1234-5678</b>.
          </Typography>
          <Typography variant="body2" color="inherit">
            También puedes consultar la documentación o el manual de usuario desde el menú principal.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)}
            sx={{
              color: pastelThemePalette.primary.contrastText,
              borderColor: pastelThemePalette.primary.contrastText,
              '&:hover': { bgcolor: pastelThemePalette.primary.dark, borderColor: pastelThemePalette.primary.dark },
            }}
            variant="outlined"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Diálogo de confirmación de logout */}
      <Dialog open={logoutDialogOpen} onClose={cancelLogout}
        PaperProps={{ sx: { borderRadius: 3, bgcolor: pastelThemePalette.primary.main, color: pastelThemePalette.primary.contrastText } }}>
        <DialogTitle sx={{ color: pastelThemePalette.error.main, fontWeight: 'bold' }}>¿Seguro que deseas cerrar sesión?</DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="inherit">
            Tu sesión actual se cerrará. ¿Estás seguro de que quieres continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelLogout}
            sx={{
              color: pastelThemePalette.primary.contrastText,
              borderColor: pastelThemePalette.primary.contrastText,
              '&:hover': { bgcolor: pastelThemePalette.primary.dark, borderColor: pastelThemePalette.primary.dark },
            }}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button onClick={confirmLogout}
            sx={{
              bgcolor: pastelThemePalette.error.main,
              color: pastelThemePalette.error.contrastText,
              '&:hover': { bgcolor: '#A0202F' }, // Un rojo un poco más oscuro
            }}
            variant="contained"
          >
            Cerrar Sesión
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default TopAppBar;

// frontend/src/Components/common/SideBar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Drawer,
  Toolbar,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Avatar,
  Typography,
  useTheme, // Importar useTheme para acceder a los colores del tema
} from '@mui/material';
import { useAuth } from '../context/AuthContext'; // Asegúrate de que la ruta sea correcta
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; // Para Citas y un posible Calendario general
import PeopleIcon from '@mui/icons-material/People'; // Para Pacientes y Gestionar Usuarios
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'; // Para Médicos
import AssignmentIcon from '@mui/icons-material/Assignment'; // Para Exámenes, Bitácora
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy'; // Para Farmacia
import SettingsIcon from '@mui/icons-material/Settings'; // Para Configuración y Mantenimiento
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Para el avatar del usuario
import PersonAddIcon from '@mui/icons-material/PersonAdd'; // Para Registrar Usuario/Médico/Paciente
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add'; // Para "Agendar Cita", "Crear Examen Nuevo"
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'; // Para "Lista de X"
import HistoryIcon from '@mui/icons-material/History'; // Para Bitácora
import HealingIcon from '@mui/icons-material/Healing'; // Para Tratamiento (o icono más adecuado)
import BuildIcon from '@mui/icons-material/Build'; // Para Mantenimiento (o icono más adecuado)


const drawerWidth = 260;

const SideBar = ({ mobileOpen, handleDrawerToggle }) => {
  const { user: fullUser, isAdmin } = useAuth();
  const { pathname } = useLocation();
  const theme = useTheme(); // Acceder al tema para colores

  // Estados para controlar la expansión/colapso de los submenús
  const [openCitas, setOpenCitas] = React.useState(false);
  const [openMedicos, setOpenMedicos] = React.useState(false);
  const [openPacientes, setOpenPacientes] = React.useState(false);
  const [openExamenes, setOpenExamenes] = React.useState(false);
  const [openTratamiento, setOpenTratamiento] = React.useState(false);
  const [openUsuarios, setOpenUsuarios] = React.useState(false);
  const [openConfig, setOpenConfig] = React.useState(false);
  // Nuevos estados para Mantenimiento y Tratamiento
  const [openMantenimiento, setOpenMantenimiento] = React.useState(false);
  


  // Funciones para alternar la visibilidad de los submenús
  const toggleCitas = () => setOpenCitas(!openCitas);
  const toggleMedicos = () => setOpenMedicos(!openMedicos);
  const togglePacientes = () => setOpenPacientes(!openPacientes);
  const toggleExamenes = () => setOpenExamenes(!openExamenes);
  const toggleTratamiento = () => setOpenTratamiento(!openTratamiento);
  const toggleUsuarios = () => setOpenUsuarios(!openUsuarios);
  const toggleConfig = () => setOpenConfig(!openConfig);
  // Nuevas funciones para Mantenimiento y Tratamiento
  const toggleMantenimiento = () => setOpenMantenimiento(!openMantenimiento);
 


  // Contenido del Drawer (el mismo para la versión móvil y permanente)
  const drawer = (
    <div>
      <Toolbar sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', // Centra el contenido en el toolbar
          p: 2,
          bgcolor: theme.palette.secondary.main, // Fondo del logo/título en sidebar
          color: theme.palette.primary.contrastText // Color del texto
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 1, bgcolor: theme.palette.primary.main }}>
            <DashboardIcon /> {/* O un icono de logo */}
          </Avatar>
          <Typography variant="h6" noWrap component="div">
            Centro Médico
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

      {/* Información del Usuario */}
      {fullUser && (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', color: theme.palette.primary.contrastText }}>
          <Avatar sx={{ width: 56, height: 56, mb: 1, bgcolor: theme.palette.secondary.main }}>
            <AccountCircleIcon fontSize="large" />
          </Avatar>
          <Typography variant="subtitle1" color="inherit">
            {fullUser.username || 'Usuario'}
          </Typography>
          <Typography variant="body2" color="inherit">
            {fullUser.role || 'Rol Desconocido'}
          </Typography>
        </Box>
      )}
      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

      <List sx={{ color: theme.palette.primary.contrastText }}> {/* Aplica color de texto a toda la lista */}
        {/* Inicio / Dashboard */}
        <ListItemButton
          component={NavLink}
          to="/dashboard"
          selected={pathname === '/dashboard'}
          sx={{ mb: 0.5, '&.active': { bgcolor: theme.palette.primary.dark } }} // Estilo para el item activo
          onClick={handleDrawerToggle} // Cierra el drawer móvil al hacer clic
        >
          <ListItemIcon>
            <DashboardIcon sx={{ color: 'inherit' }} /> {/* Hereda el color del padre */}
          </ListItemIcon>
          <ListItemText primary="Inicio" />
        </ListItemButton>

        {/* Citas */}
        <ListItemButton onClick={toggleCitas} sx={{ mb: 0.5 }}>
          <ListItemIcon>
            <CalendarTodayIcon sx={{ color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary="Citas" />
          {openCitas ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
        </ListItemButton>
        <Collapse in={openCitas} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              component={NavLink}
              to="/citas/agendar"
              selected={pathname === '/citas/agendar'}
              sx={{ pl: 4, mb: 0.5, '&.active': { bgcolor: theme.palette.primary.dark } }}
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>
                <AddIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Agendar Cita" />
            </ListItemButton>
            <ListItemButton
              component={NavLink}
              to="/citas/ver"
              selected={pathname === '/citas/ver'}
              sx={{ pl: 4, '&.active': { bgcolor: theme.palette.primary.dark } }}
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>
                <FormatListBulletedIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Ver Citas" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Médicos */}
        <ListItemButton onClick={toggleMedicos} sx={{ mb: 0.5 }}>
          <ListItemIcon>
            <MedicalServicesIcon sx={{ color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary="Médicos" />
          {openMedicos ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
        </ListItemButton>
        <Collapse in={openMedicos} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              component={NavLink}
              to="/medicos/registrar"
              selected={pathname === '/medicos/registrar'}
              sx={{ pl: 4, mb: 0.5, '&.active': { bgcolor: theme.palette.primary.dark } }}
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>
                <PersonAddIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Registrar Médico" />
            </ListItemButton>
            <ListItemButton
              component={NavLink}
              to="/medicos/lista"
              selected={pathname === '/medicos/lista'}
              sx={{ pl: 4, '&.active': { bgcolor: theme.palette.primary.dark } }}
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>
                <FormatListBulletedIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Lista de Médicos" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Pacientes */}
        <ListItemButton onClick={togglePacientes} sx={{ mb: 0.5 }}>
          <ListItemIcon>
            <PeopleIcon sx={{ color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary="Pacientes" />
          {openPacientes ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
        </ListItemButton>
        <Collapse in={openPacientes} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              component={NavLink}
              to="/pacientes/registrar"
              selected={pathname === '/pacientes/registrar'}
              sx={{ pl: 4, mb: 0.5, '&.active': { bgcolor: theme.palette.primary.dark } }}
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>
                <PersonAddIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Registrar Paciente" />
            </ListItemButton>
            <ListItemButton
              component={NavLink}
              to="/pacientes/lista"
              selected={pathname === '/pacientes/lista'}
              sx={{ pl: 4, '&.active': { bgcolor: theme.palette.primary.dark } }}
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>
                <FormatListBulletedIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Lista de Pacientes" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Exámenes */}
        <ListItemButton onClick={toggleExamenes} sx={{ mb: 0.5 }}>
          <ListItemIcon>
            <AssignmentIcon sx={{ color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary="Exámenes" />
          {openExamenes ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
        </ListItemButton>
        <Collapse in={openExamenes} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              component={NavLink}
              to="/examenes/crear"
              selected={pathname === '/examenes/crear'}
              sx={{ pl: 4, mb: 0.5, '&.active': { bgcolor: theme.palette.primary.dark } }}
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>
                <AddIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Crear Examen Nuevo" />
            </ListItemButton>
            <ListItemButton
              component={NavLink}
              to="/examenes/lista"
              selected={pathname === '/examenes/lista'}
              sx={{ pl: 4, mb: 0.5, '&.active': { bgcolor: theme.palette.primary.dark } }}
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>
                <FormatListBulletedIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Lista de Exámenes" />
            </ListItemButton>
            <ListItemButton
              component={NavLink}
              to="/examenes/resultados"
              selected={pathname === '/examenes/resultados'}
              sx={{ pl: 4, '&.active': { bgcolor: 'primary.dark' } }}
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>
                <FormatListBulletedIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Resultados Exámenes" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Farmacia */}
        <ListItemButton
          component={NavLink}
          to="/farmacia"
          selected={pathname === '/farmacia'}
          sx={{ mb: 0.5, '&.active': { bgcolor: theme.palette.primary.dark } }}
          onClick={handleDrawerToggle}
        >
          <ListItemIcon>
            <LocalPharmacyIcon sx={{ color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary="Farmacia" />
        </ListItemButton>

        {/* NUEVO: Tratamientos */}
        <ListItemButton onClick={toggleTratamiento} sx={{ mb: 0.5 }}>
          <ListItemIcon>
            <HealingIcon sx={{ color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary="Tratamientos" />
          {openTratamiento ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
        </ListItemButton>
        <Collapse in={openTratamiento} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              component={NavLink}
              to="/tratamientos/registrar" // Asume esta ruta
              selected={pathname === '/tratamientos/registrar'}
              sx={{ pl: 4, mb: 0.5, '&.active': { bgcolor: theme.palette.primary.dark } }}
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>
                <AddIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Registrar Tratamiento" />
            </ListItemButton>
            <ListItemButton
              component={NavLink}
              to="/tratamientos/lista" // Asume esta ruta
              selected={pathname === '/tratamientos/lista'}
              sx={{ pl: 4, '&.active': { bgcolor: theme.palette.primary.dark } }}
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>
                <FormatListBulletedIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Lista de Tratamientos" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* NUEVO: Calendario General (si es diferente a "Citas") */}
        {/* Si "Citas" ya cubre tu necesidad de calendario, puedes omitir este.
            Si es un calendario más general para recursos, disponibilidad, etc., úsalo. */}
        <ListItemButton
          component={NavLink}
          to="/calendario" // Asume esta ruta
          selected={pathname === '/calendario'}
          sx={{ mb: 0.5, '&.active': { bgcolor: theme.palette.primary.dark } }}
          onClick={handleDrawerToggle}
        >
          <ListItemIcon>
            <CalendarTodayIcon sx={{ color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary="Calendario" />
        </ListItemButton>


        {/* Sección de Administración (visible solo para administradores) */}
        {isAdmin && (
          <>
            <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', my: 1 }} />
            <Typography variant="overline" sx={{ ml: 2, mt: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
              Administración
            </Typography>

            {/* Usuarios (ya existe, pero reconfirmo la estructura) */}
            <ListItemButton onClick={toggleUsuarios} sx={{ mb: 0.5 }}>
              <ListItemIcon>
                <PeopleIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Usuarios" />
              {openUsuarios ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
            </ListItemButton>
            <Collapse in={openUsuarios} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  component={NavLink}
                  to="/usuarios/registrar"
                  selected={pathname === '/usuarios/registrar'}
                  sx={{ pl: 4, mb: 0.5, '&.active': { bgcolor: theme.palette.primary.dark } }}
                  onClick={handleDrawerToggle}
                >
                  <ListItemIcon>
                    <PersonAddIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Registrar Usuario" />
                </ListItemButton>
                <ListItemButton
                  component={NavLink}
                  to="/usuarios/gestionar"
                  selected={pathname === '/usuarios/gestionar'}
                  sx={{ pl: 4, '&.active': { bgcolor: theme.palette.primary.dark } }}
                  onClick={handleDrawerToggle}
                >
                  <ListItemIcon>
                    <PeopleIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Gestionar Usuarios" />
                </ListItemButton>
                {/* Enlace a Bitácora del Sistema */}
                <ListItemButton
                  component={NavLink}
                  to="/bitacora"
                  selected={pathname === '/bitacora'}
                  sx={{ pl: 4, '&.active': { bgcolor: theme.palette.primary.dark } }}
                  onClick={handleDrawerToggle}
                >
                  <ListItemIcon>
                    <HistoryIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Bitácora del Sistema" />
                </ListItemButton>
              </List>
            </Collapse>

            {/* NUEVO: Mantenimiento */}
            <ListItemButton onClick={toggleMantenimiento} sx={{ mb: 0.5 }}>
              <ListItemIcon>
                <BuildIcon sx={{ color: 'inherit' }} /> {/* Icono para Mantenimiento */}
              </ListItemIcon>
              <ListItemText primary="Mantenimiento" />
              {openMantenimiento ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
            </ListItemButton>
            <Collapse in={openMantenimiento} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  component={NavLink}
                  to="/mantenimiento/sistema" // Asume esta ruta
                  selected={pathname === '/mantenimiento/sistema'}
                  sx={{ pl: 4, mb: 0.5, '&.active': { bgcolor: theme.palette.primary.dark } }}
                  onClick={handleDrawerToggle}
                >
                  <ListItemIcon>
                    <SettingsIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Sistema" />
                </ListItemButton>
                <ListItemButton
                  component={NavLink}
                  to="/mantenimiento/catalogos" // Asume esta ruta
                  selected={pathname === '/mantenimiento/catalogos'}
                  sx={{ pl: 4, '&.active': { bgcolor: theme.palette.primary.dark } }}
                  onClick={handleDrawerToggle}
                >
                  <ListItemIcon>
                    <FormatListBulletedIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Catálogos" />
                </ListItemButton>
              </List>
            </Collapse>


            {/* Configuración (ya existe) */}
            <ListItemButton onClick={toggleConfig} sx={{ mb: 0.5 }}>
              <ListItemIcon>
                <SettingsIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Configuración" />
              {openConfig ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
            </ListItemButton>
            <Collapse in={openConfig} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  component={NavLink}
                  to="/configuracion/parametros"
                  selected={pathname === '/configuracion/parametros'}
                  sx={{ pl: 4, mb: 0.5, '&.active': { bgcolor: theme.palette.primary.dark } }}
                  onClick={handleDrawerToggle}
                >
                  <ListItemIcon>
                    <SettingsIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Parámetros del Sistema" />
                </ListItemButton>
              </List>
            </Collapse>
          </>
        )}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Drawer para pantallas pequeñas (temporal) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Mejor rendimiento en móviles.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText },
        }}
      >
        {drawer}
      </Drawer>
      {/* Drawer para pantallas grandes (permanente) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default SideBar;
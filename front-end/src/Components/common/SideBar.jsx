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
  useTheme,
  useMediaQuery, // Importar useMediaQuery para responsividad
} from '@mui/material';
import { useAuth } from '../context/AuthContext'; // Asegúrate de que la ruta sea correcta

// Iconos de Material-UI
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';//Para calendario y Citas
import PeopleIcon from '@mui/icons-material/People'; // Para Pacientes y Usuarios
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'; // Para Médicos
import AssignmentIcon from '@mui/icons-material/Assignment'; // Para Exámenes
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy'; // Para Farmacia
import SettingsIcon from '@mui/icons-material/Settings'; // Para Configuración
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Para el avatar de usuario
import PersonAddIcon from '@mui/icons-material/PersonAdd'; // Para Registrar
import ExpandLessIcon from '@mui/icons-material/ExpandLess'; // Icono para colapsar
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Icono para expandir
import AddIcon from '@mui/icons-material/Add'; // Para añadir
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'; // Para listas
import HistoryIcon from '@mui/icons-material/History'; // Para Bitácora
import HealingIcon from '@mui/icons-material/Healing'; // Para Tratamiento
import BuildIcon from '@mui/icons-material/Build'; // Para Mantenimiento
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; // Para Backup
import BugReportIcon from '@mui/icons-material/BugReport'; // Para Errores
import LockOpenIcon from '@mui/icons-material/LockOpen'; // Para Permisos (ejemplo)


const drawerWidth = 260; // Ancho del Sidebar

const SideBar = ({ mobileOpen, handleDrawerToggle }) => {
  const { user: fullUser, isAdmin } = useAuth();
  const { pathname } = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detecta si la pantalla es pequeña

  // Define la paleta de colores rosa pastel suave directamente en el componente
  // Idealmente, esto debería estar en tu `src/theme.js`
  const pastelTheme = useTheme(); // Usar un tema temporal para colores aquí
  pastelTheme.palette.primary.main = '#FCE4EC'; // Un rosa muy claro para el fondo principal del sidebar
  pastelTheme.palette.primary.dark = '#F8BBD0'; // Un rosa ligeramente más profundo para el estado activo del item
  pastelTheme.palette.secondary.main = '#E0B0C8'; // Un rosa suave y empolvado para la barra superior/encabezado del sidebar
  pastelTheme.palette.primary.contrastText = '#4A235A'; // Un morado oscuro para el texto, asegurando legibilidad


  // Estados para controlar la expansión/colapso de los submenús
  const [openCitas, setOpenCitas] = React.useState(false);
  const [openMedicos, setOpenMedicos] = React.useState(false);
  const [openPacientes, setOpenPacientes] = React.useState(false);
  const [openExamenes, setOpenExamenes] = React.useState(false);
  const [openTratamiento, setOpenTratamiento] = React.useState(false);
  const [openAdministracion, setOpenAdministracion] = React.useState(false); // Nuevo menú principal de Administración
  const [openBackup, setOpenBackup] = React.useState(false); // Sub-submenú de Backup
  const [openBitacoraSub, setOpenBitacoraSub] = React.useState(false); // Sub-submenú de Bitácora
  const [openUsuariosSub, setOpenUsuariosSub] = React.useState(false); // Sub-submenú de Usuarios
  const [openMantenimientoSub, setOpenMantenimientoSub] = React.useState(false); // Sub-submenú de Mantenimiento
  const [openErroresSub, setOpenErroresSub] = React.useState(false); // Sub-submenú de Errores
  const [openConfigSub, setOpenConfigSub] = React.useState(false); // Sub-submenú de Configuración


  // Funciones para alternar la visibilidad de los submenús
  const toggleCitas = () => setOpenCitas(!openCitas);
  const toggleMedicos = () => setOpenMedicos(!openMedicos);
  const togglePacientes = () => setOpenPacientes(!openPacientes);
  const toggleExamenes = () => setOpenExamenes(!openExamenes);
  const toggleTratamiento = () => setOpenTratamiento(!openTratamiento);
  const toggleAdministracion = () => setOpenAdministracion(!openAdministracion);
  const toggleBackup = () => setOpenBackup(!openBackup);
  const toggleBitacoraSub = () => setOpenBitacoraSub(!openBitacoraSub);
  const toggleUsuariosSub = () => setOpenUsuariosSub(!openUsuariosSub);
  const toggleMantenimientoSub = () => setOpenMantenimientoSub(!openMantenimientoSub);
  const toggleErroresSub = () => setOpenErroresSub(!openErroresSub);
  const toggleConfigSub = () => setOpenConfigSub(!openConfigSub);


  // Función para cerrar el drawer en móviles
  const handleItemClick = () => {
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  // Contenido del Drawer (el mismo para la versión móvil y permanente)
  const drawer = (
    <div>
      <Toolbar sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', // Centra el contenido en el toolbar
          p: 2,
          bgcolor: pastelTheme.palette.secondary.main, // Fondo del logo/título en sidebar
          color: pastelTheme.palette.primary.contrastText // Color del texto
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 1, bgcolor: pastelTheme.palette.primary.dark }}>
            <DashboardIcon sx={{ color: pastelTheme.palette.primary.contrastText }} /> {/* Icono de logo */}
          </Avatar>
          <Typography variant="h6" noWrap component="div">
            Centro Médico
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

      {/* Información del Usuario */}
      {fullUser && (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', color: pastelTheme.palette.primary.contrastText }}>
          <Avatar sx={{ width: 56, height: 56, mb: 1, bgcolor: pastelTheme.palette.secondary.main }}>
            <AccountCircleIcon fontSize="large" sx={{ color: pastelTheme.palette.primary.contrastText }} />
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

      <List sx={{ color: pastelTheme.palette.primary.contrastText }}> {/* Aplica color de texto a toda la lista */}
        {/* Inicio / Dashboard */}
        <ListItemButton
          component={NavLink}
          to="/dashboard"
          selected={pathname === '/dashboard'}
          sx={{ mb: 0.5, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }} // Estilo para el item activo
          onClick={handleItemClick}
        >
          <ListItemIcon>
            <DashboardIcon sx={{ color: 'inherit' }} />
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
              sx={{ pl: 4, mb: 0.5, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
              onClick={handleItemClick}
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
              sx={{ pl: 4, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
              onClick={handleItemClick}
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
              sx={{ pl: 4, mb: 0.5, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
              onClick={handleItemClick}
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
              sx={{ pl: 4, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
              onClick={handleItemClick}
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
              sx={{ pl: 4, mb: 0.5, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
              onClick={handleItemClick}
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
              sx={{ pl: 4, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
              onClick={handleItemClick}
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
              sx={{ pl: 4, mb: 0.5, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
              onClick={handleItemClick}
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
              sx={{ pl: 4, mb: 0.5, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
              onClick={handleItemClick}
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
              sx={{ pl: 4, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
              onClick={handleItemClick}
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
          sx={{ mb: 0.5, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
          onClick={handleItemClick}
        >
          <ListItemIcon>
            <LocalPharmacyIcon sx={{ color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary="Farmacia" />
        </ListItemButton>

        {/* Tratamientos */}
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
              to="/tratamientos/registrar"
              selected={pathname === '/tratamientos/registrar'}
              sx={{ pl: 4, mb: 0.5, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
              onClick={handleItemClick}
            >
              <ListItemIcon>
                <AddIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Registrar Tratamiento" />
            </ListItemButton>
            <ListItemButton
              component={NavLink}
              to="/tratamientos/lista"
              selected={pathname === '/tratamientos/lista'}
              sx={{ pl: 4, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
              onClick={handleItemClick}
            >
              <ListItemIcon>
                <FormatListBulletedIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Lista de Tratamientos" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Calendario General */}
        <ListItemButton
          component={NavLink}
          to="/calendario"
          selected={pathname === '/calendario'}
          sx={{ mb: 0.5, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
          onClick={handleItemClick}
        >
          <ListItemIcon>
            <CalendarTodayIcon sx={{ color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary="Calendario" />
        </ListItemButton>

        {/* Sección de ADMINISTRACIÓN (visible solo para administradores) */}
        {isAdmin && (
          <>
            <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', my: 1 }} />
            <ListItemButton onClick={toggleAdministracion} sx={{ mb: 0.5 }}>
              <ListItemIcon>
                <SettingsIcon sx={{ color: 'inherit' }} /> {/* Icono principal para Administración */}
              </ListItemIcon>
              <ListItemText primary="Administración" />
              {openAdministracion ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
            </ListItemButton>
            <Collapse in={openAdministracion} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>

                {/* Sub-submenú: Backup */}
                <ListItemButton onClick={toggleBackup} sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <CloudUploadIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Backup" />
                  {openBackup ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
                </ListItemButton>
                <Collapse in={openBackup} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      component={NavLink}
                      to="/admin/backup/crear" // Asume esta ruta
                      selected={pathname === '/admin/backup/crear'}
                      sx={{ pl: 8, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
                      onClick={handleItemClick}
                    >
                      <ListItemText primary="Crear Backup" />
                    </ListItemButton>
                    <ListItemButton
                      component={NavLink}
                      to="/admin/backup/restaurar" // Asume esta ruta
                      selected={pathname === '/admin/backup/restaurar'}
                      sx={{ pl: 8, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
                      onClick={handleItemClick}
                    >
                      <ListItemText primary="Restaurar Backup" />
                    </ListItemButton>
                  </List>
                </Collapse>

                {/* Sub-submenú: Bitácora */}
                <ListItemButton onClick={toggleBitacoraSub} sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <HistoryIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Bitácora" />
                  {openBitacoraSub ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
                </ListItemButton>
                <Collapse in={openBitacoraSub} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      component={NavLink}
                      to="/bitacora" // Ruta principal de bitácora
                      selected={pathname === '/bitacora'}
                      sx={{ pl: 8, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
                      onClick={handleItemClick}
                    >
                      <ListItemText primary="Ver Bitácora" />
                    </ListItemButton>
                    {/* Puedes añadir más ítems específicos de bitácora si los tienes */}
                  </List>
                </Collapse>

                {/* Sub-submenú: Usuarios */}
                <ListItemButton onClick={toggleUsuariosSub} sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <PeopleIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Usuarios" />
                  {openUsuariosSub ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
                </ListItemButton>
                <Collapse in={openUsuariosSub} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      component={NavLink}
                      to="/usuarios/lista"
                      selected={pathname === '/usuarios/lista'}
                      sx={{ pl: 8, mb: 0.5, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
                      onClick={handleItemClick}
                    >
                      <ListItemText primary="Gestionar Usuarios" />
                    </ListItemButton>
                    <ListItemButton
                      component={NavLink}
                      to="/usuarios/gestionar"
                      selected={pathname === '/usuarios/gestionar'}
                      sx={{ pl: 8, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
                      onClick={handleItemClick}
                    >
                      <ListItemText primary="Registrar Usuario" />
                    </ListItemButton>
                  </List>
                </Collapse>

                {/* Sub-submenú: Mantenimiento */}
                <ListItemButton onClick={toggleMantenimientoSub} sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <BuildIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Mantenimiento" />
                  {openMantenimientoSub ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
                </ListItemButton>
                <Collapse in={openMantenimientoSub} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      component={NavLink}
                      to="/mantenimiento/sistema"
                      selected={pathname === '/mantenimiento/sistema'}
                      sx={{ pl: 8, mb: 0.5, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
                      onClick={handleItemClick}
                    >
                      <ListItemText primary="Sistema" />
                    </ListItemButton>
                    <ListItemButton
                      component={NavLink}
                      to="/mantenimiento/catalogos"
                      selected={pathname === '/mantenimiento/catalogos'}
                      sx={{ pl: 8, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
                      onClick={handleItemClick}
                    >
                      <ListItemText primary="Catálogos" />
                    </ListItemButton>
                  </List>
                </Collapse>
                
                {/* Sub-submenú: Errores */}
                <ListItemButton onClick={toggleErroresSub} sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <BugReportIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Errores" />
                  {openErroresSub ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
                </ListItemButton>
                <Collapse in={openErroresSub} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      component={NavLink}
                      to="/admin/errores/ingresar" // Asume esta ruta
                      selected={pathname === '/admin/errores/ingresar'}
                      sx={{ pl: 8, mb: 0.5, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
                      onClick={handleItemClick}
                    >
                      <ListItemText primary="Registrar Error" />
                    </ListItemButton>
                    <ListItemButton
                      component={NavLink}
                      to="/admin/errores/lista" // Asume esta ruta
                      selected={pathname === '/admin/errores/lista'}
                      sx={{ pl: 8, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
                      onClick={handleItemClick}
                    >
                      <ListItemText primary="Ver Errores" />
                    </ListItemButton>
                  </List>
                </Collapse>

                {/* Sub-submenú: Configuración (movida a Administración) */}
                <ListItemButton onClick={toggleConfigSub} sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <SettingsIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Configuración" />
                  {openConfigSub ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
                </ListItemButton>
                <Collapse in={openConfigSub} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      component={NavLink}
                      to="/configuracion/parametros"
                      selected={pathname === '/configuracion/parametros'}
                      sx={{ pl: 8, mb: 0.5, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
                      onClick={handleItemClick}
                    >
                      <ListItemText primary="Parámetros del Sistema" />
                    </ListItemButton>
                  </List>
                </Collapse>

                {/* Puedes añadir más ítems específicos de administración aquí */}
                <ListItemButton
                      component={NavLink}
                      to="/admin/permisos" // Asume esta ruta
                      selected={pathname === '/admin/permisos'}
                      sx={{ pl: 4, '&.active, &.Mui-selected': { bgcolor: pastelTheme.palette.primary.dark } }}
                      onClick={handleItemClick}
                    >
                      <ListItemIcon>
                        <LockOpenIcon sx={{ color: 'inherit' }} />
                      </ListItemIcon>
                      <ListItemText primary="Roles y Permisos" />
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
      aria-label="main navigation folders"
    >
      {/* Drawer para pantallas pequeñas (temporal y colapsable) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Mejor rendimiento en móviles.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: pastelTheme.palette.primary.main, // Color de fondo del drawer
            color: pastelTheme.palette.primary.contrastText, // Color del texto del drawer
          },
        }}
      >
        {drawer}
      </Drawer>
      {/* Drawer para pantallas grandes (permanente y estático) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: pastelTheme.palette.primary.main,
            color: pastelTheme.palette.primary.contrastText,
          },
        }}
        open // Siempre abierto en desktop
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default SideBar;

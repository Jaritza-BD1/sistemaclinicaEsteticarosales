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
  useMediaQuery,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import maintenanceService from '../../services/maintenanceService';

// Iconos de Material-UI
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryIcon from '@mui/icons-material/History';
import HealingIcon from '@mui/icons-material/Healing';
import BuildIcon from '@mui/icons-material/Build';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BugReportIcon from '@mui/icons-material/BugReport';
import LockOpenIcon from '@mui/icons-material/LockOpen';
// EventIcon removed because it was unused

const drawerWidth = 260;

const SideBar = ({ mobileOpen, handleDrawerToggle }) => {
  const { user: fullUser, isAdmin } = useAuth();
  const { pathname } = useLocation();
  const theme = useTheme();
  const palette = theme.palette;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [openAdministracion, setOpenAdministracion] = React.useState(false);
  // Eliminado el submenu de Backup: ahora Backup es una sola ruta
  const [openBitacoraSub, setOpenBitacoraSub] = React.useState(false);
  const [openUsuariosSub, setOpenUsuariosSub] = React.useState(false);
  const [openMantenimientoSub, setOpenMantenimientoSub] = React.useState(false);
  const [openMantenimientoSistema, setOpenMantenimientoSistema] = React.useState(false);
  const [openMantenimientoCatalogos, setOpenMantenimientoCatalogos] = React.useState(false);
  const [openConfigSub, setOpenConfigSub] = React.useState(false);

  const toggleAdministracion = () => setOpenAdministracion(!openAdministracion);
  // const toggleBackup = () => setOpenBackup(!openBackup);
  const toggleBitacoraSub = () => setOpenBitacoraSub(!openBitacoraSub);
  const toggleUsuariosSub = () => setOpenUsuariosSub(!openUsuariosSub);
  const toggleMantenimientoSub = () => setOpenMantenimientoSub(!openMantenimientoSub);
  const toggleMantenimientoSistema = () => setOpenMantenimientoSistema(!openMantenimientoSistema);
  const toggleMantenimientoCatalogos = () => setOpenMantenimientoCatalogos(!openMantenimientoCatalogos);
  const toggleConfigSub = () => setOpenConfigSub(!openConfigSub);

  const handleItemClick = () => {
    if (isMobile) handleDrawerToggle();
  };

  // Route matcher: case-insensitive, trims trailing slashes.
  const normalizePath = (p = '') => p.toLowerCase().replace(/\/+$/, '');
  const matchPath = (target, exact = false) => {
    const current = normalizePath(pathname || '');
    const t = normalizePath(target || '');
    return exact ? current === t : current.startsWith(t);
  };

  // Defaults (fallback if backend not available)
  const defaultSistemas = [
    'User', 'Bitacora', 'BackupCode', 'PasswordHistory',
    'Appointment', 'Treatment', 'Exam', 'Doctor', 'Patient'
  ];

  const defaultCatalogos = [
    'Rol', 'Permiso', 'Objeto', 'EstadoCita', 'TipoCita', 'EstadoRecordatorio', 'Producto', 'TipoMedico', 'Especialidad'
  ];

  const [sistemasModels, setSistemasModels] = React.useState([]);
  const [catalogosModels, setCatalogosModels] = React.useState([]);

  const labelMap = {
    Rol: 'Roles',
    Permiso: 'Permisos',
    Objeto: 'Objetos',
    EstadoCita: 'Estados de Cita',
    TipoCita: 'Tipos de Cita',
    EstadoRecordatorio: 'Estados de Recordatorio',
    Producto: 'Productos',
    TipoMedico: 'Tipo de médico',
    Especialidad: 'Especialidades',
    BackupCode: 'Códigos Backup',
    PasswordHistory: 'Historial de Contraseñas',
    Recordatorio: 'Recordatorios',
    Token: 'Tokens'
  };
  const labelMapSystems = {
    User: 'Usuarios',
    Doctor: 'Médicos',
    Patient: 'Pacientes',
    Appointment: 'Citas',
    Exam: 'Exámenes',
    Producto: 'Productos',
    Treatment: 'Tratamientos'
  };

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await maintenanceService.getModels();
        // Expect shape: { sistemas: [...], catalogos: [...] }
        if (!mounted) return;
        if (data) {
          setSistemasModels(Array.isArray(data.sistemas) ? data.sistemas : (data.sistemas || []));
          setCatalogosModels(Array.isArray(data.catalogos) ? data.catalogos : (data.catalogos || []));
        }
      } catch (err) {
        // fallback: no-op (we'll use defaults)
        // console.warn('No se pudo obtener la lista de modelos de mantenimiento:', err);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const drawer = (
    <div>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          bgcolor: palette.secondary.main,
          color: palette.primary.contrastText,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 1, bgcolor: palette.primary.dark }}>
            <DashboardIcon sx={{ color: palette.primary.contrastText }} />
          </Avatar>
          <Typography variant="h6" noWrap component="div">
            Centro Médico
          </Typography>
        </Box>
      </Toolbar>

      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

      {fullUser && (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', color: palette.primary.contrastText }}>
          <Avatar sx={{ width: 56, height: 56, mb: 1, bgcolor: palette.secondary.main }}>
            <AccountCircleIcon fontSize="large" sx={{ color: palette.primary.contrastText }} />
          </Avatar>
          <Typography variant="subtitle1" color="inherit">
            {fullUser.atr_nombre_usuario || fullUser.atr_usuario || fullUser.username || 'Usuario'}
          </Typography>
          <Typography variant="body2" color="inherit">
            {fullUser.atr_descripcion_rol || (fullUser.atr_id_rol ? `Rol ${fullUser.atr_id_rol}` : (fullUser.role || 'Rol Desconocido'))}
          </Typography>
        </Box>
      )}

      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

      <List sx={{ color: palette.primary.contrastText }}>
  <ListItemButton component={NavLink} to="/dashboard" selected={matchPath('/dashboard')} sx={{ mb: 0.5, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
          <ListItemIcon>
            <DashboardIcon sx={{ color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary="Inicio" />
        </ListItemButton>

        <ListItemButton component={NavLink} to="/citas" selected={matchPath('/citas')} sx={{ mb: 0.5, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
          <ListItemIcon>
            <CalendarTodayIcon sx={{ color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary="Citas" />
        </ListItemButton>

  <ListItemButton component={NavLink} to="/medicos/lista" selected={matchPath('/medicos')} sx={{ mb: 0.5, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
          <ListItemIcon>
            <MedicalServicesIcon sx={{ color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary="Médicos" />
        </ListItemButton>

  <ListItemButton component={NavLink} to="/pacientes/lista" selected={matchPath('/pacientes')} sx={{ mb: 0.5, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
          <ListItemIcon>
            <PeopleIcon sx={{ color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary="Pacientes" />
        </ListItemButton>

  <ListItemButton component={NavLink} to="/examenes/lista" selected={matchPath('/examenes')} sx={{ mb: 0.5, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
          <ListItemIcon>
            <AssignmentIcon sx={{ color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary="Exámenes" />
        </ListItemButton>

  <ListItemButton component={NavLink} to="/farmacia" selected={matchPath('/farmacia')} sx={{ mb: 0.5, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
          <ListItemIcon>
            <LocalPharmacyIcon sx={{ color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary="Farmacia" />
        </ListItemButton>

  <ListItemButton component={NavLink} to="/tratamientos" selected={matchPath('/tratamientos')} sx={{ mb: 0.5, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
          <ListItemIcon>
            <HealingIcon sx={{ color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary="Tratamientos" />
        </ListItemButton>

  <ListItemButton component={NavLink} to="/calendario" selected={matchPath('/calendario')} sx={{ mb: 0.5, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
          <ListItemIcon>
            <CalendarTodayIcon sx={{ color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary="Calendario" />
        </ListItemButton>

  {isAdmin() && (
          <>
            <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', my: 1 }} />
            <ListItemButton onClick={toggleAdministracion} sx={{ mb: 0.5 }}>
              <ListItemIcon>
                <SettingsIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Administración" />
              {openAdministracion ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
            </ListItemButton>
            <Collapse in={openAdministracion} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {/* Backup como único enlace: al hacer click se navega a /admin/backup */}
                <ListItemButton component={NavLink} to="/admin/backup" selected={matchPath('/admin/backup')} sx={{ pl: 4, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
                  <ListItemIcon>
                    <CloudUploadIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Backup" />
                </ListItemButton>

                <ListItemButton onClick={toggleBitacoraSub} sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <HistoryIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Bitácora" />
                  {openBitacoraSub ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
                </ListItemButton>
                <Collapse in={openBitacoraSub} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton component={NavLink} to="/bitacora" selected={matchPath('/bitacora')} sx={{ pl: 8, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
                      <ListItemText primary="Ver Bitácora" />
                    </ListItemButton>
                  </List>
                </Collapse>

                <ListItemButton onClick={toggleUsuariosSub} sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <PeopleIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Usuarios" />
                  {openUsuariosSub ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
                </ListItemButton>
                <Collapse in={openUsuariosSub} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton component={NavLink} to="/usuarios/lista" selected={matchPath('/usuarios/lista')} sx={{ pl: 8, mb: 0.5, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
                      <ListItemText primary="Gestionar Usuarios" />
                    </ListItemButton>
                    <ListItemButton component={NavLink} to="/usuarios/gestionar" selected={matchPath('/usuarios/gestionar')} sx={{ pl: 8, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
                      <ListItemText primary="Registrar Usuario" />
                    </ListItemButton>
                  </List>
                </Collapse>

                <ListItemButton onClick={toggleMantenimientoSub} sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <BuildIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Mantenimiento" />
                  {openMantenimientoSub ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
                </ListItemButton>
                <Collapse in={openMantenimientoSub} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {/* Sistemas y Catálogos: se intentan obtener dinámicamente desde el backend. */}
                    <ListItemButton onClick={toggleMantenimientoSistema} sx={{ pl: 4 }}>
                      <ListItemIcon>
                        <BuildIcon sx={{ color: 'inherit' }} />
                      </ListItemIcon>
                      <ListItemText primary="Sistemas" />
                      {openMantenimientoSistema ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
                    </ListItemButton>
                    <Collapse in={openMantenimientoSistema} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {
                            (sistemasModels.length ? sistemasModels : defaultSistemas).map(m => (
                              <ListItemButton key={m} component={NavLink} to={`/mantenimiento/sistemas/${m}`} selected={matchPath(`/mantenimiento/sistemas/${m}`)} sx={{ pl: 8, mb: 0.5, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
                                <ListItemText primary={labelMapSystems[m] || m} />
                              </ListItemButton>
                            ))
                        }
                      </List>
                    </Collapse>

                    <ListItemButton onClick={toggleMantenimientoCatalogos} sx={{ pl: 4 }}>
                      <ListItemIcon>
                        <SettingsIcon sx={{ color: 'inherit' }} />
                      </ListItemIcon>
                      <ListItemText primary="Catálogos" />
                      {openMantenimientoCatalogos ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
                    </ListItemButton>
                    <Collapse in={openMantenimientoCatalogos} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {
                          (catalogosModels.length ? catalogosModels : defaultCatalogos)
                            .filter(m => String(m).toLowerCase() !== 'parametro')
                            .map(m => (
                              <ListItemButton key={m} component={NavLink} to={`/mantenimiento/catalogos/${m}`} selected={matchPath(`/mantenimiento/catalogos/${m}`)} sx={{ pl: 8, mb: 0.5, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
                                <ListItemText primary={labelMap[m] || m} />
                              </ListItemButton>
                            ))
                        }
                      </List>
                    </Collapse>
                  </List>
                </Collapse>

                <ListItemButton component={NavLink} to="/admin/errores" selected={matchPath('/admin/errores')} sx={{ pl: 4, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
                  <ListItemIcon>
                    <BugReportIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Errores" />
                </ListItemButton>

                <ListItemButton onClick={toggleConfigSub} sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <SettingsIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Configuración" />
                  {openConfigSub ? <ExpandLessIcon sx={{ color: 'inherit' }} /> : <ExpandMoreIcon sx={{ color: 'inherit' }} />}
                </ListItemButton>
                <Collapse in={openConfigSub} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton component={NavLink} to="/configuracion/parametros" selected={matchPath('/configuracion/parametros')} sx={{ pl: 8, mb: 0.5, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
                      <ListItemText primary="Parámetros del Sistema" />
                    </ListItemButton>
                    
                    {/* Nueva sección: Gestion de Archivos */}
                    <ListItemButton sx={{ pl: 8, mt: 0.5 }}>
                      <ListItemIcon>
                        <CloudUploadIcon sx={{ color: 'inherit' }} />
                      </ListItemIcon>
                      <ListItemText primary="Gestion de Archivos" />
                    </ListItemButton>
                    <List component="div" disablePadding>
                      <ListItemButton component={NavLink} to="/admin/uploads/limpieza" selected={matchPath('/admin/uploads/limpieza')} sx={{ pl: 12, mb: 0.5, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
                        <ListItemText primary="Archivos" />
                      </ListItemButton>
                      <ListItemButton component={NavLink} to="/admin/uploads/trash" selected={matchPath('/admin/uploads/trash')} sx={{ pl: 12, mb: 0.5, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
                        <ListItemText primary="Papelera" />
                      </ListItemButton>
                    </List>
                  </List>
                </Collapse>

                <ListItemButton component={NavLink} to="/admin/permisos" selected={matchPath('/admin/permisos')} sx={{ pl: 4, '&.active, &.Mui-selected': { bgcolor: palette.primary.dark } }} onClick={handleItemClick}>
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
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="main navigation folders">
      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: palette.primary.main, color: palette.primary.contrastText } }}>
        {drawer}
      </Drawer>
      <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: palette.primary.main, color: palette.primary.contrastText } }} open>
        {drawer}
      </Drawer>
    </Box>
  );
};

export default SideBar;
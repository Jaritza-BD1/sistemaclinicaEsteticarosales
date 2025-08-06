// src/theme.js
import { createTheme } from '@mui/material/styles';

// Sistema de colores rosa pastel
const roseColors = {
  50: '#fdf2f8',
  100: '#fce7f3',
  200: '#fbcfe8',
  300: '#f9a8d4',
  400: '#f472b6',
  500: '#ec4899',
  600: '#db2777',
  700: '#be185d',
  800: '#9d174d',
  900: '#831843',
};

const theme = createTheme({
  palette: {
    primary: {
      main: roseColors[500],
      light: roseColors[400],
      dark: roseColors[600],
      contrastText: '#ffffff',
    },
    secondary: {
      main: roseColors[300],
      light: roseColors[200],
      dark: roseColors[400],
      contrastText: '#ffffff',
    },
    background: {
      default: '#fef7f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#374151',
      secondary: '#6b7280',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Segoe UI',
      'Tahoma',
      'Geneva',
      'Verdana',
      'sans-serif'
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.25rem',
      color: roseColors[600],
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.875rem',
      color: roseColors[600],
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: roseColors[600],
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.25rem',
      color: roseColors[600],
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.125rem',
      color: roseColors[600],
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      color: roseColors[600],
    },
    body1: {
      fontSize: '1rem',
      color: '#374151',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#6b7280',
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          transition: 'all 0.25s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${roseColors[400]} 0%, ${roseColors[500]} 100%)`,
          boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
          '&:hover': {
            background: `linear-gradient(135deg, ${roseColors[500]} 0%, ${roseColors[600]} 100%)`,
          },
        },
        outlined: {
          borderColor: roseColors[300],
          color: roseColors[500],
          '&:hover': {
            backgroundColor: roseColors[50],
            borderColor: roseColors[400],
          },
        },
        text: {
          color: roseColors[500],
          '&:hover': {
            backgroundColor: roseColors[50],
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: roseColors[200],
            },
            '&:hover fieldset': {
              borderColor: roseColors[300],
            },
            '&.Mui-focused fieldset': {
              borderColor: roseColors[500],
            },
          },
          '& .MuiInputLabel-root': {
            color: roseColors[500],
            '&.Mui-focused': {
              color: roseColors[500],
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: `1px solid ${roseColors[100]}`,
          transition: 'all 0.25s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: `1px solid ${roseColors[100]}`,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: roseColors[600],
          fontWeight: 600,
          padding: '24px 24px 16px 24px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px 24px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: roseColors[100],
          color: roseColors[600],
          '&:hover': {
            backgroundColor: roseColors[200],
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        standardSuccess: {
          backgroundColor: '#f0f9ff',
          color: '#065f46',
          '& .MuiAlert-icon': {
            color: '#10b981',
          },
        },
        standardError: {
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          '& .MuiAlert-icon': {
            color: '#ef4444',
          },
        },
        standardWarning: {
          backgroundColor: '#fffbeb',
          color: '#92400e',
          '& .MuiAlert-icon': {
            color: '#f59e0b',
          },
        },
        standardInfo: {
          backgroundColor: '#eff6ff',
          color: '#1e40af',
          '& .MuiAlert-icon': {
            color: '#3b82f6',
          },
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiAlert-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: roseColors[50],
          '& .MuiTableCell-head': {
            color: roseColors[600],
            fontWeight: 600,
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root:nth-of-type(even)': {
            backgroundColor: '#fef7f9',
          },
          '& .MuiTableRow-root:hover': {
            backgroundColor: roseColors[50],
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: roseColors[500],
          '&:hover': {
            backgroundColor: roseColors[50],
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${roseColors[400]} 0%, ${roseColors[500]} 100%)`,
          boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
          '&:hover': {
            background: `linear-gradient(135deg, ${roseColors[500]} 0%, ${roseColors[600]} 100%)`,
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

export default theme;

// src/theme.js
import { createTheme } from '@mui/material/styles';

// Paleta base (composición 70% blanco, 20% rosa pálido, 10% acento)
const BASE_WHITE = '#FFFFFF';
const PALE_PINK = '#FCE4EC';
const PALE_PINK_LIGHT = '#FFF6F9';
const PALE_PINK_L2 = '#FFF2F6';
const PALE_PINK_L3 = '#FFFBFD';
const PALE_PINK_DARK = '#F8BBD0';
const ACCENT = '#212845';
const BLEND_BG = '#E8E7EB';

const theme = createTheme({
  palette: {
    // New contrast system: base 70% white, 20% pale pastel pink, 10% accent (#212845)
    // We compute a soft blended background for a subtle overall tint and
    // expose an explicit 'accent' color for high-contrast text/icons.
    primary: {
      // Use a pale pastel pink as primary (20% presence when combined with white and accent)
      main: PALE_PINK,
      light: PALE_PINK_L2,
      dark: PALE_PINK_DARK,
      contrastText: ACCENT, // accent as primary contrast for readable text
    },
    secondary: {
      // Secondary will be an even paler pink for subtle surfaces
      main: PALE_PINK_LIGHT,
      light: PALE_PINK_L3,
      dark: '#FCEAF0',
      contrastText: ACCENT,
    },
    accent: {
      // Explicit accent color (10% weight in the requested composition)
      main: ACCENT,
      contrastText: BASE_WHITE,
    },
    background: {
      // Blend: 70% white + 20% pale pink (#FCE4EC) + 10% accent (#212845)
      default: BLEND_BG,
      paper: BASE_WHITE,
    },
    text: {
      // Use accent for primary text to ensure good contrast against pale backgrounds
      primary: ACCENT,
      secondary: '#6b7280',
    },
    // Expose base tokens for easy access in components: theme.palette.brand.*
    brand: {
      base: BASE_WHITE,
      pale: PALE_PINK,
      paleLight: PALE_PINK_LIGHT,
      paleL2: PALE_PINK_L2,
      paleL3: PALE_PINK_L3,
      paleDark: PALE_PINK_DARK,
      accent: ACCENT,
      blendBg: BLEND_BG,
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
      color: ACCENT,
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.875rem',
      color: ACCENT,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: ACCENT,
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.25rem',
      color: ACCENT,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.125rem',
      color: ACCENT,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      color: ACCENT,
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
          transition: 'all 0.18s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: PALE_PINK,
          color: ACCENT,
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: PALE_PINK_DARK,
          },
        },
        outlined: {
          borderColor: PALE_PINK_DARK,
          color: ACCENT,
          '&:hover': {
            backgroundColor: PALE_PINK_LIGHT,
            borderColor: PALE_PINK_DARK,
          },
        },
        text: {
          color: PALE_PINK,
          '&:hover': {
            backgroundColor: PALE_PINK_LIGHT,
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
              borderColor: PALE_PINK_L2,
            },
            '&:hover fieldset': {
              borderColor: PALE_PINK_DARK,
            },
            '&.Mui-focused fieldset': {
              borderColor: PALE_PINK,
            },
          },
          '& .MuiInputLabel-root': {
            color: ACCENT,
            '&.Mui-focused': {
              color: ACCENT,
            },
          },
          '& .MuiOutlinedInput-input': {
            color: ACCENT,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: `1px solid ${PALE_PINK_L2}`,
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
          border: `1px solid ${PALE_PINK_L2}`,
          // Force dialog surfaces to be fully white and use the accent color for text
          backgroundColor: BASE_WHITE,
          color: ACCENT,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: ACCENT,
          fontWeight: 600,
          padding: '24px 24px 16px 24px',
          // Ensure title background is neutral/white so dialogs read as white surfaces
          backgroundColor: BASE_WHITE,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
          backgroundColor: BASE_WHITE,
          color: ACCENT,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px 24px',
          backgroundColor: BASE_WHITE,
          color: ACCENT,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          // Use a subtle tint using the new accent at low opacity so the AppBar
          // reads as part of the 70/20/10 composition without being visually heavy.
          background: `linear-gradient(135deg, rgba(33,40,69,0.06) 0%, rgba(236,236,239,0.04) 100%)`,
          boxShadow: '0 2px 8px rgba(33,40,69,0.06)',
          color: '#212845',
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
          backgroundColor: PALE_PINK_L2,
          color: ACCENT,
          '&:hover': {
            backgroundColor: PALE_PINK_LIGHT,
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
          backgroundColor: PALE_PINK_L3,
          '& .MuiTableCell-head': {
            color: ACCENT,
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
            backgroundColor: PALE_PINK_L3,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          // Default icon color to the accent for better contrast
          color: '#212845',
          '&:hover': {
            backgroundColor: '#FFF6F9',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          backgroundColor: PALE_PINK,
          color: ACCENT,
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: PALE_PINK_DARK,
            transform: 'translateY(-2px)',
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

import { createTheme } from '@mui/material/styles';

const commonTheme = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
};

export const lightTheme = {
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#037B41',
      light: '#4CAF50',
      dark: '#026935',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8FAFC',
      paper: '#ffffff',
    },
    text: {
      primary: '#1A2027',
      secondary: '#5A6A85',
    },
  },
};

export const darkTheme = {
  ...commonTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
      contrastText: '#ffffff',
    },
    background: {
      default: '#000000',
      paper: '#121212',
    },
    text: {
      primary: '#ffffff',
      secondary: '#B2BAC2',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
}; 
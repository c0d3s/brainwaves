import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
  }
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: 'rgb(156, 39, 176)',
      light: 'rgb(186, 104, 200)',
      dark: 'rgb(123, 31, 162)',
    },
    secondary: {
      main: '#eaeaea',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Ninja Naruto", Arial, sans-serif',
    h1: {
      color: '#ffffff',
    },
    h2: {
      color: '#ffffff',
    },
    body1: {
      color: 'rgba(255, 255, 255, 0.87)',
    },
    body2: {
      color: 'rgba(255, 255, 255, 0.6)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Ninja Naruto';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: local('Ninja Naruto'), url('/fonts/njnaruto.ttf') format('truetype');
        }
        body {
          background-color: #121212;
          color: #ffffff;
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
          },
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
          backgroundColor: '#1e1e1e',
          borderRadius: 12,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.7)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
  },
}); 
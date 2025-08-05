import { createTheme, alpha } from '@mui/material/styles';

const defaultTheme = createTheme();

const customShadows = [...defaultTheme.shadows];
customShadows[1] = 'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px';

// Color Scales
const brand = { 50: 'hsl(210, 100%, 95%)', 100: 'hsl(210, 100%, 92%)', 200: 'hsl(210, 100%, 80%)', 300: 'hsl(210, 100%, 65%)', 400: 'hsl(210, 98%, 48%)', 500: 'hsl(210, 98%, 42%)', 600: 'hsl(210, 98%, 55%)', 700: 'hsl(210, 100%, 35%)', 800: 'hsl(210, 100%, 16%)', 900: 'hsl(210, 100%, 21%)' };
const gray = { 50: 'hsl(220, 35%, 97%)', 100: 'hsl(220, 30%, 94%)', 200: 'hsl(220, 20%, 88%)', 300: 'hsl(220, 20%, 80%)', 400: 'hsl(220, 20%, 65%)', 500: 'hsl(220, 20%, 42%)', 600: 'hsl(220, 20%, 35%)', 700: 'hsl(220, 20%, 25%)', 800: 'hsl(220, 30%, 6%)', 900: 'hsl(220, 35%, 3%)' };
const green = { 400: 'hsl(120, 44%, 53%)', 500: 'hsl(120, 59%, 30%)', 700: 'hsl(120, 75%, 16%)' };
const orange = { 400: 'hsl(45, 90%, 40%)', 500: 'hsl(45, 90%, 35%)', 700: 'hsl(45, 94%, 20%)' };
const red = { 400: 'hsl(0, 90%, 40%)', 500: 'hsl(0, 90%, 30%)', 700: 'hsl(0, 94%, 18%)' };

// Theme Definition
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      light: brand[300],
      main: brand[400],
      dark: brand[700],
      contrastText: brand[50],
    },
    info: {
      light: brand[500],
      main: brand[700],
      dark: brand[900],
      contrastText: brand[300],
    },
    warning: {
      light: orange[400],
      main: orange[500],
      dark: orange[700],
    },
    error: {
      light: red[400],
      main: red[500],
      dark: red[700],
    },
    success: {
      light: green[400],
      main: green[500],
      dark: green[700],
    },
    grey: gray,
    divider: alpha(gray[700], 0.6),
    background: {
      default: gray[900],
      paper: 'hsl(220, 30%, 7%)',
    },
    text: {
      primary: 'hsl(0, 0%, 100%)',
      secondary: gray[400],
    },
    action: {
      hover: alpha(gray[600], 0.2),
      selected: alpha(gray[600], 0.3),
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: { fontSize: defaultTheme.typography.pxToRem(48), fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.5 },
    h2: { fontSize: defaultTheme.typography.pxToRem(36), fontWeight: 600, lineHeight: 1.2 },
    h3: { fontSize: defaultTheme.typography.pxToRem(30), lineHeight: 1.2 },
    h4: { fontSize: defaultTheme.typography.pxToRem(24), fontWeight: 600, lineHeight: 1.5 },
    h5: { fontSize: defaultTheme.typography.pxToRem(20), fontWeight: 600 },
    h6: { fontSize: defaultTheme.typography.pxToRem(18), fontWeight: 600 },
    subtitle1: { fontSize: defaultTheme.typography.pxToRem(18) },
    subtitle2: { fontSize: defaultTheme.typography.pxToRem(14), fontWeight: 500 },
    body1: { fontSize: defaultTheme.typography.pxToRem(14) },
    body2: { fontSize: defaultTheme.typography.pxToRem(14), fontWeight: 400 },
    caption: { fontSize: defaultTheme.typography.pxToRem(12), fontWeight: 400 },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: customShadows,
});

export default darkTheme;
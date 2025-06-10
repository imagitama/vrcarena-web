import { createTheme, Theme } from '@mui/material/styles'
import { mediaQueryForTabletsOrBelow } from './media-queries'

// TODO: Take from src/brand.ts
export const colorBrand = '#6e4a9e'
export const colorBrandLight = '#9E85C4'
export const colorEditor = '#a67250'
export const colorEditorDark = '#6e4c35'

export const colorFree = 'rgb(100, 150, 100)'

export type VRCArenaTheme = Theme

export const darkTheme: VRCArenaTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      light: colorBrandLight,
      main: colorBrand,
      dark: '#49326B',
    },
    secondary: {
      light: '#FFF',
      main: '#e0e0e0',
      dark: '#bdbdbd',
    },
    tertiary: {
      light: colorEditor,
      main: colorEditor,
      dark: colorEditorDark,
    },
    background: {
      default: '#282828',
    },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        h1: {
          fontSize: '3rem',
          margin: '2rem 0 1rem',
        },
        h2: {
          fontSize: '1.5rem',
          margin: '2rem 0 1rem',
        },
        h3: {
          fontSize: '1.25rem',
          margin: '2rem 0 1rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#424242',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitFontSmoothing: 'auto',
          overflowX: 'hidden', // fix mobile drawer
        },
        body: {
          backgroundColor: '#282828',
          fontSize: '14px',
        },
        a: {
          color: colorBrandLight,
          textDecoration: 'none',
        },
        strong: {
          fontWeight: 600,
        },
        blockquote: {
          margin: '1rem',
          padding: '0.2rem 0.2rem 0.2rem 1rem',
          borderLeft: `4px solid #5a5a5a`,
          background: '#383838',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '0.75rem',
          '&:last-child': {
            paddingBottom: '0.75rem',
          },
          [mediaQueryForTabletsOrBelow]: {
            '&, &:last-child': {
              padding: '0.5rem',
            },
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fontSize: '100%',
        },
      },
    },
  },
})

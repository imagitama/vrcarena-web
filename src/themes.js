import { createTheme } from '@material-ui/core/styles'
import { mediaQueryForTabletsOrBelow } from './media-queries'

// TODO: Take from src/brand.ts
export const colorBrand = '#6e4a9e'
export const colorBrandLight = '#9E85C4'
export const colorEditor = '#a67250'
export const colorEditorDark = '#6e4c35'

// TODO: Replace with material ui theme
export const defaultBorderRadius = '4px'

export const colorFree = 'rgb(100, 150, 100)'

const createOurTheme = (isDark) =>
  createTheme({
    palette: {
      type: isDark ? 'dark' : undefined,
      primary: {
        light: colorBrandLight,
        main: colorBrand,
        dark: '#49326B',
      },
      secondary: {
        light: '#5C1B96',
        main: isDark ? '#9E85C4' : '#461470',
        dark: '#240b36',
      },
      tertiary: {
        main: colorEditor,
        dark: colorEditorDark,
      },
      background: {
        default: isDark ? '#282828' : 'hsl(25, 1%, 90%)',
      },
      paper: {
        hover: {
          shadow: isDark ? '#FFF' : '#000',
        },
        selected: {
          shadow: isDark ? '#FFF' : '#000',
        },
      },
    },
    overrides: {
      MuiCssBaseline: {
        '@global': {
          html: {
            WebkitFontSmoothing: 'auto',
          },
          a: {
            color: isDark ? colorBrandLight : colorBrand,
            textDecoration: 'none',
          },
          strong: {
            fontWeight: 600,
          },
          blockquote: {
            margin: '1rem',
            padding: '0.2rem 0.2rem 0.2rem 1rem',
            borderLeft: `4px solid ${isDark ? '#5a5a5a' : '#b7b7b7'}`,
            background: isDark ? '#383838' : '#d9d9d9',
          },
        },
      },
      MuiCardContent: {
        root: {
          [mediaQueryForTabletsOrBelow]: {
            '&, &:last-child': {
              padding: '0.5rem',
            },
          },
        },
      },
      MuiSvgIcon: {
        root: {
          fontSize: '100%',
        },
      },
      MuiButton: {
        contained: {
          backgroundColor: '#e0e0e0',
          '&:hover': {
            backgroundColor: '#bdbdbd', // darker grey
          },
        },
        text: {
          '&:hover': {
            backgroundColor: '#bdbdbd', // light grey hover for text buttons
          },
        },
        outlined: {
          '&:hover': {
            backgroundColor: '#bdbdbd',
          },
        },
      },
    },
  })

export const lightTheme = createOurTheme(false)
export const darkTheme = createOurTheme(true)

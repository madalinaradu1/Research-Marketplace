import { createTheme } from '@aws-amplify/ui-react';

export const theme = createTheme({
  name: 'urafTheme',
  tokens: {
    colors: {
      primary: {
        10: '#f5e8ff',
        20: '#e5c5ff',
        40: '#c881ff',
        60: '#9a4ad7',
        80: '#7a3ab0',
        90: '#5a2a8f',
        100: '#3a1a6f'
      },
      neutral: {
        10: '#f5f5f5',
        20: '#e0e0e0',
        40: '#9e9e9e',
        60: '#757575',
        80: '#424242',
        90: '#212121',
        100: '#000000'
      }
    },
    radii: {
      small: '4px',
      medium: '8px',
      large: '16px'
    },
    space: {
      small: '0.5rem',
      medium: '1rem',
      large: '1.5rem',
      xl: '2rem'
    },
    fontSizes: {
      small: '0.875rem',
      medium: '1rem',
      large: '1.25rem',
      xl: '1.5rem',
      xxl: '2rem'
    },
    fontWeights: {
      normal: '400',
      bold: '700'
    }
  }
});
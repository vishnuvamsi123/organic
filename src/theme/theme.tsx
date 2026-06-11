// src/theme/theme.tsx
// Theme definitions using styled-components for the Organic App

import { DefaultTheme } from 'styled-components/native';
import { colors, radii, spacing } from './tokens';

export const lightTheme: DefaultTheme = {
  colors: {
    primary: colors.primary,
    background: colors.background,
    surface: colors.surface,
    text: '#222222',
  },
  radii,
  spacing,
};

export const darkTheme: DefaultTheme = {
  colors: {
    primary: '#225B28', // desaturated primary for dark mode
    background: colors.backgroundDark,
    surface: colors.surfaceDark,
    text: '#EEEEEE',
  },
  radii,
  spacing,
};

// src/theme/styled.d.ts
// TypeScript augmentation for styled-components DefaultTheme
// Allows theme.colors, theme.radii, and theme.spacing to be typed correctly.

import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      backgroundDark: string;
      surface: string;
      surfaceDark: string;
      text: string;
    };
    radii: {
      md: number;
      lg: number;
    };
    // spacing utility – returns pixel value for a factor (8‑dp grid)
    spacing: (factor: number) => number;
  }
}

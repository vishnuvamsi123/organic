// src/theme/tokens.ts
// Design tokens for the Organic App – premium eco aesthetic

export const colors = {
  primary: '#2E7D32', // Organic Green
  secondary: '#4CAF50', // Leaf Green
  accent: '#8D6E63', // Earth Brown
  background: '#F8F6F0', // Soft cream
  backgroundDark: '#121212', // Eco‑dark background
  surface: 'rgba(255,255,255,0.6)', // glass‑morphic light
  surfaceDark: 'rgba(30,30,30,0.7)', // glass‑morphic dark
};

export const radii = {
  md: 12,
  lg: 24,
};

/**
 * Spacing utility – follows an 8‑dp grid.
 * usage: spacing(2) => 16
 */
export const spacing = (factor: number) => factor * 8;

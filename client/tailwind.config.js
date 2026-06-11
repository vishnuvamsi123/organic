 /** @type {import('tailwindcss').Config} */
  module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {
        colors: {
          primary: '#10B981',
          secondary: '#6B7280',
          background: '#F9FAFB',
          surface: '#FFFFFF',
          error: '#EF4444',
          success: '#22C55E',
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        },
        fontFamily: {
          sans: [
            'Inter',
            'ui-sans-serif',
            'system-ui',
            '-apple-system',
            'BlinkMacSystemFont',
            'Helvetica Neue',
            'Arial',
            'Noto Sans',
            'sans-serif',
          ],
        },
        boxShadow: {
          sm: '0 1px 2px rgba(0,0,0,0.05)',
          md: '0 4px 6px rgba(0,0,0,0.1)',
          lg: '0 10px 15px rgba(0,0,0,0.15)',
        },

        // ==================== NEW ANIMATION SECTION ====================
        keyframes: {
          // Fade in from transparent to opaque
          'fade-in': {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },

          // Slide up while fading (used for toast pop‑ups)
          'slide-up': {
            '0%': { transform: 'translateY(1rem)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },

          // Subtle pulse on primary elements (e.g., button while loading)
          'pulse-primary': {
            '0%, 100%': {
              boxShadow: '0 0 0 0 rgba(16,185,129, 0.5)',
            },
            '50%': {
              boxShadow: '0 0 0 8px rgba(16,185,129, 0)',
            },
          },
        },

        animation: {
          // Usage: class="animate-fade-in"
          'fade-in': 'fade-in 0.3s ease-out forwards',

          // Usage: class="animate-slide-up"
          'slide-up': 'slide-up 0.4s ease-out forwards',

          // Usage: class="animate-pulse-primary"
          'pulse-primary': 'pulse-primary 1.5s ease-out infinite',
        },
        // ==============================================================
      },
    },
    plugins: [],
  };
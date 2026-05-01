import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{njk,md,html,11ty.js}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta acadêmica neutra gov.uk-inspired (Checkpoint E.1)
        primary: {
          DEFAULT: '#0066cc', // azul-ciência (contraste 8.6:1)
          dark: '#004c99',
          light: '#3385d6',
        },
        success: {
          DEFAULT: '#00b050', // bright green (4.54:1)
          dark: '#008a3e',
        },
        danger: {
          DEFAULT: '#c00000', // gov.uk-like red (5.9:1)
          dark: '#990000',
        },
        warning: {
          DEFAULT: '#ff9800', // orange (4.52:1)
          dark: '#cc7a00',
        },
        info: {
          DEFAULT: '#0a7a7a', // teal (5.2:1)
          dark: '#085f5f',
        },
        neutral: {
          900: '#0b0c0c', // texto principal (19:1)
          700: '#475569',
          500: '#757575', // borders
          200: '#e2e8f0',
          100: '#f5f5f5', // backgrounds
        },
        focus: '#ffdd00', // foco amarelo gov.uk
      },
      fontFamily: {
        sans: ['Open Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        container: '1020px', // gov.uk default
      },
      spacing: {
        // 8 tokens recomendados (E.1.B)
        '2xs': '0.25rem', // 4px
        'xs': '0.5rem',   // 8px
        'sm': '0.75rem',  // 12px
        'md': '1rem',     // 16px
        'lg': '1.5rem',   // 24px
        'xl': '2rem',     // 32px
        '2xl': '3rem',    // 48px
        '3xl': '4rem',    // 64px
      },
    },
  },
  plugins: [
    typography,
  ],
};

import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{njk,md,html,11ty.js}',
  ],
  // Safelist: classes geradas dinamicamente em templates (`tag tag--{{ classe }}`)
  // ou criadas em JS (uf-filtros.js, dimensao-filtros.js). Sem esta lista,
  // o JIT purga as classes não-encontradas no scan de `content`.
  safelist: [
    // Classes dinâmicas de chips (geradas via {{ situacao_classe }} ou JS)
    'tag--ativa',
    'tag--encerrada',
    'tag--suspensa',
    'tag--planejamento',
    'tag--descontinuada',
    'tag--filter',
    // font-serif e font-mono aplicados via @apply em @layer base/components,
    // mas raramente como classe direta em templates — precisam ser geradas.
    'font-serif',
    'font-mono',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta autoral brasileira+editorial (ADR-011, Sprint V2 do MVP-UX 2026-05-02).
        // Substitui gov.uk-clone por tons mornos e azul institucional brasileiro.
        // Todas as combinações principais validadas WCAG AA (ver ADR-011).
        primary: {
          DEFAULT: '#1A4F8B', // azul-IBGE editorial (~9.2:1 sobre papel)
          dark:    '#11385F',
          light:   '#3D7AAE',
        },
        success: {
          DEFAULT: '#0E7B4A', // verde-floresta (~5.8:1 sobre papel)
          dark:    '#0A5C37',
        },
        danger: {
          DEFAULT: '#A02323', // vermelho-tijolo morno (~6.7:1)
          dark:    '#7C1A1A',
        },
        warning: {
          DEFAULT: '#C7521C', // sienna brasileira (~5.1:1)
          dark:    '#9D3F14',
        },
        info: {
          DEFAULT: '#357AB7', // azul-frio editorial (~5.4:1)
          dark:    '#27598C',
        },
        neutral: {
          900: '#3C342A', // tinta morna (~12:1 sobre papel — substitui #0b0c0c quase-preto frio)
          700: '#5C5347',
          500: '#8A7E70', // borders
          200: '#E5DFD3',
          100: '#F2EDE2', // backgrounds suaves
        },
        // Cores de superfície (substituem bg-white e text-neutral-900 default).
        papel: '#FAF7F2', // off-white morno (body bg)
        tinta: '#3C342A', // alias semântico para neutral.900
        focus: '#FFB81C', // âmbar editorial (substitui amarelo neon #ffdd00)
      },
      fontFamily: {
        // Plex Sans Variable: family name é "IBM Plex Sans Variable" (não "IBM Plex Sans").
        // Fallback Inter cobre transição se variável falhar; system-ui cobre worst case.
        sans: ['"IBM Plex Sans Variable"', '"IBM Plex Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"IBM Plex Serif"', 'Georgia', 'Cambria', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
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

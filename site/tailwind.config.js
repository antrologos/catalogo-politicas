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
        // Identidade da Rede EJA. Cores semânticas permanecem distintas da marca.
        primary: {
          DEFAULT: '#665A8E', // roxo do logo oficial; texto branco ≈ 6,14:1
          dark:    '#493A6D',
          light:   '#8073A7',
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
        accent: '#BFDE42',
        'brand-blue': '#5A83CF',
        'brand-sky': '#79AABD',
        neutral: {
          900: '#252333', // texto principal
          700: '#625F70',
          500: '#847C94', // contornos de controles
          200: '#E1E2EA',
          100: '#EEEBF5', // superfície secundária
        },
        // Superfícies claras e foco contrastante.
        papel: '#F6F7FB',
        tinta: '#252333',
        focus: '#493A6D',
      },
      fontFamily: {
        // Plex Sans Variable: family name é "IBM Plex Sans Variable" (não "IBM Plex Sans").
        // Fallback Inter cobre transição se variável falhar; system-ui cobre worst case.
        sans: ['"IBM Plex Sans Variable"', '"IBM Plex Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"IBM Plex Serif"', 'Georgia', 'Cambria', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.neutral.900'),
            '--tw-prose-headings': theme('colors.neutral.900'),
            '--tw-prose-links': theme('colors.primary.DEFAULT'),
            '--tw-prose-bold': theme('colors.neutral.900'),
            '--tw-prose-counters': theme('colors.neutral.700'),
            '--tw-prose-bullets': theme('colors.neutral.500'),
            '--tw-prose-hr': theme('colors.neutral.200'),
            '--tw-prose-quotes': theme('colors.neutral.900'),
            '--tw-prose-quote-borders': theme('colors.neutral.200'),
            '--tw-prose-captions': theme('colors.neutral.700'),
            '--tw-prose-code': theme('colors.neutral.900'),
            fontSize: '1.0625rem',
            lineHeight: '1.65',
            maxWidth: '70ch',
            h1: { fontFamily: theme('fontFamily.sans').join(', '), fontWeight: '650', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', lineHeight: '1.15', marginBottom: '1rem' },
            h2: { fontFamily: theme('fontFamily.sans').join(', '), fontWeight: '650', fontSize: '1.625rem', lineHeight: '1.25', marginTop: '2rem', marginBottom: '1rem' },
            h3: { fontWeight: '600', fontSize: '1.1875rem', lineHeight: '1.35', marginTop: '1.5rem', marginBottom: '.75rem' },
            p: { marginTop: '.875em', marginBottom: '.875em' },
            a: { textUnderlineOffset: '.18em' },
            code: { fontWeight: '450' },
          },
        },
      }),
      maxWidth: {
        container: '1120px',
        reading: '70ch',
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

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: { DEFAULT: '#D45BA8', hover: '#BD4795' },
        dark: '#18181F',
        page: '#F8F9FB',
        card: '#FFFFFF',
        subtle: '#F0F2F6',
        line: { DEFAULT: '#E8EAF0', strong: '#D1D5DB' },
        ink: {
          primary: '#18181F',
          secondary: '#6B7280',
          muted: '#9CA3AF',
          'on-dark': '#FFFFFF',
        },
        status: {
          interview: '#10B981',
          hired: '#047857',
          rejected: '#EF4444',
          feedback: '#F59E0B',
          question: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['var(--font-instrument-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-instrument-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-dm-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        button: '8px',
        pill: '9999px',
      },
      boxShadow: {
        'tt-sm': '0 1px 2px rgba(0,0,0,0.04)',
        'tt-md': '0 4px 12px rgba(0,0,0,0.06)',
      },
      letterSpacing: {
        tight: '-0.02em',
        section: '0.08em',
      },
    },
  },
  plugins: [],
};

export default config;

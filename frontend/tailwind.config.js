/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Dark backgrounds (navy — warmer than pure black) ─────────────
        dark: {
          950: '#030712',
          900: '#070B14',
          800: '#0D1117',
          700: '#161B27',
          600: '#1E2433',
          500: '#252D3D',
          400: '#2E3A4E',
        },
        // ── Primary — electric blue (action, intelligence) ───────────────
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        // ── Success — emerald (growth, good scores) ──────────────────────
        success: {
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        // ── Warning — amber ───────────────────────────────────────────────
        warning: {
          300: '#FCD34D',
          400: '#FBB124',
          500: '#F59E0B',
          600: '#D97706',
        },
        // ── Danger — rose ─────────────────────────────────────────────────
        danger: {
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
        },
        // ── Accent — cyan (AI, highlights) ───────────────────────────────
        accent: {
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
        },
        // ── Neutral slate ────────────────────────────────────────────────
        slate: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.4' }],
        xs:   ['12px', { lineHeight: '1.5' }],
        sm:   ['13px', { lineHeight: '1.5' }],
        base: ['15px', { lineHeight: '1.6' }],
        lg:   ['17px', { lineHeight: '1.5' }],
        xl:   ['20px', { lineHeight: '1.4' }],
        '2xl':['24px', { lineHeight: '1.3' }],
        '3xl':['30px', { lineHeight: '1.2' }],
        '4xl':['36px', { lineHeight: '1.1' }],
        '5xl':['48px', { lineHeight: '1.0' }],
        '6xl':['60px', { lineHeight: '1.0' }],
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'glow-blue':    '0 0 20px rgba(59,130,246,0.15)',
        'glow-green':   '0 0 20px rgba(16,185,129,0.15)',
        'glow-red':     '0 0 20px rgba(244,63,94,0.15)',
        'card':         '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover':   '0 4px 16px rgba(0,0,0,0.5)',
        'modal':        '0 20px 60px rgba(0,0,0,0.6)',
      },
      animation: {
        'shimmer':      'shimmer 2s infinite',
        'fade-in':      'fadeIn 0.3s ease-out',
        'slide-up':     'slideUp 0.4s ease-out',
        'slide-in':     'slideIn 0.3s ease-out',
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'count-up':     'countUp 1s ease-out',
        'spin-slow':    'spin 3s linear infinite',
        'glow':         'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          from: { boxShadow: '0 0 10px rgba(59,130,246,0.1)' },
          to:   { boxShadow: '0 0 30px rgba(59,130,246,0.3)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero':   'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)',
        'gradient-card':   'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
        'shimmer-gradient':'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
    },
  },
  plugins: [],
}

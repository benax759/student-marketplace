/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#7C5DFA',
          600: '#6d4aed',
          700: '#5b35d4',
          800: '#4c2db3',
          900: '#3f2590',
          950: '#1a0f3e',
        },
        surface: {
          light: '#F8F7FF',
          card: '#ffffff',
          border: '#e9e5f5',
          lavender: '#F5F3FF',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)' }
        },
        bounceIn: {
          '0%': { opacity: 0, transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-purple': 'linear-gradient(135deg, #7C5DFA 0%, #9B7DFF 40%, #B49AFF 100%)',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(124,93,250,0.06), 0 4px 20px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px rgba(124,93,250,0.12), 0 16px 48px rgba(0,0,0,0.06)',
        'button': '0 2px 8px rgba(124,93,250,0.35)',
        'bottom-nav': '0 -4px 24px rgba(0,0,0,0.08)',
        'glow': '0 0 40px rgba(124,93,250,0.2)',
      },
    },
  },
  plugins: [],
}

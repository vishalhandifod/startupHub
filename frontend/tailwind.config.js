/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        'primary-dark': '#4F46E5',
        accent: '#10B981',
        dark: '#0A0F1E',
        'dark-card': '#111827',
        'dark-border': '#1F2937',
        shell: '#09111f',
        canvas: '#f8faff',
        ink: '#0f172a',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glow: '0 20px 60px rgba(15, 23, 42, 0.18)',
        soft: '0 10px 30px rgba(15, 23, 42, 0.10)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.45s ease-out',
      },
    },
  },
  plugins: [],
}

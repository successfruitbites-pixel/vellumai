/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        'dm-sans': ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          primary: '#3B82F6',
          gold: '#C9A84C',
          navy: '#0A0F1E',
        }
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.08)',
      },
      animation: {
        lift: 'lift 0.2s ease-in-out forwards',
      },
      keyframes: {
        lift: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}

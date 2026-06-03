/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        svep: {
          blue:   '#1E3A5F',
          accent: '#E8A020',
          green:  '#22C55E',
          yellow: '#EAB308',
          red:    '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        svep: {
          bg:        '#FAFAF8',
          surface:   '#FFFFFF',
          primary:   '#16191E',
          secondary: '#6E6B65',
          tertiary:  '#9B9892',
          border:    '#E7E5E0',
          accent:    '#1C7FBE',
          'accent-light': '#EBF4FB',
        },
      },
      fontFamily: {
        sans:   ['Inter', 'system-ui', 'sans-serif'],
        brutal: ['BrutalType', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

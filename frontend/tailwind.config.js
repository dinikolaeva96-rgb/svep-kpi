/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        svep: {
          bg:        '#FAF9F6',
          surface:   '#FFFFFF',
          primary:   '#1A1A1A',
          secondary: '#5F5E5A',
          tertiary:  '#888780',
          border:    'rgba(0,0,0,0.08)',
          accent:    '#185FA5',
          'accent-deep': '#0C447C',
          'accent-deep-text': '#B5D4F4',
          'accent-light': '#E6F1FB',
          success:   '#085041',
          'success-light': '#E1F5EE',
        },
      },
      borderRadius: {
        card: '12px',
        control: '8px',
      },
      fontFamily: {
        sans:   ['Inter', 'system-ui', 'sans-serif'],
        brutal: ['BrutalType', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

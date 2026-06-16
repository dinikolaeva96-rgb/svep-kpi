/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        svep: {
          bg:        '#F5F6F8',
          surface:   '#FFFFFF',
          primary:   '#0A1628',
          secondary: '#4A5568',
          tertiary:  '#718096',
          border:    '#E8EAF0',
          accent:    '#185FA5',
          'accent-hover': '#1A6FBF',
          'accent-deep': '#0C447C',
          'accent-deep-text': '#B5D4F4',
          'accent-light': '#EBF3FB',
          success:   '#065F46',
          'success-light': '#E6F7F0',
          navy:        '#0A1628',
          'navy-surface': '#0F1F3D',
          'navy-input':   '#1A2F52',
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

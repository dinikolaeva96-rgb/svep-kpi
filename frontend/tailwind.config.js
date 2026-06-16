/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        svep: {
          accent:      '#2196C9',
          'accent-hover': '#2DA8DC',
          night:       '#0D1B2A',
          slate:       '#112233',
          mist:        '#F2F4F7',
          surface:     '#FFFFFF',
          white:       '#FFFFFF',
          steel:       '#8FA3B8',
          divider:     '#1E3248',
          ok:          '#27AE60',
          alert:       '#F2994A',
          critical:    '#EB5757',
          /* legacy aliases kept for incremental migration */
          bg:        '#F2F4F7',
          primary:   '#0D1B2A',
          secondary: '#4A5568',
          tertiary:  '#8FA3B8',
          border:    '#E2E8F0',
          navy:        '#0D1B2A',
          'navy-surface': '#112233',
          'navy-input':   '#1A2F45',
        },
      },
      borderRadius: {
        card: '12px',
        control: '6px',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Exo 2', 'Inter', 'sans-serif'],
        brutal:  ['Exo 2', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

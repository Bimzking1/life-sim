/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fog: 'rgb(var(--fog) / <alpha-value>)',
        paper: 'rgb(var(--paper) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        ink2: 'rgb(var(--ink2) / <alpha-value>)',
        rule: 'rgb(var(--rule) / <alpha-value>)',
        'line-blue': 'rgb(var(--line-blue) / <alpha-value>)',
        'line-green': 'rgb(var(--line-green) / <alpha-value>)',
        'line-yellow': 'rgb(var(--line-yellow) / <alpha-value>)',
        signal: 'rgb(var(--signal) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: { panel: '14px' },
    },
  },
  plugins: [],
}

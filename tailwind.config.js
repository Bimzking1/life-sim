/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fog: '#E8EDF1',
        paper: '#F8FAFB',
        ink: '#16202A',
        ink2: '#4A5866',
        rule: '#C9D3DB',
        'line-blue': '#2D5FB5',
        'line-green': '#2A8A6B',
        'line-yellow': '#E9B02C',
        signal: '#D24A3C',
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

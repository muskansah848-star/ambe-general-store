/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#16a34a', dark: '#15803d', light: '#22c55e' },
      },
    },
  },
  plugins: [],
};

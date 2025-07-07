/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#FE9A00',
          500: '#FE9A00',
          600: '#EC4513',
          700: '#EC4513',
          800: '#5b21b6',
          /*900: '#FE9A01',*/
          900: '#000000',
        },
        secondary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#FE9A00',
          500: '#FE9A00',
          600: '#EC4513',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        indigo: {
          600: '#EC4513'
        }
      },
    },
  },
  plugins: [],
}
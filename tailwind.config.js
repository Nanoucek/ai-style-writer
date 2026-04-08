/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dde6ff',
          200: '#c3d0ff',
          300: '#a0b0ff',
          400: '#7c8fff',
          500: '#5c6ef5',
          600: '#4550e8',
          700: '#3840cc',
          800: '#2f35a5',
          900: '#2a3082',
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          500: '#667eea',
          600: '#2563EB', // Blue 600
          700: '#9333EA', // Purple 600
        },
        accent: {
          600: '#16A34A', // Green 600
        },
        peach: {
          200: '#FED7AA',
          300: '#FDBA74',
        },
        pink: {
          200: '#FBCFE8',
          300: '#F9A8D4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


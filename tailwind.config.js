/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chess-dark': '#b58863', // lighter brown
        'chess-light': '#f0d9b5',
        'chess-highlight': '#f7f769',
        'chess-move': '#baca44',
        'chess-capture': '#f56565',
        'chess-check': '#ff6b6b',
      },
      fontFamily: {
        'chess': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 
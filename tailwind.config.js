/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      animation: {
        'blob': 'blob 7s infinite',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        'deep-blue': '#1a2a80',
        'purple-blue': '#3b38a0',
        'light-blue': '#7a85c1',
        'light-purple': '#b2b0e8',
      },
    },
  },
  plugins: [],
}
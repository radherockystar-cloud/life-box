/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f43f5e',
        secondary: '#fff1f2',
      }
    },
  },
  plugins: [],
}

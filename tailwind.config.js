/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Helvetica', 'Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        'bw-black': '#000000',
        'bw-white': '#ffffff',
        'bw-gray-1': '#111111',
        'bw-gray-2': '#222222',
        'bw-gray-3': '#333333',
        'bw-gray-7': '#777777',
        'bw-gray-d': '#dddddd',
        'bw-gray-f': '#f5f5f5',
        'bw-warning-200': '#fbbf24',
        'bw-danger-200': '#f87171',
        'bw-danger-400': '#f87171',
        'bw-danger-500': '#ef4444',
        'bw-danger-600': '#dc2626',
      },
    },
  },
  plugins: [],
}


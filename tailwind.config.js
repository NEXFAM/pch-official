/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFD700',
          light: '#FFF9C4',
          medium: '#FFC107',
          dark: '#FFAB00',
          darker: '#FF8F00',
        },
        navy: {
          DEFAULT: '#0f172a',
          light: '#1e293b',
          muted: '#334155',
        },
      },
    },
  },
  plugins: [],
}

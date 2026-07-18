/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        blood: {
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#ef233c',
          600: '#d90429',
          700: '#a4133c',
        },
        ink: '#1d2636',
        mint: '#2ec4b6',
        amber: '#ffb703',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(29, 38, 54, 0.13)',
      },
    },
  },
  plugins: [],
}

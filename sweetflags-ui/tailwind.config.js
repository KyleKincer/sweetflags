/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,vue,js}'],
  theme: {
    extend: {
      maxHeight: {
        '6lines': '8rem',
      },
    },
  },
  plugins: [],
};

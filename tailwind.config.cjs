const colors = require('tailwindcss/colors')

const config = {
  content: ["./src/**/*.{html,js,svelte,ts}", "./*.{html,js,svelte,ts}"],

  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      red: colors.red,
      primary: {
        50: '#f0f0f6',
        100: '#e1e1ed',
        200: '#c3c4dc',
        300: '#a5a6ca',
        400: '#8789b9',
        500: '#696ba7',
        600: '#545686',
        700: '#3f4064',
        800: '#2a2b43',
        900: '#151521',
        950: '#0a0b11',
      }
    },
    fontFamily: {
      sans: ['Roboto Flex', 'system-ui', 'sans-serif'],
      mono: ['Sudo', 'monospace'],
    },
    extend: {
      screens: {
        'xs': '480px',
      }
    },
  },

  darkMode: 'class',
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};

module.exports = config;

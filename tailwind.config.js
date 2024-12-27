const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Update these paths
  theme: {
    extend: {
      colors: {
        customBlue: '#0E2954',
        primary: '#202225',
        secondary: '#5865f2',
        customBackground: '#1F6E8C',
        customTeal: ' #6CACE4',
        customSomething: '#84A7A1',
        customRichBlack: '#111827',
      },
    }
  },
  plugins: [],
};


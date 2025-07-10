/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Panoramic Solutions Brand Colors with gradations
        'snow-white': '#F5F9FC',
        'alpine-blue': {
          50: '#E6F0FF',
          100: '#B3D4FF',
          200: '#80B8FF',
          300: '#4D9CFF',
          400: '#1A80FF',
          500: '#0057B7', // Primary Alpine Blue
          600: '#004A9E',
          700: '#003D85',
          800: '#00306C',
          900: '#002353',
        },
        'summit-green': {
          50: '#E8F5F0',
          100: '#C7E6D6',
          200: '#A6D7BC',
          300: '#85C8A2',
          400: '#64B988',
          500: '#2E8B57', // Primary Summit Green
          600: '#267549',
          700: '#1E5F3B',
          800: '#16492D',
          900: '#0E331F',
        },
        'midnight': {
          50: '#F2F4F6',
          100: '#D9DEE4',
          200: '#B3BCC8',
          300: '#8D9AAC',
          400: '#677890',
          500: '#415674',
          600: '#304158',
          700: '#1F2C3C',
          800: '#0B1E2D', // Primary Midnight
          900: '#081621',
        },
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        'mobile': {'max': '1023px'},
        'desktop': '1024px',
      },
    },
  },
  plugins: [],
};

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', './src/app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        civic: {
          blue: '#0E7CFF',
          navy: '#0A2E5D',
          teal: '#00A7A7',
          yellow: '#FFD166',
        },
      },
      boxShadow: {
        floating: '0 10px 25px rgba(15, 23, 42, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;

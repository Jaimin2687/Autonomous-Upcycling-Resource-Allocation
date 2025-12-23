import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './providers/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f1fbf5',
          100: '#d4f5e0',
          200: '#a9ebc2',
          300: '#7edfa3',
          400: '#53d584',
          500: '#2acb66',
          600: '#1f9e4f',
          700: '#147238',
          800: '#0a4520',
          900: '#021909'
        }
      },
      boxShadow: {
        card: '0 10px 30px rgba(15, 70, 50, 0.1)'
      }
    }
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')]
};

export default config;

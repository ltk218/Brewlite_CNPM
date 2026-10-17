import type { Config } from 'tailwindcss';

const srcGlob = ['.', 'src', '**', '*.{js,ts,jsx,tsx,mdx}'].join('/');

const config: Config = {
  content: [srcGlob],
  theme: {
    extend: {
      colors: {
        espresso: {
          DEFAULT: '#3E2723',
          dark: '#2C1810',
          medium: '#5D4037',
          light: '#8D6E63',
        },
        caramel: {
          DEFAULT: '#B45309',
          soft: '#C87D55',
        },
        cream: {
          DEFAULT: '#FDFBF7',
          warm: '#F7F2EB',
          card: '#EFE8DF',
          border: '#E6DCD2',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        bg: '#F5F0E8',
        card: '#FAF7F2',
        accent: '#FF6B47',
        'accent-light': '#FFF3EE',
        green: '#7DB87A',
        red: '#E05A5A',
        text: '#2C1810',
        'text-mid': '#7A6558',
        'text-light': '#B8A898',
        border: '#E8DDD0',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};

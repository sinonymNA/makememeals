/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        fredoka: ["'Fredoka'", 'sans-serif'],
        caveat: ["'Caveat'", 'cursive'],
      },
      colors: {
        bg: '#FFFFFF',
        'bg-soft': '#F8F9FA',
        'bg-warm': '#FFF8F5',
        card: '#FFFFFF',
        accent: '#FF6B47',
        'accent-green': '#2ECC71',
        'accent-gold': '#FFB830',
        text: '#1A1A1A',
        'text-mid': '#6B6B6B',
        'text-light': '#ABABAB',
        border: '#F0F0F0',
        'border-mid': '#E0E0E0',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};

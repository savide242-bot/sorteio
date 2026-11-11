/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          forest: '#2D6A4F',
          'forest-dark': '#1B4332',
          'forest-light': '#40916C',
          mint: '#E8F5E9',
          'mint-border': '#C7E4D6',
          cream: '#FAF7F2',
          'cream-light': '#FFFDF9',
          'cream-dark': '#F0E9DF',
          apricot: '#E76F51',
          'apricot-light': '#FFF1EB',
          dark: '#22201D',
          muted: '#6B645C',
          lightmuted: '#9E958A',
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'glow-forest': '0 12px 32px -4px rgba(45, 106, 79, 0.22)',
        'glow-apricot': '0 12px 32px -4px rgba(231, 111, 81, 0.2)',
        'card-elevated': '0 20px 40px -10px rgba(34, 32, 29, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'card-soft': '0 10px 25px -5px rgba(34, 32, 29, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

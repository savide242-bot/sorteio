/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F2F8F5',
          100: '#E4F2EB',
          200: '#C7E4D6',
          500: '#2D6A4F',
          600: '#245640',
          700: '#1B4332',
          800: '#143326',
        },
        peach: {
          50: '#FFF7F2',
          100: '#FEEFE6',
          200: '#FCD8C5',
          500: '#E76F51',
          600: '#D55C3D',
        },
        warmcream: {
          50: '#FCFAF7',
          100: '#F8F4EE',
          200: '#F0E9DF',
          300: '#E5DCCE',
        },
        charcoal: {
          800: '#38332E',
          900: '#24211D',
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'clean': '0 4px 20px -2px rgba(45, 106, 79, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'app': '0 16px 40px -8px rgba(33, 40, 36, 0.12), 0 6px 16px -4px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}

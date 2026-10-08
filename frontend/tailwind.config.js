/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: {
            50: '#fdf2f2',
            100: '#fde8e8',
            200: '#fbd5d5',
            300: '#f8b4b4',
            400: '#f05252',
            500: '#e02424',
            600: '#c81e1e',
            700: '#9b111e', // signature rich ruby red
            800: '#7f1d1d', // deep luxury maroon red
            900: '#5c0d12',
            950: '#38060a',
          },
          gold: {
            50: '#fbf8ee',
            100: '#f5edd4',
            200: '#ebd9a6',
            300: '#dfc272',
            400: '#d4ab44',
            500: '#c59b27', // warm antique gold
            600: '#a37c1a',
            700: '#7e5d16',
            800: '#594013',
            900: '#3c2b0e',
          },
          dark: {
            700: '#2a2a32',
            800: '#1c1c22',
            900: '#121216', // deep charcoal
            950: '#0a0a0d', // obsidian
          },
          cream: {
            50: '#fdfcf9',
            100: '#faf6ee',
            200: '#f4ece0',
            300: '#e8dcce',
          }
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        script: ['Caveat', 'cursive'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'gold-glow': '0 0 15px rgba(197, 155, 39, 0.35)',
        'red-glow': '0 4px 20px rgba(155, 17, 30, 0.4)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s infinite linear',
        slideUp: 'slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        fadeIn: 'fadeIn 0.2s ease-out',
      }
    },
  },
  plugins: [],
}


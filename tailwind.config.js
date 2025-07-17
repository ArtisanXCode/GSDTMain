
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['DM Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          orange: '#FF6B00',
          red: '#E53E3E',
          blue: {
            1: '#4299E1',
            2: '#3182CE', 
            3: '#2B6CB0',
            4: '#2C5282'
          }
        },
        brand: {
          orange: '#FF6B00',
          red: '#E53E3E',
          'orange-light': '#FFA500',
          'orange-dark': '#FF4500',
          gray: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827'
          }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #FF6B00 0%, #E53E3E 100%)',
        'cta-gradient': 'linear-gradient(135deg, #FF6B00 0%, #FFA500 100%)',
        'benefits-gradient': 'linear-gradient(135deg, #FF6B00 0%, #E53E3E 100%)',
      }
    },
  },
  plugins: [],
}

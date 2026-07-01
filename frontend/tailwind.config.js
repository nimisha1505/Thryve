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
          50: '#faf5ff',   // Soothing ultra-soft lavender
          100: '#f3e8ff',  // Pastel lavender accent
          200: '#e9d5ff',  // Light periwinkle
          500: '#c084fc',  // Soothing pastel violet-purple
          600: '#a855f7',  // Calm medium violet
          700: '#8b5cf6',  // Hover violet/indigo
          900: '#1e293b',  // Deep slate charcoal
        },
        pastel: {
          blue: '#e0f2fe',     // Calming sky blue
          lavender: '#ede9fe', // Calming lavender
          cream: '#fafaf9',    // Warm cream background base
          clay: '#fef3c7',     // Soft peach/amber
          mint: '#d1fae5',     // Soft emerald/mint
        },
        slate: {
          950: '#090d16',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(168, 85, 247, 0.04)', // Gentle lavender diffuse shadow
        'glass-card': '0 10px 40px -10px rgba(0, 0, 0, 0.04)',
        'glass-highlight': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
      }
    },
  },
  plugins: [],
}

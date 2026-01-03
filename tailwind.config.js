/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
    "!./node_modules/**",
    "!./cloud-agent/**",
    "!./scripts/**",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#FFC425',
          light: '#FFD768',
          dark: '#B38600',
          dim: '#4A3700',
        },
        red: {
          DEFAULT: '#BE1E2D',
          dim: 'rgba(190, 30, 45, 0.1)',
        },
        jalanea: {
          950: '#020617',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
          50: '#f8fafc',
          glass: 'rgba(255, 255, 255, 0.1)',
          glassBorder: 'rgba(255, 255, 255, 0.2)',
          glassDark: 'rgba(15, 23, 42, 0.7)',
        }
      },
      backgroundImage: {
        'premium-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        'gold-sheen': 'linear-gradient(135deg, #FFC425 0%, #FFD768 100%)',
        'gold-flow': 'linear-gradient(90deg, #FFC425 0%, #FFD768 25%, #FFFFFF 50%, #FFD768 75%, #FFC425 100%)',
        'subtle-mesh': 'radial-gradient(at 0% 0%, rgba(15, 23, 42, 0.03) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(255, 196, 37, 0.05) 0px, transparent 50%)',
      },
      backgroundSize: {
        '200%': '200% auto',
      },
      keyframes: {
        'flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { textShadow: '0 0 20px rgba(255, 196, 37, 0.3)' },
          '50%': { textShadow: '0 0 40px rgba(255, 196, 37, 0.6), 0 0 60px rgba(255, 196, 37, 0.3)' },
        },
        'reveal': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'live-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.5)' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(255, 196, 37, 0.2)' },
          '50%': { borderColor: 'rgba(255, 196, 37, 0.5)' },
        },
      },
      animation: {
        'text-flow': 'flow 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'reveal': 'reveal 0.8s ease-out forwards',
        'live-pulse': 'live-pulse 2s ease-in-out infinite',
        'border-glow': 'border-glow 3s ease-in-out infinite',
      },
      boxShadow: {
        'gold-glow': '0 0 30px rgba(255, 196, 37, 0.3)',
        'gold-glow-lg': '0 0 50px rgba(255, 196, 37, 0.4)',
        'gold-glow-xl': '0 0 80px rgba(255, 196, 37, 0.5)',
      }
    }
  },
  plugins: [],
}

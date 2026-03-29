/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tema Engenharia Industrial - Azul Escuro + Cinza
        bg: {
          base: '#0f172a',      // Fundo principal
          card: '#1e293b',      // Card base
          elevated: '#263248',  // Card elevado
          input: '#172033',     // Input field
        },
        accent: {
          blue: '#3b82f6',      // Azul primário
          cyan: '#06b6d4',      // Ciano destaque
          green: '#22c55e',     // Verde status OK
          amber: '#f59e0b',     // Âmbar alerta
          red: '#ef4444',       // Vermelho erro
        },
        text: {
          primary: '#e2e8f0',   // Texto principal
          secondary: '#94a3b8', // Texto secundário
          muted: '#475569',     // Texto suave
          accent: '#60a5fa',    // Texto destaque
        },
        neuro: {
          shadow1: '#0a1120',   // Sombra escura (neumórfico)
          shadow2: '#283855',   // Sombra clara (neumórfico)
          highlight: '#1e3a5f', // Destaque interno
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        // Efeito Neumórfico Dark
        'neuro': '6px 6px 12px #0a1120, -6px -6px 12px #283855',
        'neuro-sm': '3px 3px 6px #0a1120, -3px -3px 6px #283855',
        'neuro-lg': '10px 10px 20px #0a1120, -10px -10px 20px #283855',
        'neuro-inset': 'inset 4px 4px 8px #0a1120, inset -4px -4px 8px #283855',
        'neuro-pressed': 'inset 3px 3px 6px #0a1120, inset -3px -3px 6px #20324f',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.3)',
        'glow-green': '0 0 15px rgba(34, 197, 94, 0.4)',
      },
      backgroundImage: {
        'gradient-neuro': 'linear-gradient(145deg, #1e293b, #172033)',
        'gradient-card': 'linear-gradient(145deg, #263248, #1a2540)',
        'gradient-accent': 'linear-gradient(135deg, #1e40af, #0891b2)',
        'gradient-hero': 'radial-gradient(ellipse at 20% 50%, #1e3a8a22 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #0891b222 0%, transparent 50%), linear-gradient(135deg, #0f172a 0%, #0f172a 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

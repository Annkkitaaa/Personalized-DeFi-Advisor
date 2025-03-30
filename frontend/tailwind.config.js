module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
      extend: {
        colors: {
          // Cyberpunk color scheme
          'cyber-black': '#0d0221',
          'cyber-purple': '#541388',
          'cyber-blue': '#2de2e6',
          'cyber-pink': '#ff3864',
          'cyber-yellow': '#f6f740',
          'dark-bg': '#13111C',
          'card-bg': '#1A1A2E',
          'highlight': '#2663FF'
        },
        fontFamily: {
          'cyber': ['Orbitron', 'sans-serif'],
          'body': ['Chakra Petch', 'sans-serif'],
          'mono': ['JetBrains Mono', 'monospace'],
        },
        boxShadow: {
          'neon': '0 0 5px #2de2e6, 0 0 10px #2de2e6, 0 0 15px #2de2e6',
          'neon-pink': '0 0 5px #ff3864, 0 0 10px #ff3864, 0 0 15px #ff3864',
        },
        animation: {
          'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'glow': 'glow 2s ease-in-out infinite alternate',
        },
        backgroundImage: {
          'cyber-grid': "url('/src/assets/images/grid-bg.svg')",
          'gradient-cyber': 'linear-gradient(180deg, #13111C 0%, #0D0221 100%)',
        },
        keyframes: {
          glow: {
            '0%': { textShadow: '0 0 5px #2de2e6, 0 0 10px #2de2e6' },
            '100%': { textShadow: '0 0 10px #2de2e6, 0 0 20px #2de2e6, 0 0 30px #2de2e6' },
          },
        },
      },
    },
    plugins: [],
  };
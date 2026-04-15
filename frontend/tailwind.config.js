/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          DEFAULT: '#050505',
          panel: '#090909',
          panelSoft: '#111111',
          border: '#262626',
          borderStrong: '#f5f5f5',
          text: '#f5f5f5',
          muted: '#a3a3a3',
          inverted: '#f5f5f5',
          invertedText: '#090909'
        }
      },
      boxShadow: {
        panel: '0 0 0 1px rgba(255,255,255,0.08)'
      },
      fontFamily: {
        sans: ['Sora', 'Space Grotesk', 'Segoe UI', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Consolas', 'monospace']
      }
    }
  },
  plugins: []
};

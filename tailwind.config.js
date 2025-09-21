/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mtg-blue': '#0066cc',
        'mtg-green': '#009900',
        'mtg-black': '#1a1a1a',
        'mtg-red': '#cc0000',
        'mtg-white': '#f5f5f5',
        'mtg-gold': '#ffd700',
        'cardboard': '#8b7355',
        'cardboard-dark': '#6b5b47',
        'cardboard-light': '#a68b6b',
        'dungeon-stone': '#4a4a4a',
        'dungeon-dark': '#2d2d2d',
        'torch-glow': '#ff6b35',
        'ancient-gold': '#b8860b'
      },
      fontFamily: {
        'mtg': ['Beleren', 'serif'],
        'display': ['Inter', 'sans-serif']
      },
      backgroundImage: {
        'cardboard-texture': "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iY2FyZGJvYXJkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzhiNzM1NSIvPjxwYXRoIGQ9Ik0wIDQwTDEwIDBMMjAgMTBMMzAgMEw0MCAxMFY0MEgwWiIgZmlsbD0iIzZiNWI0NyIgZmlsbC1vcGFjaXR5PSIwLjMiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIiBmaWxsPSIjNjY1NDQ0IiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2NhcmRib2FyZCkiLz48L3N2Zz4=')",
        'dungeon-texture': "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZHVuZ2VvbiIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiM0YTRhNGEiLz48cGF0aCBkPSJNMCAwSDYwVjYwSDBaIiBmaWxsPSIjMmQyZDJkIiBmaWxsLW9wYWNpdHk9IjAuMyIvPjxwYXRoIGQ9Ik0wIDMwSDYwVjQwSDBaIiBmaWxsPSIjNTU1NTU1IiBmaWxsLW9wYWNpdHk9IjAuMiIvPjxwYXRoIGQ9Ik0zMCAwVjYwSDQwVjBIMzBaIiBmaWxsPSIjNTU1NTU1IiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSJ1cmwoI2R1bmdlb24pIi8+PC9zdmc+')"
      }
    },
  },
  plugins: [],
}

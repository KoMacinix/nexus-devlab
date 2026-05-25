/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: "#0a0a0f",
          surface: "#13131a",
          border: "#1e1e2a",
          text: "#e0e0e8",
          muted: "#6b6b80",
          green: "#00e5a0",
          purple: "#7c5cfc",
          red: "#ff6b6b",
          blue: "#38bdf8",
          yellow: "#fbbf24",
        },
      },
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

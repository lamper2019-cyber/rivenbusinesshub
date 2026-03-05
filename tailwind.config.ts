import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        riven: {
          bg: "#0A0A0A",
          gold: "#C8A951",
          "gold-dark": "#A68A3E",
          "gold-light": "#D4BA6A",
          card: "#141414",
          border: "#1E1E1E",
          "border-light": "#2A2A2A",
          muted: "#888888",
        },
      },
    },
  },
  plugins: [],
};
export default config;

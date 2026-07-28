import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3ffe0",
          100: "#e4ffb8",
          200: "#cbff78",
          300: "#aef032",
          400: "#96dc1a",
          500: "#7DC832",
          600: "#6ab028",
          700: "#528a1e",
          800: "#3f6b17",
          900: "#2e4e11",
          950: "#1a2e08",
        },
        accent: {
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
        },
        dark: {
          950: "#050505",
          900: "#0a0a0a",
          800: "#111111",
          700: "#1a1a1a",
          600: "#222222",
          500: "#2d2d2d",
          400: "#3d3d3d",
        },
      },
      fontFamily: {
        heading: ["var(--font-barlow)", "Impact", "Arial Narrow", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.25em",
        widest3: "0.35em",
      },
    },
  },
  plugins: [],
};

export default config;

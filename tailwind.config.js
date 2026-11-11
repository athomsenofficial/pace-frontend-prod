/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1e3a8a",
          dark: "#172554",
          light: "#3b5bdb",
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#3b5bdb",
          600: "#2a4ac7",
          700: "#1e3a8a",
          900: "#172554",
        },
        "gold-light": "#f9d067",
        navy: {
          950: "#0a1530",
          900: "#0f1e3d",
          800: "#152652",
          700: "#1c3066",
          600: "#27407f",
          500: "#3656a3",
        },
        success: {
          DEFAULT: "#16a34a",
          dark: "#15803d",
        },
        warning: {
          DEFAULT: "#d97706",
          dark: "#b45309",
        },
        danger: {
          DEFAULT: "#dc2626",
          dark: "#b91c1c",
        },
        accent: {
          DEFAULT: "#0891b2",
          dark: "#0e7490",
        },
        special: {
          DEFAULT: "#7c3aed",
          dark: "#6d28d9",
        },
        gold: {
          DEFAULT: "#f4b942",
          light: "#f9d067",
          dark: "#d99526",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        heading: ['"Poppins"', '"Inter"', "system-ui", "sans-serif"],
        brand: ['"Black Ops One"', '"Poppins"', "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #0f1e3d 0%, #1c3066 50%, #27407f 100%)",
      },
    },
  },
  plugins: [],
};

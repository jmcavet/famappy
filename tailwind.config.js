/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ["./src/**/*.html", "./src/**/*.js"],
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      height: {
        "8vh": "8vh",
        "10vh": "10vh",
        // main: "calc(100vh - 20vh)",
        main: "calc(100vh - 16vh)",
      },
      margin: {
        "8vh": "8vh",
        "10vh": "10vh",
        "20vh": "20vh",
      },
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6", // Default Blue
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        secondary: {
          50: "#fff7ed", // Very light orange
          100: "#ffedd5", // Light orange
          200: "#fed7aa", // Soft orange
          300: "#fdba74", // Medium orange
          400: "#fb923c", // Bright orange
          500: "#f97316", // Default Orange
          600: "#ea580c", // Darker orange
          700: "#c2410c", // Even darker orange
          800: "#9a3c1f", // Deep orange
          900: "#7c2d12", // Very dark orange
        },
        danger: {
          50: "#ffe5e5",
          100: "#ffcccc",
          200: "#ff9999",
          300: "#ff6666",
          400: "#ff3333",
          500: "#ff0000",
          600: "#cc0000",
          700: "#990000",
          800: "#660000",
          900: "#330000",
        },
        background: {
          ligth: "#ededed",
          dark: "#282c34",
        },
      },
    },
  },
  plugins: [],
};

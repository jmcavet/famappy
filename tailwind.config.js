/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{html,ts,css,scss}"],
  safelist: [
    { pattern: /^text-/ },
    { pattern: /^bg-/ },
    { pattern: /^border-/ },
    { pattern: /^flex/ },
    { pattern: /^grid/ },
    { pattern: /^col-/ },
    { pattern: /^z-/ },
    { pattern: /^sticky/ },
    { pattern: /^top-/ },
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
      },
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
          50: "hsl(225 85% 96%)", // Very soft bg, empty states
          100: "hsl(225 85% 90%)", // Selected rows, subtle highlights
          200: "hsl(225 80% 82%)", // Hover/pressed bg (non CTA)
          300: "hsl(225 75% 72%)", // Secondary highlights, soft emphasis
          400: "hsl(225 80% 58%)", // Icons, light emphasis, secondary actions

          500: "hsl(225 85% 45%)", // Primary CTA, active controls/states
          DEFAULT: "hsl(225 85% 45%)",
          600: "hsl(225 82% 38%)", // Hover/Pressed CTA (dark theme)
          700: "hsl(225 78% 32%)", // Strong emphasis, dark UI elements, text on light bg

          800: "hsl(225 72% 26%)", // icon/text on light bg
          900: "hsl(225 65% 20%)", // focus rings / outlines
          950: "hsl(225 60% 14%)", // max contrast text

          dark: "hsl(225 92% 58%)", // dark-mode primary
        },
        neutral: {
          50: "hsl(215 20% 97%)",
          100: "hsl(215 18% 94%)",
          200: "hsl(215 16% 88%)",
          300: "hsl(215 14% 78%)",
          400: "hsl(215 13% 60%)",
          500: "hsl(215 14% 50%)",
          600: "hsl(215 16% 38%)",
          700: "hsl(215 18% 24%)",
          800: "hsl(215 22% 18%)",
          900: "hsl(215 28% 12%)",
          950: "hsl(215 35% 5%)",
        },
        secondary: {
          50: "#fff7ed", // Very light orange
          100: "#ffedd5", // Light orange
          200: "#fed7aa", // Soft orange
          300: "#fdba74", // Medium orange
          400: "#fb923c", // Bright orange
          500: "#f97316", // Default Orange
          DEFAULT: "#f97316",
          600: "#ea580c", // Darker orange
          700: "#c2410c", // Even darker orange
          800: "#9a3c1f", // Deep orange
          900: "#7c2d12", // Very dark orange
          dark: "#f97316", // dark-mode secondary
        },
        lunch: {
          light: "hsl(146 100 96)",
          // dark: "hsl(146 43 21)",
          dark: "hsl(38 92 50)",
        },
        dinner: {
          light: "hsl(298 81 94)",
          // dark: "hsl(298 26 22)",
          dark: "hsl(218 20 18)",
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
          light: "#ededed",
          dark: "#282c34",
        },
      },
    },
  },
  plugins: [],
};

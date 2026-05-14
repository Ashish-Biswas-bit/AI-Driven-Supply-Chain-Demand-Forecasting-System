/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e8f4fd",
          100: "#b5d4f4",
          200: "#8fc4e8",
          300: "#5ba8d9",
          400: "#2d8ec7",
          500: "#1a7fc1",
          600: "#1569a3",
          700: "#0f4c81",
          800: "#0b3761",
          900: "#042c53",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

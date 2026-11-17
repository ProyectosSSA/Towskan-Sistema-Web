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
        towskan: {
          orange: {
            50: "#FFF5ED",
            100: "#FFE6D4",
            500: "#FF6B00",
            600: "#E65100",
            700: "#C23E00",
          },
          dark: {
            900: "#1A1A1A",
            800: "#242424",
            700: "#333333",
            500: "#6B7280",
          },
          cream: {
            50: "#FFFDF9",
            100: "#FAF6F0",
            200: "#F3ECE3",
          }
        }
      }
    },
  },
  plugins: [],
};

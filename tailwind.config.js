/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Enables dark mode using a CSS class
  theme: {
    extend: {
      colors: {
        light: {
          background: "#ffffff",
          text: "#333333",
          primary: "#1e40af",
        },
        dark: {
          background: "#121212",
          text: "#f5f5f5",
          primary: "#3b82f6",
        },
      },
    },
  },
  plugins: [],
};

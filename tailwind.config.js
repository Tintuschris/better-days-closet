/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primarycolor: "#460066",
        primarycolorvariant: "rgba(79, 2, 114, 0.56)",
        secondarycolor: "#FC9AE7",
        secondaryvariant: "#FFD6F6",
        warningcolor: "#FF5449"
      },
      borderRadius:{
        primaryradius: "18px"
      },
      fontFamily: {
        sans: ['var(--font-montserrat)'],
        montserrat: ['var(--font-montserrat)'],
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
};
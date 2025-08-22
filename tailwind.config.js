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
      borderWidth: {
        '3': '3px',
        '5': '5px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      minHeight: {
        '44': '44px',
        '48': '48px',
        '52': '52px',
      },
      minWidth: {
        '44': '44px',
        '48': '48px', 
        '52': '52px',
      },
      scale: {
        '105': '1.05',
        '110': '1.10',
      },
      fontFamily: {
        sans: ['var(--font-montserrat)'],
        montserrat: ['var(--font-montserrat)'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      boxShadow: {
        'color-swatch': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'color-swatch-selected': '0 6px 20px rgba(70, 0, 102, 0.3)',
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
};
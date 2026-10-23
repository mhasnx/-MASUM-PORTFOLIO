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
        background: "#0F0C20",
        card: "#16132B",
        popover: "#1A1638",
        primary: "#8B5CF6",
        secondary: "#EC4899",
        accent: "#06B6D4",
        muted: "#30294A",
        "muted-foreground": "#A7A3BC",
      },
    },
  },
  plugins: [],
};
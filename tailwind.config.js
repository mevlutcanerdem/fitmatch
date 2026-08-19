/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0d0f0a",
        surface: "#161911",
        "surface-2": "#1e2216",
        foreground: "#eef2e4",
        muted: "#9aa389",
        accent: "#c6ff3d",
        "accent-ink": "#10140a",
        border: "#2a2f1e",
      },
      borderRadius: {
        card: "20px",
      },
    },
  },
  plugins: [],
};

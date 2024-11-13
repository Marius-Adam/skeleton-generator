/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./*.js"],
  theme: {
    extend: {}
  },

  daisyui: {
    themes: ["light", "dark"]
  },
  plugins: [require("daisyui")]
};

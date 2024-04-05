/** @type {import('tailwindcss').Config} */
export default {
  content: ["./backend/routes/**/*.ejs"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};

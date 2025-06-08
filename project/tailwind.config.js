// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#374151',     // slate-700
          light:   '#4B5563',     // slate-600
          dark:    '#1F2937',     // slate-800
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};

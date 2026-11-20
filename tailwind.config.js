/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: v('paper'),
        'paper-2': v('paper-2'),
        ink: v('ink'),
        'ink-soft': v('ink-soft'),
        rule: v('rule'),
        hebrew: v('hebrew'),
        aramaic: v('aramaic'),
        greek: v('greek'),
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        hebrew: ['"Noto Serif Hebrew"', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
};

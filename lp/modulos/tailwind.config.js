/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@relume_io/relume-ui/dist/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  presets: [require("@relume_io/relume-tailwind")],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#C42C16',
          secondary: '#ffD700',
        },
        border: {
          primary: '#aaaaaa',
        },
        // Mantendo suas cores existentes
        'background-primary': '#ffffff',
        'background-hero': '#C42C16',
        'border-primary': '#C42C16',
        'foreground': '#A72512',
      },
      fontSize: {
        'md': '1rem',
      },
      minHeight: {
        '16': '4rem',
        '18': '4.5rem',
      },
      zIndex: {
        '999': '999',
      }
    },
  },
  plugins: [],
}
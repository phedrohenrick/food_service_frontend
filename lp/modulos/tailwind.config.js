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
          primary: '#ffffff',
          secondary: '#FFC300',
          hero: '#EA1D2C',
          orange: '#FF7F27',
          red2:'#DD3F0C',
          gray: '#F5F5F5',
        },
        border: {
          primary: '#aaaaaa',
        },
        // Mantendo suas cores existentes
        'background-primary': '#ffffff',
        'background-hero': '#EA1D2C',
        'border-primary': '#C42C16',
        'foreground': '#A52A2A',
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
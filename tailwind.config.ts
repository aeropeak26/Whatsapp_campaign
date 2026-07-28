import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefdf4',
          100: '#d5fbe2',
          200: '#aef6cb',
          300: '#75ecaa',
          400: '#38d982',
          500: '#25d366', // WhatsApp Green
          600: '#12b551',
          700: '#118e43',
          800: '#137039',
          900: '#125c31',
          950: '#043419',
        },
      },
    },
  },
  plugins: [],
};
export default config;

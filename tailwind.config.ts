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
        dark: {
          bg: '#0B0F19',
          card: '#111827',
          hover: '#1F2937',
          border: '#374151',
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};
export default config;

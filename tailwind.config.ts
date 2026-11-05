import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gold: {
          50: "#fbf8ee",
          100: "#f5edd4",
          200: "#ebd9a8",
          300: "#dec075",
          400: "#d3a74b",
          500: "#be8b32",
          600: "#a26e27",
          700: "#825123",
          800: "#6d4223",
          900: "#5d3822",
        },
        hq: {
          dark: "#0b0f17",
          card: "#121824",
          border: "#1f293d",
          muted: "#8b98b5",
        }
      },
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;

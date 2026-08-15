/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
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
        lux: {
          dark: "var(--dark-navy)",
          navy: "var(--dark-navy)",
          card: "var(--card-bg)",
          cardHover: "var(--card-bg-hover)",
          cardDark: "var(--card-bg-dark)",
          border: "var(--border-light)",
          borderDark: "var(--border-dark)",
          surface: "var(--surface-bg)",
          bg: "var(--surface-bg)",
          text: {
            DEFAULT: "var(--text-primary)",
            muted: "var(--text-muted)",
            light: "var(--text-light)"
          },
          ocean: {
            DEFAULT: "var(--brand-sky)",
            light: "var(--brand-sky-light)",
            dark: "var(--brand-sky-dark)",
            deep: "var(--brand-sky-deep)",
            soft: "var(--brand-sky-soft)",
            glow: "var(--brand-sky-glow)"
          },
          gold: {
            DEFAULT: "var(--brand-gold)",
            light: "var(--brand-gold-light)",
            dark: "var(--brand-gold-dark)",
          },
          emerald: {
            DEFAULT: "var(--brand-emerald)",
            dark: "var(--brand-emerald-dark)",
            light: "var(--brand-emerald-light)",
            forest: "var(--brand-emerald-forest)"
          },
          blue: {
            DEFAULT: "var(--brand-sky)",
            light: "var(--brand-sky-light)",
            dark: "var(--brand-sky-dark)"
          },
          rwanda: {
            blue: "var(--rwanda-blue)",
            yellow: "var(--rwanda-yellow)",
            green: "var(--rwanda-green)"
          },
          sand: "var(--brand-sky-soft)",
          muted: "var(--text-muted)"
        }
      },
      fontFamily: {
        sans: ["'Google Sans Flex Variable'", "'Google Sans'", "'Google Sans Text'", "system-ui", "-apple-system", "sans-serif"],
        heading: ["'Google Sans Flex Variable'", "'Google Sans'", "'Google Sans Text'", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        'lux-glow': '0 0 25px -5px var(--brand-sky-glow)',
        'lux-ocean': '0 10px 25px -5px var(--brand-sky-glow)',
        'lux-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.2)',
        'lux-card': '0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.03)',
        'lux-card-hover': '0 20px 40px -10px rgba(15, 23, 42, 0.12), 0 8px 12px -3px rgba(15, 23, 42, 0.04)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, var(--brand-sky-light) 0%, var(--brand-sky) 50%, var(--brand-sky-dark) 100%)',
        'ocean-gradient': 'linear-gradient(135deg, var(--brand-sky-light) 0%, var(--brand-sky) 50%, var(--brand-sky-dark) 100%)',
        'ocean-card': 'linear-gradient(145deg, var(--brand-sky) 0%, var(--brand-sky-dark) 100%)',
        'dark-glass': 'linear-gradient(180deg, rgba(11, 27, 54, 0.9) 0%, rgba(11, 27, 54, 0.95) 100%)',
        'light-glass': 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
        'forest-gradient': 'linear-gradient(135deg, var(--brand-emerald-forest) 0%, var(--dark-navy) 100%)',
      }
    },
  },
  plugins: [],
};

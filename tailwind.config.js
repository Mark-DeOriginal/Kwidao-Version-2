module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          canvas: "var(--theme-canvas)",
          surface: "var(--theme-surface)",
          panel: "var(--theme-surface-contrast)",
          primary: "var(--theme-primary)",
          ink: "var(--theme-text-strong)",
          muted: "var(--theme-text-muted)",
          accent: "var(--theme-accent)",
          soft: "var(--theme-soft-accent)",
          border: "var(--theme-border)",
        },
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        mixx: {
          pink: "#FF70D0",
          lavender: "#C5A3FF",
          cyan: "#70E6FF",
          purple: "#8B5CF6",
          "navy-deep": "#0A0E1A",
          navy: "#1A1F35",
          "blue-deep": "#1A1F3F",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "mixx-gradient": "linear-gradient(90deg, #FF70D0 0%, #C5A3FF 50%, #70E6FF 100%)",
        "mixx-gradient-vertical": "linear-gradient(180deg, #FF70D0 0%, #C5A3FF 50%, #70E6FF 100%)",
        "mixx-glow": "radial-gradient(circle, rgba(255,112,208,0.3) 0%, rgba(197,163,255,0.2) 50%, rgba(112,230,255,0.3) 100%)",
      },
      boxShadow: {
        "mixx-glow-pink": "0 0 20px rgba(255,112,208,0.5), 0 0 40px rgba(255,112,208,0.3)",
        "mixx-glow-cyan": "0 0 20px rgba(112,230,255,0.5), 0 0 40px rgba(112,230,255,0.3)",
        "mixx-glow": "0 0 20px rgba(255,112,208,0.4), 0 0 40px rgba(197,163,255,0.3), 0 0 60px rgba(112,230,255,0.4)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(263 70% 63% / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(263 70% 63% / 0.6)" },
        },
        "swipe-card": {
          "0%": { transform: "translateX(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateX(120%) rotate(15deg)", opacity: "0" },
        },
        "swipe-card-left": {
          "0%": { transform: "translateX(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateX(-120%) rotate(-15deg)", opacity: "0" },
        },
        "coin-flip": {
          "0%": { transform: "rotateY(0deg) translateY(0)" },
          "50%": { transform: "rotateY(180deg) translateY(-20px)" },
          "100%": { transform: "rotateY(360deg) translateY(0)" },
        },
        "pulse-opportunity": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.8" },
        },
        "level-up": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "50%": { transform: "scale(1.2)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "float-badge": {
          "0%": { transform: "translateY(0px) rotate(-3deg)" },
          "50%": { transform: "translateY(-15px) rotate(3deg)" },
          "100%": { transform: "translateY(0px) rotate(-3deg)" },
        },
        "slide-up-fade": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "confetti": {
          "0%": { transform: "translateY(-100%) scale(0)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(100vh) scale(1)", opacity: "0" },
        },
        "shake-gentle": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        bloom: {
          "0%": { transform: "scale(0.95)", filter: "brightness(1)" },
          "50%": { transform: "scale(1.05)", filter: "brightness(1.2)" },
          "100%": { transform: "scale(1)", filter: "brightness(1)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.85", filter: "brightness(1.2)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "swipe-card": "swipe-card 0.5s ease-out forwards",
        "swipe-card-left": "swipe-card-left 0.5s ease-out forwards",
        "coin-flip": "coin-flip 0.8s ease-in-out",
        "pulse-opportunity": "pulse-opportunity 2s ease-in-out infinite",
        "level-up": "level-up 0.6s ease-out",
        "float-badge": "float-badge 3s ease-in-out infinite",
        "slide-up-fade": "slide-up-fade 0.4s ease-out",
        confetti: "confetti 3s ease-out forwards",
        "shake-gentle": "shake-gentle 0.5s ease-in-out",
        "pulse-ring": "pulse-ring 1.5s ease-out infinite",
        bloom: "bloom 0.8s ease-in-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

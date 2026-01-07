import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
      'ultra': '2560px',
      '4k': '3840px',
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        "3xl": "4rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
        "3xl": "1600px",
        ultra: "1800px",
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
          ember: "hsl(15 95% 58%)",
          "ember-glow": "hsl(25 100% 65%)",
          purple: "hsl(280 75% 55%)",
          teal: "hsl(185 90% 52%)",
          gold: "hsl(45 100% 60%)",
          midnight: "hsl(245 35% 4%)",
          "midnight-light": "hsl(245 30% 8%)",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
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
        "glass-shine": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.05) 100%)",
        "glass-reflect": "linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, transparent 50%)",
        "glass-refraction": "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.06) 100%)",
        "glass-ember-glow": "radial-gradient(circle at 50% 0%, rgba(255,120,80,0.15), transparent 70%)",
        "glass-depth": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
      },
      boxShadow: {
        "mixx-glow-pink": "0 0 20px rgba(255,112,208,0.5), 0 0 40px rgba(255,112,208,0.3)",
        "mixx-glow-cyan": "0 0 20px rgba(112,230,255,0.5), 0 0 40px rgba(112,230,255,0.3)",
        "mixx-glow": "0 0 20px rgba(255,112,208,0.4), 0 0 40px rgba(197,163,255,0.3), 0 0 60px rgba(112,230,255,0.4)",
        "glass-sm": "0 4px 16px rgba(15, 17, 33, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        "glass": "0 8px 32px rgba(15, 17, 33, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        "glass-lg": "0 16px 64px rgba(15, 17, 33, 0.45), inset 0 2px 0 rgba(255, 255, 255, 0.1)",
        "glass-xl": "0 24px 80px rgba(15, 17, 33, 0.5), 0 8px 32px rgba(255, 112, 208, 0.15)",
        "glass-glow": "0 0 40px rgba(255, 120, 80, 0.25), 0 12px 48px rgba(255, 112, 80, 0.2)",
        "glass-inner": "inset 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      backdropSaturate: {
        150: '150%',
        170: '170%',
        180: '180%',
        190: '190%',
        200: '200%',
        220: '220%',
      },
      keyframes: {
        // UI Interactions - Fast & Responsive
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        
        // Float & Ambient - Relaxed & Natural
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "float-badge": {
          "0%, 100%": { transform: "translateY(0px) rotate(-2deg)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
        
        // Glow Effects - Mesmerizing
        "pulse-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 20px hsl(15 95% 58% / 0.4)",
            filter: "brightness(1)"
          },
          "50%": { 
            boxShadow: "0 0 40px hsl(15 95% 58% / 0.6)",
            filter: "brightness(1.1)"
          },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.9", filter: "brightness(1.15)" },
        },
        
        // Interactive - Snappy & Playful
        "swipe-card": {
          "0%": { transform: "translateX(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateX(120%) rotate(12deg)", opacity: "0" },
        },
        "swipe-card-left": {
          "0%": { transform: "translateX(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateX(-120%) rotate(-12deg)", opacity: "0" },
        },
        "coin-flip": {
          "0%": { transform: "rotateY(0deg) translateY(0)" },
          "50%": { transform: "rotateY(180deg) translateY(-16px)" },
          "100%": { transform: "rotateY(360deg) translateY(0)" },
        },
        "shake-gentle": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
        
        // Success & Celebration - Energetic
        "pulse-opportunity": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.03)", opacity: "0.9" },
        },
        "level-up": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "50%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        bloom: {
          "0%": { transform: "scale(0.97)", filter: "brightness(1)" },
          "50%": { transform: "scale(1.03)", filter: "brightness(1.15)" },
          "100%": { transform: "scale(1)", filter: "brightness(1)" },
        },
        confetti: {
          "0%": { transform: "translateY(-100%) scale(0) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(100vh) scale(1) rotate(720deg)", opacity: "0" },
        },
        
        // Notifications - Attention Grabbing
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.8" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
        "slide-up-fade": {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        // UI Interactions - 150-250ms for instant feedback
        "accordion-down": "accordion-down 0.2s cubic-bezier(0.32, 0.72, 0, 1)",
        "accordion-up": "accordion-up 0.2s cubic-bezier(0.32, 0.72, 0, 1)",
        
        // Ambient Float - Slow & Natural (4-6s)
        float: "float 5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float-badge": "float-badge 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        
        // Glow Effects - Medium Pace (2-3s)
        "pulse-glow": "pulse-glow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glow-pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        
        // Interactive Gestures - Quick (300-500ms)
        "swipe-card": "swipe-card 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards",
        "swipe-card-left": "swipe-card-left 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards",
        "coin-flip": "coin-flip 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "shake-gentle": "shake-gentle 0.4s cubic-bezier(0.36, 0, 0.66, -0.56)",
        
        // Success States - Bouncy (400-600ms)
        "pulse-opportunity": "pulse-opportunity 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "level-up": "level-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        bloom: "bloom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        
        // Celebrations - Extended (2-3s)
        confetti: "confetti 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        
        // Notifications - Fast Attention (1-1.5s)
        "pulse-ring": "pulse-ring 1.2s cubic-bezier(0.16, 1, 0.3, 1) infinite",
        "slide-up-fade": "slide-up-fade 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0a0f",
          secondary: "#12121a",
          tertiary: "#1a1a2e",
          card: "#0f0f1a",
        },
        accent: {
          blue: "#00d4ff",
          purple: "#7c3aed",
          "blue-dim": "#00d4ff33",
          "purple-dim": "#7c3aed33",
        },
        risk: {
          low: "#10b981",
          medium: "#f59e0b",
          high: "#ef4444",
          "low-dim": "#10b98120",
          "medium-dim": "#f59e0b20",
          "high-dim": "#ef444420",
        },
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#00d4ff",
          600: "#7c3aed",
          900: "#0a0a0f",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #00d4ff, #7c3aed)",
        "gradient-card": "linear-gradient(135deg, rgba(0,212,255,0.05), rgba(124,58,237,0.05))",
        "gradient-hero": "radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a0f 70%)",
        "grid-pattern": "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "60px 60px",
      },
      boxShadow: {
        "glow-blue": "0 0 30px rgba(0, 212, 255, 0.15), 0 0 60px rgba(0, 212, 255, 0.05)",
        "glow-purple": "0 0 30px rgba(124, 58, 237, 0.15), 0 0 60px rgba(124, 58, 237, 0.05)",
        "glow-green": "0 0 20px rgba(16, 185, 129, 0.2)",
        "glow-red": "0 0 20px rgba(239, 68, 68, 0.2)",
        "glow-amber": "0 0 20px rgba(245, 158, 11, 0.2)",
        "card": "0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 4px rgba(0, 0, 0, 0.2)",
        "card-hover": "0 8px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 212, 255, 0.1)",
      },
      borderColor: {
        glass: "rgba(255, 255, 255, 0.08)",
        "glass-hover": "rgba(0, 212, 255, 0.3)",
      },
      backdropBlur: {
        xs: "4px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "count-up": "countUp 1s ease-out forwards",
        "shimmer": "shimmer 2s linear infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 40px rgba(0, 212, 255, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
    },
  },
  plugins: [],
} satisfies Config;

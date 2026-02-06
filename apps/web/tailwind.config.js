/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        "primary-dark": "#2563eb",
        "primary-light": "#60a5fa",
        "bg-primary": "#0f172a",
        "bg-secondary": "#1e293b",
        "bg-tertiary": "#334155",
        "text-primary": "#f1f5f9",
        "text-secondary": "#cbd5e1",
        "text-muted": "#94a3b8",
        border: "#475569",
        danger: "#ef4444",
        success: "#10b981",
        warning: "#f59e0b",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        spin: "spin 1s linear infinite",
        fadeIn: "fadeIn 0.3s ease-in-out",
        slideInUp: "slideInUp 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideInUp: {
          from: {
            transform: "translateY(10px)",
            opacity: "0",
          },
          to: {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
      },
    },
  },
  plugins: [],
};

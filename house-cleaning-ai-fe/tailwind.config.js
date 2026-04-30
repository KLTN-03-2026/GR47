/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      "sans": ["Manrope", "sans-serif"],
    },
    colors: {
      "transparent": "transparent",
      "current": "currentColor",
      "white": "#ffffff",
      "black": "#000000",
      "tertiary": "#ac2452",
      "surface-container-low": "#f3f4f5",
      "surface-container-high": "#e7e8e9",
      "on-secondary-fixed": "#002106",
      "inverse-primary": "#5ae070",
      "surface-bright": "#f8f9fa",
      "inverse-on-surface": "#f0f1f2",
      "inverse-surface": "#2e3132",
      "primary-container": "#008731",
      "on-primary-fixed-variant": "#00531b",
      "surface-variant": "#e1e3e4",
      "outline": "#6d7b6b",
      "error-container": "#ffdad6",
      "tertiary-fixed": "#ffd9df",
      "surface-container-lowest": "#ffffff",
      "on-tertiary-container": "#fffbff",
      "surface": "#f8f9fa",
      "on-secondary": "#ffffff",
      "surface-dim": "#d9dadb",
      "secondary": "#346a39",
      "on-primary-fixed": "#002106",
      "primary": "#006b25",
      "surface-container": "#edeeef",
      "on-secondary-fixed-variant": "#1b5124",
      "on-tertiary-fixed": "#3f0017",
      "on-surface-variant": "#3d4a3c",
      "on-surface": "#191c1d",
      "on-primary": "#ffffff",
      "primary-fixed-dim": "#5ae070",
      "on-secondary-container": "#396e3d",
      "on-error-container": "#93000a",
      "primary-fixed": "#78fd89",
      "on-error": "#ffffff",
      "secondary-fixed": "#b6f1b4",
      "secondary-container": "#b3eeb1",
      "surface-container-highest": "#e1e3e4",
      "outline-variant": "#bccbb8",
      "secondary-fixed-dim": "#9ad59a",
      "tertiary-fixed-dim": "#ffb1c0",
      "on-tertiary": "#ffffff",
      "tertiary-container": "#cd3f6a",
      "on-primary-container": "#f7fff2",
      "on-background": "#191c1d",
      "surface-tint": "#006e26",
      "error": "#ba1a1a",
      "background": "#f8f9fa",
      "on-tertiary-fixed-variant": "#8f053d"
    },
    extend: {
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "bounce-custom": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-in",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "shake": "shake 0.5s ease-in-out",
        "float": "float 3s ease-in-out infinite",
        "bounce-custom": "bounce-custom 2s infinite"
      }
    },
  },
  plugins: [
    function({ addComponents, theme }) {
      addComponents({
        // ============================================
        // PRIMARY BUTTON VARIANTS
        // ============================================
        ".btn-primary-green": {
          "@apply px-8 py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 active:scale-95 transition-all hover:bg-green-700": {}
        },
        ".btn-primary-green-full": {
          "@apply w-full bg-green-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-green-200 hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2": {}
        },
        ".btn-primary-blue": {
          "@apply w-full py-3.5 bg-blue-600 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20": {}
        },
        ".btn-primary-green-sm": {
          "@apply px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2": {}
        },
        ".btn-primary-green-lg": {
          "@apply w-full py-4 bg-green-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-green-700 active:scale-[0.98] transition-all shadow-lg shadow-green-200": {}
        },
        ".btn-primary-blue-lg": {
          "@apply w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200": {}
        },
        ".btn-primary-dark": {
          "@apply bg-slate-900 text-white px-5 py-3.5 rounded-[1rem] group-hover:bg-green-600 transition-all shadow-md flex items-center gap-2 text-sm font-black active:scale-95": {}
        },

        // ============================================
        // SECONDARY BUTTON VARIANTS
        // ============================================
        ".btn-secondary-white": {
          "@apply bg-white text-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all border border-gray-200 shadow-sm flex items-center gap-2": {}
        },
        ".btn-secondary-light-blue": {
          "@apply inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-bold transition-colors": {}
        },

        // ============================================
        // STATUS BADGES
        // ============================================
        ".badge-status-orange": {
          "@apply inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest rounded-full": {}
        },
        ".badge-status-blue": {
          "@apply inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full": {}
        },
        ".badge-status-emerald": {
          "@apply inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full": {}
        },
        ".badge-status-red": {
          "@apply inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-full": {}
        },
        ".badge-status-gray": {
          "@apply flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl border border-gray-200": {}
        },

        // ============================================
        // COLORED BADGES (Alternative)
        // ============================================
        ".badge-colored": {
          "@apply px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider": {}
        },
        ".badge-yellow": {
          "@apply badge-colored bg-yellow-100 text-yellow-700 border-yellow-200": {}
        },
        ".badge-blue": {
          "@apply badge-colored bg-blue-100 text-blue-700 border-blue-200": {}
        },
        ".badge-emerald": {
          "@apply badge-colored bg-emerald-100 text-emerald-700 border-emerald-200": {}
        },

        // ============================================
        // FORM INPUTS
        // ============================================
        ".input-admin": {
          "@apply w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold text-slate-900 transition-all": {}
        },
        ".input-client": {
          "@apply w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none text-sm font-bold text-gray-900 transition-all": {}
        },
        ".input-form": {
          "@apply w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 hover:border-gray-300 outline-none transition-all duration-200 text-sm": {}
        },
        ".input-simple": {
          "@apply w-full py-3 px-4 bg-gray-100 outline-none rounded": {}
        },

        // ============================================
        // CARD/CONTAINER STYLES
        // ============================================
        ".card-white": {
          "@apply bg-white rounded-2xl p-5 border border-slate-200 shadow-sm": {}
        },
        ".card-panel": {
          "@apply bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden": {}
        },
        ".card-white-large": {
          "@apply bg-white rounded-3xl p-8 border border-gray-100 shadow-sm": {}
        },
        ".card-interactive": {
          "@apply bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-300 hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden cursor-pointer flex flex-col h-full": {}
        },
        ".card-header": {
          "@apply flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4": {}
        },

        // ============================================
        // ALERT/NOTIFICATION STYLES
        // ============================================
        ".alert-error": {
          "@apply p-4 rounded-xl flex items-center gap-3 text-sm font-bold shadow-sm border bg-red-50 border-red-200 text-red-600 animate-shake": {}
        },
        ".alert-info": {
          "@apply p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 text-blue-700 text-sm font-medium": {}
        },
        ".alert-success": {
          "@apply p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-700 font-bold text-sm": {}
        },

        // ============================================
        // ICON BADGES
        // ============================================
        ".icon-badge-green": {
          "@apply w-9 h-9 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold border border-green-200 shadow-sm": {}
        },
        ".icon-badge-white": {
          "@apply w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center shadow-sm": {}
        },
        ".icon-box-feature": {
          "@apply w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 text-green-600 mb-6 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-300": {}
        },

        // ============================================
        // BACKGROUND GRADIENTS
        // ============================================
        ".bg-gradient-green": {
          "@apply bg-gradient-to-br from-green-600 to-green-800 rounded-2xl text-white shadow-xl shadow-green-900/10": {}
        },
        ".bg-decoration-blur": {
          "@apply absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out": {}
        },

        // ============================================
        // HOVER & INTERACTIVE UTILITIES
        // ============================================
        ".hover-link-green": {
          "@apply px-4 py-3 text-gray-600 font-medium hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors": {}
        },
        ".hover-icon-green": {
          "@apply p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all": {}
        },

        // ============================================
        // LAYOUT UTILITIES
        // ============================================
        ".flex-between-center": {
          "@apply flex justify-between items-center": {}
        },
        ".sticky-header": {
          "@apply sticky top-0 z-50 w-full bg-white border-b border-gray-100": {}
        },
        ".container-responsive": {
          "@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8": {}
        },
      });
    }
  ],
}

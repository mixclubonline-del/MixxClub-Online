import React from "react";
import { motion } from "framer-motion";
import { usePrime } from "../contexts/PrimeContext";
import { Link } from "react-router-dom";

const modules = [
  { name: "Artist", route: "/artist", icon: "🎤" },
  { name: "Engineer", route: "/engineer", icon: "🎧" },
  { name: "AI Studio", route: "/ai-studio", icon: "🤖" },
  { name: "Arena", route: "/arena", icon: "🏆" },
  { name: "Marketplace", route: "/marketplace", icon: "🛒" },
  { name: "Pulse", route: "/pulse", icon: "💠" },
];

export default function NetworkHub() {
  const { systemMode, userMood } = usePrime();

  return (
    <div className="relative w-full min-h-screen bg-[hsl(235,60%,8%)] overflow-hidden flex flex-col items-center justify-center text-white">

      {/* --- Background Glow + AI Pulse Wave --- */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(265,85%,15%)_0%,_hsl(235,60%,8%)_100%)]" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 bottom-1/3 h-[2px] bg-gradient-to-r from-[hsl(265,85%,65%)] via-[hsl(195,100%,60%)] to-[hsl(265,85%,65%)] animate-[gradient-shift_6s_linear_infinite]" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-1/3 w-2 h-2 rounded-full bg-[hsl(265,85%,65%)] animate-pulse" />
      </div>

      {/* --- Prime Status (Top Right) --- */}
      <div
        className={`fixed top-6 right-8 text-xs font-mono tracking-tight transition-all ${
          userMood === "energetic" || userMood === "bright"
            ? "text-[hsl(265,85%,65%)] drop-shadow-glow"
            : "text-gray-400"
        }`}
      >
        PRIME • {systemMode}
      </div>

      {/* --- Hub Core --- */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <div className="relative mb-8">
          {/* Infinity Logo */}
          <svg width="120" height="60" viewBox="0 0 200 100" fill="none" className="animate-pulse-glow">
            <path
              d="M20 50c0-16 12-30 28-30s28 14 28 30-12 30-28 30-28-14-28-30zM124 20c16 0 28 14 28 30s-12 30-28 30-28-14-28-30 12-30 28-30zM48 50h76"
              stroke="url(#grad1)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="grad1" x1="0" y1="0" x2="200" y2="0">
                <stop offset="0%" stopColor="hsl(265,85%,65%)" />
                <stop offset="100%" stopColor="hsl(195,100%,60%)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className="text-4xl font-bold tracking-tight drop-shadow-glow mb-2">MixClub Core</h1>
        <p className="text-sm text-gray-400">The Living Network. Powered by Prime.</p>
      </motion.div>

      {/* --- Module Grid --- */}
      <div className="relative z-10 mt-14 grid grid-cols-2 sm:grid-cols-3 gap-8 w-[90%] max-w-5xl">
        {modules.map((mod, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="glass rounded-xl p-8 text-center cursor-pointer shadow-[var(--shadow-glass)] hover:shadow-[var(--shadow-glass-lg)] transition-all"
          >
            <Link to={mod.route}>
              <div className="text-4xl mb-3">{mod.icon}</div>
              <p className="text-lg font-semibold">{mod.name}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* --- Subtle ambient glow --- */}
      <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-[hsl(265,85%,15%/0.4)] via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

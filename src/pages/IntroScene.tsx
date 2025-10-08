import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function IntroScene() {
  const [showHub, setShowHub] = useState(false);
  const [logIndex, setLogIndex] = useState(0);
  const navigate = useNavigate();

  const logs = [
    "PrimeBot: Initializing creative systems...",
    "Loading AI engines and neural mix modules...",
    "Syncing artists, engineers, and collaboration zones...",
    "Welcome to Mixxclub.",
  ];

  useEffect(() => {
    if (logIndex < logs.length - 1) {
      const timer = setTimeout(() => setLogIndex(logIndex + 1), 1800);
      return () => clearTimeout(timer);
    }
  }, [logIndex, logs.length]);

  useEffect(() => {
    if (showHub) {
      navigate("/network");
    }
  }, [showHub, navigate]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[radial-gradient(ellipse_at_center,_hsl(265,85%,8%)_0%,_hsl(235,60%,6%)_100%)] text-white flex flex-col items-center justify-center">
      {/* Floating background fog animation */}
      <div 
        className="absolute inset-0 opacity-40 animate-[gradient-shift_10s_linear_infinite]" 
        style={{ background: "linear-gradient(135deg, hsl(265,85%,65%/0.2), hsl(195,100%,60%/0.1), hsl(265,85%,75%/0.15))" }} 
      />

      {/* Center content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative text-center z-10"
      >
        {/* Infinity Logo Glow */}
        <div className="mx-auto mb-6 animate-pulse-glow">
          <svg width="120" height="60" viewBox="0 0 200 100" fill="none">
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

        <h1 className="text-5xl font-bold tracking-tight drop-shadow-glow mb-3">Mixxclub Online</h1>
        <p className="text-lg text-gray-300">Powered by Prime</p>

        {/* Subtle waveform pulse */}
        <div className="w-48 h-[2px] mx-auto mt-6 bg-gradient-to-r from-[hsl(265,85%,65%)] via-[hsl(195,100%,60%)] to-[hsl(265,85%,65%)] animate-[gradient-shift_3s_linear_infinite]" />

        {/* Boot log lines */}
        <div className="mt-10 text-sm text-gray-400 font-mono space-y-1 animate-fade-in min-h-[100px]">
          {logs.slice(0, logIndex + 1).map((line, i) => (
            <motion.p 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* Enter Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowHub(true)}
          className="mt-12 px-8 py-3 rounded-full bg-gradient-to-r from-[hsl(265,85%,65%)] to-[hsl(195,100%,60%)] text-white font-semibold shadow-lg shadow-[hsl(265,85%,65%)/0.3] hover:shadow-[hsl(195,100%,60%)/0.5] transition-all"
        >
          Enter the Network
        </motion.button>
      </motion.div>

      {/* Footer Reflection */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

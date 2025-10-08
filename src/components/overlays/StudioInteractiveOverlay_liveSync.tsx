import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudioState } from "@/context/StudioStateContext";

interface Zone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const zoneLabels: Record<string, string> = {
  "menu-bar": "Menu / Transport Bar",
  "waveform-strip": "Waveform Analyzer",
  "ai-mixer": "AI Mixer",
  "mixxport": "MixxPort",
  "primebot-4": "PrimeBot 4.0",
  "mixer-console": "Mixer Console",
};

const StudioInteractiveOverlay: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isPlaying, masterVolume, aiActive, primeTalking } = useStudioState();

  useEffect(() => {
    fetch("/assets/mixxstudio-overlay-grid.json")
      .then((res) => res.json())
      .then((data) => setZones(data.zones))
      .catch((err) => console.error("Failed to load overlay grid:", err));
  }, []);

  const handleZoneClick = (id: string) => {
    switch (id) {
      case "menu-bar":
        console.log("Menu clicked");
        break;
      case "ai-mixer":
        navigate("/ai-studio");
        break;
      case "mixxport":
        navigate("/plugins");
        break;
      case "primebot-4":
        navigate("/assistant");
        break;
      case "mixer-console":
        document.querySelector("#mixx-mixer")?.scrollIntoView({ behavior: "smooth" });
        break;
      default:
        console.log("Clicked:", id);
    }
  };

  const getZoneGlow = (id: string) => {
    if (id === "ai-mixer" && aiActive) return "animate-glow-pulse";
    if (id === "mixxport" && isPlaying) return "animate-wave-glow";
    if (id === "primebot-4" && primeTalking) return "animate-talk-pulse";
    if (id === "mixer-console" && masterVolume > 0.8) return "animate-clip-flash";
    if (id === "menu-bar" && isPlaying) return "animate-flicker";
    return "";
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Removed background image - showing actual components instead */}

      {hoveredZone && (
        <div
          className="absolute px-4 py-1 rounded-full text-sm font-semibold text-white bg-black/60 border border-primary/40 shadow-[0_0_20px_rgba(167,139,250,0.8)] backdrop-blur-md pointer-events-none select-none animate-fade-in"
          style={{ left: "50%", top: "5%", transform: "translateX(-50%)" }}
        >
          {zoneLabels[hoveredZone] || hoveredZone}
        </div>
      )}

      {zones.map((z) => (
        <button
          key={z.id}
          className={`absolute rounded-xl border border-transparent transition-all duration-300 group focus:outline-none pointer-events-auto ${getZoneGlow(z.id)}`}
          style={{
            left: `${(z.x / 1920) * 100}%`,
            top: `${(z.y / 1080) * 100}%`,
            width: `${(z.width / 1920) * 100}%`,
            height: `${(z.height / 1080) * 100}%`,
          }}
          onMouseEnter={() => setHoveredZone(z.id)}
          onMouseLeave={() => setHoveredZone(null)}
          onClick={() => handleZoneClick(z.id)}
          aria-label={z.id}
        >
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-primary/20 border-2 border-primary/60"></div>
        </button>
      ))}

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white/40 bg-black/30 rounded-full px-4 py-1 backdrop-blur-md pointer-events-none">
        Hover to explore • Live zones react to your mix
      </div>
    </div>
  );
};

export default StudioInteractiveOverlay;

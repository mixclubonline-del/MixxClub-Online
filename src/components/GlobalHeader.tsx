import { Link } from "react-router-dom";

export default function GlobalHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 h-16 bg-[hsl(var(--card)/0.5)] backdrop-blur-xl border-b border-[hsl(var(--border)/0.4)]">
      <Link to="/" className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))]">
        Mixx Club
      </Link>
      <nav className="flex gap-4 text-sm">
        <Link to="/artist" className="hover:text-[hsl(var(--primary))] transition-colors">
          Artist
        </Link>
        <Link to="/engineer" className="hover:text-[hsl(var(--primary))] transition-colors">
          Engineer
        </Link>
        <Link to="/ai-studio" className="hover:text-[hsl(var(--primary))] transition-colors">
          AI Studio
        </Link>
        <Link to="/pulse" className="hover:text-[hsl(var(--primary))] transition-colors">
          The Pulse
        </Link>
        <Link to="/arena" className="hover:text-[hsl(var(--primary))] transition-colors">
          Mixx Arena
        </Link>
        <Link to="/crowd" className="hover:text-[hsl(var(--primary))] transition-colors">
          The Crowd
        </Link>
        <Link to="/marketplace" className="hover:text-[hsl(var(--primary))] transition-colors">
          Marketplace
        </Link>
        <Link 
          to="/network" 
          className="px-3 py-1 rounded-full text-foreground bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))] hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] transition-all"
        >
          Enter Hub
        </Link>
      </nav>
    </header>
  );
}

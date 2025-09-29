import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, User } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center group-hover:scale-110 transition-transform">
            <Music className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            MixClubOnline
          </span>
        </Link>

        {isHome ? (
          <div className="flex items-center gap-8">
            <a href="#services" className="text-sm hover:text-primary transition-colors">
              Services
            </a>
            <a href="#preview" className="text-sm hover:text-primary transition-colors">
              Demos
            </a>
            <a href="#pricing" className="text-sm hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="#contact" className="text-sm hover:text-primary transition-colors">
              Contact
            </a>
            <Link to="/auth">
              <Button variant="default" size="sm" className="gap-2">
                <User className="w-4 h-4" />
                Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <Link to="/">
            <Button variant="ghost" size="sm">
              Back to Home
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

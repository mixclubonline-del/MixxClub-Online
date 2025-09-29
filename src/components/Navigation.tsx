import { Button } from "@/components/ui/button";
import { Menu, Sparkles } from "lucide-react";
import { useState } from "react";
import robotLogo from "@/assets/mixclub-robot-logo.png";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={robotLogo} alt="MixClub AI" className="w-10 h-10" />
            <span className="text-xl font-bold">
              MixClub <span className="text-primary">Online</span>
            </span>
          </Link>

          {isHome ? (
            <>
              <div className="hidden md:flex items-center gap-8">
                <a href="/ai-studio" className="text-foreground hover:text-primary transition-colors">
                  AI Studio
                </a>
                <a href="/mixing" className="text-foreground hover:text-primary transition-colors">
                  Mixing
                </a>
                <a href="/mastering" className="text-foreground hover:text-primary transition-colors">
                  Mastering
                </a>
                <a href="/auth">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </a>
                <a href="/auth?mode=signup">
                  <Button size="sm" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Start Free
                  </Button>
                </a>
              </div>

              <button
                className="md:hidden"
                onClick={() => setIsOpen(!isOpen)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </>
          ) : (
            <Link to="/">
              <Button variant="ghost" size="sm">
                Back to Home
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu */}
        {isOpen && isHome && (
          <div className="md:hidden mt-4 space-y-4">
            <a href="/ai-studio" className="block text-foreground hover:text-primary transition-colors">
              AI Studio
            </a>
            <a href="/mixing" className="block text-foreground hover:text-primary transition-colors">
              Mixing
            </a>
            <a href="/mastering" className="block text-foreground hover:text-primary transition-colors">
              Mastering
            </a>
            <a href="/auth">
              <Button variant="ghost" size="sm" className="w-full">
                Login
              </Button>
            </a>
            <a href="/auth?mode=signup">
              <Button size="sm" className="w-full gap-2">
                <Sparkles className="w-4 h-4" />
                Start Free
              </Button>
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

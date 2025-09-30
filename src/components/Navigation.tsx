import { Button } from "@/components/ui/button";
import { Menu, Sparkles } from "lucide-react";
import { useState } from "react";
import mixclub3DLogo from "@/assets/mixclub-3d-logo.png";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { RealTimeNotifications } from "./RealTimeNotifications";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={mixclub3DLogo} alt="MixClub 3D Logo" className="w-12 h-9 object-contain" />
            <span className="text-xl font-bold">
              MixClub <span className="text-primary">Online</span>
            </span>
          </Link>

          {isHome ? (
            <>
              <div className="hidden md:flex items-center gap-8">
                <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link to="/mixing" className="text-foreground hover:text-primary transition-colors">
                  Mixing
                </Link>
                <Link to="/mastering" className="text-foreground hover:text-primary transition-colors">
                  Mastering
                </Link>
                {user && (
                  <>
                    <Link to="/artist-crm" className="text-foreground hover:text-primary transition-colors">
                      Artist CRM
                    </Link>
                    <Link to="/engineer-crm" className="text-foreground hover:text-primary transition-colors">
                      Engineer CRM
                    </Link>
                  </>
                )}
                {user ? (
                  <Button onClick={signOut} variant="ghost" size="sm">
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button variant="ghost" size="sm">
                        Login
                      </Button>
                    </Link>
                    <Link to="/auth?mode=signup">
                      <Button size="sm" className="gap-2">
                        <Sparkles className="w-4 h-4" />
                        Start Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <button
                className="md:hidden"
                onClick={() => setIsOpen(!isOpen)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <RealTimeNotifications userId={user.id} />
                    <Link to="/dashboard">
                      <Button variant="ghost" size="sm">Dashboard</Button>
                    </Link>
                    <Link to="/jobs">
                      <Button variant="ghost" size="sm">Job Board</Button>
                    </Link>
                    <Link to="/mixing">
                      <Button variant="ghost" size="sm">Studio</Button>
                    </Link>
                    <Button onClick={signOut} variant="outline" size="sm">
                      Sign Out
                    </Button>
                  </>
                ) : (
                <>
                  <Link to="/">
                    <Button variant="ghost" size="sm">Home</Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/auth?mode=signup">
                    <Button size="sm" className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {isOpen && isHome && (
          <div className="md:hidden mt-4 space-y-4">
            <Link to="/dashboard" className="block text-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/mixing" className="block text-foreground hover:text-primary transition-colors">
              Mixing
            </Link>
            <Link to="/mastering" className="block text-foreground hover:text-primary transition-colors">
              Mastering
            </Link>
            {user && (
              <>
                <Link to="/artist-crm" className="block text-foreground hover:text-primary transition-colors">
                  Artist CRM
                </Link>
                <Link to="/engineer-crm" className="block text-foreground hover:text-primary transition-colors">
                  Engineer CRM
                </Link>
              </>
            )}
            {user ? (
              <Button onClick={signOut} variant="ghost" size="sm" className="w-full">
                Sign Out
              </Button>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button size="sm" className="w-full gap-2">
                    <Sparkles className="w-4 h-4" />
                    Start Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

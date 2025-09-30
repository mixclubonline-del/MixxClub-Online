import { Button } from "@/components/ui/button";
import { Menu, Sparkles, X } from "lucide-react";
import { useState, useEffect } from "react";
import mixclub3DLogo from "@/assets/mixclub-3d-logo.png";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { RealTimeNotifications } from "./RealTimeNotifications";
import { isFeatureEnabled } from "@/config/featureFlags";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Role-specific navigation
  const getNavLinks = () => {
    if (!user) {
      return [
        { to: "/mixing", label: "Mixing Magic" },
        { to: "/mastering", label: "Mastering Polish" },
      ];
    }

    if (userRole === 'engineer') {
      return [
        { to: "/engineer-dashboard", label: "Dashboard" },
        { to: "/artist-crm", label: "My Studio" },
        { to: "/engineer-crm", label: "Pro Studio" },
      ];
    }

    // Artists and clients
    return [
      { to: "/artist-dashboard", label: "Dashboard" },
      { to: "/mixing", label: "Mixing Magic" },
      { to: "/mastering", label: "Mastering Polish" },
      ...(isFeatureEnabled('THE_LAB_ENABLED') ? [{ to: "/hybrid-daw", label: "The Lab" }] : []),
    ];
  };

  const navLinks = getNavLinks();

  const isActiveRoute = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-background/90 backdrop-blur-md border-b border-border/50 shadow-lg' 
        : 'bg-background/95 backdrop-blur border-b border-border'
    }`}>
      <div className="container px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img 
                src={mixclub3DLogo} 
                alt="MixClub 3D Logo" 
                className="w-12 h-9 object-contain relative z-10 transition-transform duration-300 group-hover:rotate-3" 
              />
            </div>
            <span className="font-bold text-xl group-hover:text-primary transition-colors duration-300">
              MixClub <span className="text-primary">Online</span>
            </span>
          </Link>

          {isHome ? (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative text-foreground hover:text-primary transition-all duration-300 font-medium ${
                      isActiveRoute(link.to) ? 'text-primary' : ''
                    }`}
                  >
                    {link.label}
                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300 ${
                      isActiveRoute(link.to) ? 'scale-x-100' : 'scale-x-0 hover:scale-x-100'
                    }`}></span>
                  </Link>
                ))}

                {user ? (
                  <Button 
                    onClick={signOut} 
                    variant="ghost" 
                    size="sm"
                    className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
                  >
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/auth?mode=signup">
                      <Button 
                        size="sm" 
                        className="gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
                      >
                        <Sparkles className="w-4 h-4" />
                        Start Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-all duration-300"
                onClick={() => setIsOpen(!isOpen)}
              >
                <div className="relative w-6 h-6">
                  <Menu className={`w-6 h-6 absolute transition-all duration-300 ${isOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
                  <X className={`w-6 h-6 absolute transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
                </div>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <RealTimeNotifications userId={user.id} />
                  <Link to="/dashboard">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    >
                      Dashboard
                    </Button>
                  </Link>
                   {isFeatureEnabled('THE_LAB_ENABLED') && (
                     <Link to="/hybrid-daw">
                       <Button 
                         variant="ghost" 
                         size="sm"
                         className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
                       >
                         The Lab
                       </Button>
                     </Link>
                   )}
                  <Button 
                    onClick={signOut} 
                    variant="outline" 
                    size="sm"
                    className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-all duration-300"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    >
                      Home
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup">
                    <Button 
                      size="sm" 
                      className="gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
                    >
                      <Sparkles className="w-4 h-4" />
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="pt-4 pb-2 space-y-2 border-t border-border/50 mt-4">
            {navLinks.map((link, index) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-4 py-3 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 transform ${
                  isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                } ${isActiveRoute(link.to) ? 'text-primary bg-primary/5' : ''}`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {link.label}
              </Link>
            ))}

            <div className={`pt-2 space-y-2 transform transition-all duration-300 ${
              isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
            }`} style={{ transitionDelay: `${navLinks.length * 50}ms` }}>
              {user ? (
                <Button 
                  onClick={signOut} 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Link to="/auth" className="block">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup" className="block">
                    <Button 
                      size="sm" 
                      className="w-full gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300"
                    >
                      <Sparkles className="w-4 h-4" />
                      Start Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
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

  // Dynamic logo destination based on user role
  const getLogoDestination = () => {
    if (!user) return "/";
    if (userRole === 'admin') return "/admin";
    if (userRole === 'engineer') return "/engineer-crm";
    return "/artist-crm";
  };

  // Role-specific navigation
  const getNavLinks = () => {
    if (!user) {
      return [
        { to: "/mixing", label: "Mixing Magic" },
        { to: "/mastering", label: "Mastering Polish" },
        { to: "/for-artists", label: "For Artists" },
        { to: "/for-engineers", label: "For Engineers" },
        { to: "/merch", label: "Merch Store", badge: "NEW" },
        { to: "/coming-soon", label: "Coming Soon" },
      ];
    }

    if (userRole === 'engineer') {
      return [
        { to: "/engineer-crm", label: "Dashboard" },
        { to: "/jobs", label: "Job Board" },
        { to: "/mixing", label: "Mixing Studio" },
        { to: "/mastering", label: "Mastering Studio" },
        { to: "/distribution", label: "Distribution" },
        { to: "/merch", label: "Merch Store", badge: "NEW" },
        { to: "/coming-soon", label: "Coming Soon" },
      ];
    }

    // Artists and clients
    return [
      { to: "/artist-crm", label: "Dashboard" },
      { to: "/mixing", label: "Mixing Magic" },
      { to: "/mastering", label: "Mastering Polish" },
      { to: "/for-artists", label: "For Artists" },
      { to: "/distribution", label: "Distribution", featured: true },
      { to: "/merch", label: "Merch Store", badge: "NEW" },
      { to: "/coming-soon", label: "Coming Soon" },
      ...(isFeatureEnabled('THE_LAB_ENABLED') ? [{ to: "/hybrid-daw", label: "The Lab" }] : []),
    ];
  };

  const navLinks = getNavLinks();

  const isActiveRoute = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      scrolled 
        ? 'bg-background/90 backdrop-blur-md border-b border-border/50 shadow-lg' 
        : 'bg-background/95 backdrop-blur border-b border-border'
    }`}>
      <div className="container px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to={getLogoDestination()} 
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
            <span className="font-bold text-xl bg-gradient-to-r from-white via-white/80 via-purple-300 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_3s_ease-in-out_infinite] group-hover:animate-[gradient-shift_1s_ease-in-out_infinite] transition-all duration-300">
              MixClub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {user && <RealTimeNotifications userId={user.id} />}
            
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-foreground hover:text-primary transition-all duration-300 ${
                  (link as any).featured ? 'font-bold' : 'font-medium'
                } ${
                  isActiveRoute(link.to) ? 'text-primary' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {link.label}
                  {(link as any).badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/20 text-primary border border-primary/30">
                      {(link as any).badge}
                    </span>
                  )}
                  {(link as any).featured && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-primary via-[hsl(220_90%_60%)] to-[hsl(180_100%_50%)] text-foreground animate-pulse-glow shadow-glow-sm">
                      NEW
                    </span>
                  )}
                </div>
                <span className={`absolute bottom-0 left-0 w-full h-0.5 ${
                  (link as any).featured 
                    ? 'bg-gradient-to-r from-primary via-[hsl(220_90%_60%)] to-[hsl(180_100%_50%)]' 
                    : 'bg-primary'
                } transform transition-transform duration-300 ${
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
                } ${isActiveRoute(link.to) ? 'text-primary bg-primary/5' : ''} ${
                  (link as any).featured ? 'font-bold' : ''
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span>{link.label}</span>
                  {(link as any).badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/20 text-primary border border-primary/30">
                      {(link as any).badge}
                    </span>
                  )}
                  {(link as any).featured && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-primary via-[hsl(220_90%_60%)] to-[hsl(180_100%_50%)] text-foreground animate-pulse-glow">
                      NEW
                    </span>
                  )}
                </div>
              </Link>
            ))}

            <div className={`pt-2 space-y-2 transform transition-all duration-300 ${
              isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
            }`} style={{ transitionDelay: `${navLinks.length * 50}ms` }}>
              {user && (
                <div className="px-4 mb-2">
                  <RealTimeNotifications userId={user.id} />
                </div>
              )}
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
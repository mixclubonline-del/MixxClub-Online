import { Button } from "@/components/ui/button";
import { Menu, Sparkles, X, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import mixxclub3DLogo from "@/assets/mixxclub-3d-logo.png";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { NotificationCenter } from "./notifications/NotificationCenter";
import { isFeatureEnabled } from "@/config/featureFlags";
import { UserLevelBadge } from "./gamification/UserLevelBadge";
import { UnlockPulseIndicator } from "./unlock/UnlockPulseIndicator";

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
    if (userRole === 'producer') return "/producer-crm";
    if (userRole === 'fan') return "/fan-hub";
    return "/artist-crm";
  };

  // Role-specific navigation - Story-driven structure
  const getNavLinks = () => {
    if (!user) {
      // Logged out: 4-category structure
      return [
        {
          label: "Platform",
          isDropdown: true,
          items: [
            { to: "/home", label: "Home" },
            { to: "/economy", label: "MixxCoinz" },
            { to: "/pricing", label: "Pricing" },
            { to: "/showcase", label: "Showcase" },
            { to: "/about", label: "About" },
          ]
        },
        {
          label: "For Creatives",
          isDropdown: true,
          items: [
            { to: "/for-creatives", label: "The Ecosystem" },
            { to: "/for-artists", label: "For Artists" },
            { to: "/for-engineers", label: "For Engineers" },
            { to: "/for-producers", label: "For Producers" },
            { to: "/for-fans", label: "For Fans" },
          ]
        },
        {
          label: "Studio",
          isDropdown: true,
          items: [
            { to: "/services/mixing", label: "Mixing Magic" },
            { to: "/services/mastering", label: "Mastering" },
            { to: "/services/ai-mastering", label: "AI Mastering" },
            { to: "/services/distribution", label: "Distribution" },
          ]
        },
        {
          label: "Community",
          isDropdown: true,
          items: [
            { to: "/community", label: "The Network" },
            { to: "/community?tab=arena", label: "Mix Battles" },
            { to: "/community?tab=leaderboard", label: "Leaderboard" },
            { to: "/marketplace", label: "Marketplace" },
          ]
        },
      ];
    }

    if (userRole === 'engineer') {
      return [
        { to: "/engineer-crm", label: "Dashboard" },
        { to: "/jobs", label: "Find Work" },
        {
          label: "The Studio",
          isDropdown: true,
          items: [
            { to: "/services/mixing", label: "Mixing" },
            { to: "/services/mastering", label: "Mastering" },
            { to: "/showcase", label: "Technology" },
          ]
        },
        {
          label: "Community",
          isDropdown: true,
          items: [
            { to: "/community", label: "The Network" },
            { to: "/community?tab=arena", label: "Mix Battles" },
            { to: "/community?tab=leaderboard", label: "Leaderboard" },
          ]
        },
      ];
    }

    if (userRole === 'producer') {
      return [
        { to: "/producer-crm", label: "Dashboard" },
        { to: "/beats", label: "Beat Store" },
        {
          label: "The Studio",
          isDropdown: true,
          items: [
            { to: "/prime-beat-forge", label: "Beat Forge" },
            { to: "/services/mixing", label: "Mixing" },
            { to: "/services/mastering", label: "Mastering" },
            { to: "/services/distribution", label: "Distribution" },
          ]
        },
        {
          label: "Community",
          isDropdown: true,
          items: [
            { to: "/community", label: "The Network" },
            { to: "/community?tab=arena", label: "Mix Battles" },
            { to: "/sessions", label: "Sessions" },
          ]
        },
      ];
    }

    if (userRole === 'fan') {
      return [
        { to: "/fan-hub", label: "My Feed" },
        {
          label: "Discover",
          isDropdown: true,
          items: [
            { to: "/community", label: "The Network" },
            { to: "/sessions", label: "Live Sessions" },
            { to: "/marketplace", label: "Marketplace" },
            { to: "/beats", label: "Beats" },
          ]
        },
        {
          label: "Community",
          isDropdown: true,
          items: [
            { to: "/community?tab=arena", label: "Mix Battles" },
            { to: "/community?tab=leaderboard", label: "Leaderboard" },
            { to: "/crowd", label: "Crowd" },
          ]
        },
      ];
    }

    // Artists (default)
    return [
      { to: "/artist-crm", label: "Dashboard" },
      {
        label: "The Studio",
        isDropdown: true,
        items: [
          { to: "/services/mixing", label: "Mixing Magic" },
          { to: "/services/mastering", label: "Mastering" },
          { to: "/services/ai-mastering", label: "AI Mastering" },
          { to: "/services/distribution", label: "Distribution" },
        ]
      },
      {
        label: "Community",
        isDropdown: true,
        items: [
          { to: "/community", label: "The Network" },
          { to: "/community?tab=arena", label: "Mix Battles" },
          { to: "/marketplace", label: "Marketplace" },
        ]
      },
      { to: "/for-artists", label: "Resources" },
    ];
  };

  const navLinks = getNavLinks();

  const isActiveRoute = (path: string) => location.pathname === path;

  return (
    <nav aria-label="Main navigation" className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled
      ? 'glass-ultra border-b border-[hsl(var(--glass-border-strong))] shadow-glass-lg animate-glass-breathe'
      : 'glass-mid border-b border-[hsl(var(--glass-border))]'
      }`}>
      <div className="container px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to={getLogoDestination()}
            className="flex items-center gap-3 group transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-glass-glow-pulse" style={{ boxShadow: '0 0 40px hsl(var(--primary))' }}></div>
              <img
                src={mixxclub3DLogo}
                alt="Mixxclub 3D Logo"
                className="w-12 h-9 object-contain relative z-10 transition-transform duration-300 group-hover:rotate-3"
              />
            </div>
            <span className="font-black text-xl tracking-wider bg-gradient-to-r from-white via-white/80 via-purple-300 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_3s_ease-in-out_infinite] group-hover:animate-[gradient-shift_1s_ease-in-out_infinite] transition-all duration-300">
              MIXXCLUB
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {user && <UnlockPulseIndicator />}
            {user && <NotificationCenter />}

            {navLinks.map((link, index) => {
              // Check if it's a dropdown menu
              if ((link as any).isDropdown) {
                return (
                  <div key={index} className="relative group">
                    <button className="relative text-foreground hover:text-primary transition-all duration-300 font-medium flex items-center gap-1">
                      {link.label}
                      <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {/* Dropdown menu */}
                    <div className="absolute top-full left-0 mt-2 w-48 glass-floating rounded-lg border border-[hsl(var(--glass-border-strong))] shadow-glass-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                      {(link as any).items.map((item: any) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="block px-4 py-2 text-sm glass-pill hover:glass-near hover:text-primary transition-all mx-2 my-1 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="glass-pill px-2 py-0.5 text-[10px] font-bold rounded-full text-primary border border-[hsl(var(--glass-edge-ember))] shadow-glass-glow">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              // Regular link
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative text-foreground hover:text-primary transition-all duration-300 font-medium ${isActiveRoute(link.to) ? 'text-primary' : ''
                    }`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300 ${isActiveRoute(link.to) ? 'scale-x-100' : 'scale-x-0 hover:scale-x-100'
                    }`}></span>
                </Link>
              );
            })}

            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/achievements" className="hover:opacity-80 transition-opacity">
                  <UserLevelBadge compact />
                </Link>
                <Button
                  onClick={signOut}
                  variant="ghost"
                  size="sm"
                  className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  Sign Out
                </Button>
              </div>
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
            aria-label="Toggle menu"
            aria-expanded={isOpen}
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
        <div className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
          <div className="pt-4 pb-2 space-y-2 glass-frosted border-t border-[hsl(var(--glass-border))] mt-4 rounded-b-lg">
            {navLinks.map((link, index) => {
              // Check if it's a dropdown menu
              if ((link as any).isDropdown) {
                return (
                  <div key={index} className="space-y-1">
                    <div className="px-4 py-2 text-sm font-semibold text-muted-foreground">
                      {link.label}
                    </div>
                    {(link as any).items.map((item: any) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`block px-6 py-2 rounded-lg text-sm text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 ${isActiveRoute(item.to) ? 'text-primary bg-primary/5' : ''
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/20 text-primary border border-primary/30">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                );
              }

              // Regular link
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-3 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 transform ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                    } ${isActiveRoute(link.to) ? 'text-primary bg-primary/5' : ''}`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className={`pt-2 space-y-2 transform transition-all duration-300 ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
              }`} style={{ transitionDelay: `${navLinks.length * 50}ms` }}>
              {user && (
                <div className="px-4 mb-2 flex justify-center">
                  <NotificationCenter />
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
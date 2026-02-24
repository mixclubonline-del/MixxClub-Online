import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, Music, Brain, BarChart3, Store, Radio, 
  Users, Home, Map, Sparkles, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/config/routes';

interface District {
  id: string;
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

const districts: District[] = [
  { id: 'tower', name: 'MixxTech Tower', path: ROUTES.CITY, icon: Building2, color: 'from-primary to-accent-blue', description: 'Central Hub' },
  { id: 'creator', name: 'Creator Hub', path: ROUTES.CITY_CREATOR, icon: Music, color: 'from-purple-500 to-pink-500', description: 'Upload & Create' },
  { id: 'rsd', name: 'RSD Chamber', path: ROUTES.CITY_STUDIO, icon: Sparkles, color: 'from-orange-500 to-red-500', description: 'AI Studio' },
  { id: 'neural', name: 'Neural Engine', path: ROUTES.CITY_PRIME, icon: Brain, color: 'from-cyan-500 to-blue-500', description: "Prime's HQ" },
  { id: 'data', name: 'Data Realm', path: ROUTES.CITY_ANALYTICS, icon: BarChart3, color: 'from-green-500 to-emerald-500', description: 'Analytics' },
  { id: 'commerce', name: 'Commerce District', path: ROUTES.CITY_COMMERCE, icon: Store, color: 'from-yellow-500 to-orange-500', description: 'Revenue Streams' },
  { id: 'broadcast', name: 'Broadcast Tower', path: ROUTES.CITY_BROADCAST, icon: Radio, color: 'from-indigo-500 to-purple-500', description: 'Distribution' },
  { id: 'arena', name: 'The Arena', path: ROUTES.CITY_ARENA, icon: Users, color: 'from-red-500 to-pink-500', description: 'Community' },
  { id: 'apartments', name: 'Apartments', path: ROUTES.SETTINGS, icon: Home, color: 'from-teal-500 to-cyan-500', description: 'Your Space' },
];

interface CityLayoutProps {
  children: ReactNode;
  currentDistrict?: string;
}

export const CityLayout = ({ children, currentDistrict }: CityLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMap, setShowMap] = useState(false);

  const current = districts.find(d => d.id === currentDistrict) || districts[0];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated City Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-primary/5" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-primary/10 to-transparent" />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 10 
            }}
            animate={{ 
              y: -10,
              x: Math.random() * window.innerWidth 
            }}
            transition={{ 
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* Top Navigation */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-primary/20"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(ROUTES.CITY)}
              className="hover:bg-primary/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br",
                current.color
              )}>
                <current.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm">{current.name}</h1>
                <p className="text-xs text-muted-foreground">{current.description}</p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMap(!showMap)}
            className="gap-2"
          >
            <Map className="w-4 h-4" />
            City Map
          </Button>
        </div>
      </motion.header>

      {/* City Map Overlay */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl"
            onClick={() => setShowMap(false)}
          >
            <div className="container mx-auto px-4 py-24">
              <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent">
                MixClub City Map
              </h2>
              
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                {districts.map((district, index) => (
                  <motion.button
                    key={district.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(district.path);
                      setShowMap(false);
                    }}
                    className={cn(
                      "p-4 rounded-xl border transition-all hover:scale-105",
                      location.pathname === district.path
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-primary/50 bg-card/50"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center bg-gradient-to-br",
                      district.color
                    )}>
                      <district.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-medium text-sm">{district.name}</p>
                    <p className="text-xs text-muted-foreground">{district.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        {children}
      </main>

      {/* Bottom District Quick Nav */}
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-xl border-t border-primary/20 safe-area-inset-bottom"
      >
        <div className="flex items-center justify-around py-2 px-4 overflow-x-auto">
          {districts.slice(0, 5).map((district) => (
            <button
              key={district.id}
              onClick={() => navigate(district.path)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-all min-w-[60px]",
                location.pathname === district.path
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <district.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{district.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </motion.nav>
    </div>
  );
};

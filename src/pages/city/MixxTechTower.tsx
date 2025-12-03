import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Music, Brain, BarChart3, Store, Radio, 
  Users, Home, Sparkles, ArrowRight, TrendingUp, Clock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CityLayout } from '@/components/city/CityLayout';
import { cn } from '@/lib/utils';

const districts = [
  { 
    id: 'creator', 
    name: 'Creator Hub', 
    path: '/city/creator', 
    icon: Music, 
    color: 'from-purple-500 to-pink-500', 
    description: 'Upload tracks, start projects, collaborate',
    stats: '12 active projects'
  },
  { 
    id: 'rsd', 
    name: 'RSD Chamber', 
    path: '/city/studio', 
    icon: Sparkles, 
    color: 'from-orange-500 to-red-500', 
    description: 'AI beat generation, mixing tools, Suno integration',
    stats: 'Suno AI Ready',
    highlight: true
  },
  { 
    id: 'neural', 
    name: 'Neural Engine', 
    path: '/city/prime', 
    icon: Brain, 
    color: 'from-cyan-500 to-blue-500', 
    description: "Prime 4.0 AI assistant, smart matching",
    stats: 'Prime Online'
  },
  { 
    id: 'data', 
    name: 'Data Realm', 
    path: '/city/analytics', 
    icon: BarChart3, 
    color: 'from-green-500 to-emerald-500', 
    description: 'Analytics, insights, growth metrics',
    stats: '+15% this week'
  },
  { 
    id: 'commerce', 
    name: 'Commerce District', 
    path: '/city/commerce', 
    icon: Store, 
    color: 'from-yellow-500 to-orange-500', 
    description: '10 revenue streams, marketplace, services',
    stats: '$0 pending'
  },
  { 
    id: 'broadcast', 
    name: 'Broadcast Tower', 
    path: '/city/broadcast', 
    icon: Radio, 
    color: 'from-indigo-500 to-purple-500', 
    description: 'Distribution, releases, promotion',
    stats: '0 releases'
  },
  { 
    id: 'arena', 
    name: 'The Arena', 
    path: '/city/arena', 
    icon: Users, 
    color: 'from-red-500 to-pink-500', 
    description: 'Battles, community, leaderboards',
    stats: '3 live battles'
  },
  { 
    id: 'apartments', 
    name: 'Your Apartment', 
    path: '/city/profile', 
    icon: Home, 
    color: 'from-teal-500 to-cyan-500', 
    description: 'Profile, portfolio, achievements',
    stats: 'Level 1'
  },
];

const quickActions = [
  { label: 'Generate Beat', icon: Sparkles, path: '/city/studio', color: 'text-orange-400' },
  { label: 'Upload Track', icon: Music, path: '/city/creator', color: 'text-purple-400' },
  { label: 'Ask Prime', icon: Brain, path: '/city/prime', color: 'text-cyan-400' },
  { label: 'View Stats', icon: TrendingUp, path: '/city/analytics', color: 'text-green-400' },
];

export default function MixxTechTower() {
  const navigate = useNavigate();

  return (
    <CityLayout currentDistrict="tower">
      <div className="container mx-auto px-4 py-8 pb-24">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            MixxTech <span className="bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent">Tower</span>
          </h1>
          <p className="text-muted-foreground">Central hub of MixClub City</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                onClick={() => navigate(action.path)}
                className="p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-3"
              >
                <action.icon className={cn("w-5 h-5", action.color)} />
                <span className="font-medium text-sm">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-4 bg-card/50 backdrop-blur border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                City Activity
              </h2>
              <Badge variant="outline" className="text-xs">Live</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex-1">
                  <p>New beat generated in <span className="text-primary">RSD Chamber</span></p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p>5 new users entered <span className="text-primary">The Arena</span></p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1">
                  <p>Platform metrics updated in <span className="text-primary">Data Realm</span></p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Districts Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-medium text-muted-foreground mb-3">City Districts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {districts.map((district, index) => (
              <motion.div
                key={district.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Card
                  onClick={() => navigate(district.path)}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:scale-[1.02] bg-card/50 backdrop-blur",
                    district.highlight 
                      ? "border-orange-500/50 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20" 
                      : "border-border/50 hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
                      district.color
                    )}>
                      <district.icon className="w-5 h-5 text-white" />
                    </div>
                    {district.highlight && (
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">{district.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {district.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary">{district.stats}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </CityLayout>
  );
}

import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, Music,
  DollarSign, Eye, Play, ArrowUpRight, Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DistrictPortal } from '@/components/ui/DistrictPortal';
import { cn } from '@/lib/utils';

const stats = [
  { 
    label: 'Total Plays', 
    value: '12,459', 
    change: '+23%', 
    trend: 'up', 
    icon: Play,
    color: 'text-purple-400'
  },
  { 
    label: 'Profile Views', 
    value: '3,847', 
    change: '+12%', 
    trend: 'up', 
    icon: Eye,
    color: 'text-blue-400'
  },
  { 
    label: 'Followers', 
    value: '892', 
    change: '+8%', 
    trend: 'up', 
    icon: Users,
    color: 'text-green-400'
  },
  { 
    label: 'Revenue', 
    value: '$1,234', 
    change: '+45%', 
    trend: 'up', 
    icon: DollarSign,
    color: 'text-yellow-400'
  },
];

const topTracks = [
  { title: 'Midnight Dreams', plays: 4521, trend: 'up' },
  { title: 'City Lights', plays: 3892, trend: 'up' },
  { title: 'Summer Vibe', plays: 2104, trend: 'down' },
  { title: 'Flow State', plays: 1876, trend: 'up' },
];

const recentActivity = [
  { action: 'New follower from Tokyo', time: '2 min ago' },
  { action: 'Track played in Berlin', time: '15 min ago' },
  { action: 'Profile viewed by producer', time: '1 hour ago' },
  { action: 'Beat downloaded', time: '3 hours ago' },
];

export default function DataRealm() {
  return (
    <DistrictPortal districtId="data">
      <div className="p-6 md:p-8 pb-24">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className="p-4 bg-card/50 backdrop-blur border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        stat.trend === 'up' ? 'text-green-400 border-green-500/30' : 'text-red-400 border-red-500/30'
                      )}
                    >
                      {stat.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Performance Overview
              </h3>
              <Badge variant="outline" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                Last 30 days
              </Badge>
            </div>
            
            {/* Placeholder chart area */}
            <div className="h-48 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Analytics visualization</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Tracks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 bg-card/50 backdrop-blur border-border/50">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Music className="w-4 h-4 text-primary" />
                Top Tracks
              </h3>
              <div className="space-y-3">
                {topTracks.map((track, index) => (
                  <div key={track.title} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-4">{index + 1}</span>
                      <span className="font-medium text-sm">{track.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{track.plays.toLocaleString()}</span>
                      {track.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3 text-green-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 bg-card/50 backdrop-blur border-border/50">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-primary" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{activity.action}</span>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </DistrictPortal>
  );
}

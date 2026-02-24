import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, Music, Users, Sparkles, Radio, Award,
  Search, Command, ArrowRight, Clock, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QuickActionLauncherProps {
  fullScreen?: boolean;
  onClose?: () => void;
  onOpenPalette?: () => void;
}

export const QuickActionLauncher = ({ 
  fullScreen, 
  onClose, 
  onOpenPalette 
}: QuickActionLauncherProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const actions = [
    {
      icon: <Upload className="w-5 h-5" />,
      label: 'Upload Track',
      shortcut: 'U',
      color: 'from-blue-500 to-cyan-500',
      link: '/artist-crm?tab=active-work'
    },
    {
      icon: <Music className="w-5 h-5" />,
      label: 'Start Mixing',
      shortcut: 'M',
      color: 'from-purple-500 to-pink-500',
      link: '/mixing'
    },
    {
      icon: <Radio className="w-5 h-5" />,
      label: 'Join Session',
      shortcut: 'S',
      color: 'from-green-500 to-emerald-500',
      link: '/artist-crm?tab=studio'
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Find Engineer',
      shortcut: 'E',
      color: 'from-orange-500 to-red-500',
      link: '/engineers'
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      label: 'AI Mastering',
      shortcut: 'A',
      color: 'from-yellow-500 to-orange-500',
      link: '/mastering'
    },
    {
      icon: <Award className="w-5 h-5" />,
      label: 'View Achievements',
      shortcut: 'V',
      color: 'from-purple-500 to-blue-500',
      link: '/artist-crm?tab=profile'
    }
  ];

  const recentActions = [
    { label: 'Continued mixing "Summer Vibes"', time: '5 min ago', icon: <Music className="w-4 h-4" /> },
    { label: 'Uploaded new track', time: '1 hour ago', icon: <Upload className="w-4 h-4" /> },
    { label: 'Joined collaboration session', time: '2 hours ago', icon: <Users className="w-4 h-4" /> }
  ];

  const filteredActions = actions.filter(action =>
    action.label.toLowerCase().includes(search.toLowerCase())
  );

  if (fullScreen) {
    return (
      <Card className="w-full bg-background/95 backdrop-blur-xl border-primary/30 shadow-2xl">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Command className="w-5 h-5 text-primary" />
            <Input
              autoFocus
              placeholder="Search actions or type a command..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 focus-visible:ring-0 text-lg"
            />
            <Badge variant="outline" className="gap-1">
              <kbd className="text-xs">ESC</kbd>
            </Badge>
          </div>
        </CardHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <CardContent className="p-4 space-y-6">
            {/* Actions */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground px-2">Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {filteredActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      navigate(action.link);
                      onClose?.();
                    }}
                    className="flex items-center gap-3 p-4 rounded-lg border bg-background hover:bg-muted/50 transition-all text-left group"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                      <div className="text-white">{action.icon}</div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{action.label}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {action.shortcut}
                    </Badge>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Recent */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground px-2">Recent</h3>
              <div className="space-y-1">
                {recentActions.map((recent, index) => (
                  <motion.div
                    key={recent.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="text-muted-foreground">{recent.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm">{recent.label}</p>
                      <p className="text-xs text-muted-foreground">{recent.time}</p>
                    </div>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </ScrollArea>
      </Card>
    );
  }

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Command className="w-5 h-5 text-primary" />
            Quick Actions
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline"
            onClick={onOpenPalette}
            className="gap-2"
          >
            <Search className="w-4 h-4" />
            <kbd className="text-xs">⌘K</kbd>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {actions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.link)}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-xl border bg-background hover:bg-muted/50 transition-all min-w-[120px] group"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} group-hover:scale-110 transition-transform`}>
                <div className="text-white">{action.icon}</div>
              </div>
              <span className="text-xs font-medium text-center">{action.label}</span>
              <Badge variant="outline" className="text-xs">
                {action.shortcut}
              </Badge>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
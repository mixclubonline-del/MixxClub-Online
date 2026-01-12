import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Music, FolderOpen, Clock, Star, 
  Plus, ArrowRight, FileAudio, Mic
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DistrictPortal } from '@/components/ui/DistrictPortal';
import { cn } from '@/lib/utils';

const quickActions = [
  { label: 'Upload Track', icon: Upload, color: 'text-purple-400', description: 'Add new audio' },
  { label: 'Start Project', icon: Plus, color: 'text-pink-400', description: 'New collaboration' },
  { label: 'Record Audio', icon: Mic, color: 'text-red-400', description: 'Capture ideas' },
  { label: 'Browse Files', icon: FolderOpen, color: 'text-blue-400', description: 'Your library' },
];

const recentProjects = [
  { title: 'Summer Vibes EP', tracks: 4, status: 'In Progress', updated: '2 hours ago' },
  { title: 'Midnight Sessions', tracks: 7, status: 'Mixing', updated: '1 day ago' },
  { title: 'Beat Pack Vol. 3', tracks: 12, status: 'Complete', updated: '3 days ago' },
];

export default function CreatorHub() {
  const navigate = useNavigate();

  return (
    <DistrictPortal districtId="creator">
      <div className="p-6 md:p-8 pb-24">
        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className="p-4 cursor-pointer bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-3 group-hover:scale-110 transition-transform")}>
                    <action.icon className={cn("w-5 h-5", action.color)} />
                  </div>
                  <h3 className="font-medium text-sm">{action.label}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-8 bg-card/50 backdrop-blur border-dashed border-2 border-primary/30 hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Drop your tracks here</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Support for WAV, MP3, FLAC, AIFF • Up to 500MB
              </p>
              <Button variant="outline" className="gap-2">
                <FileAudio className="w-4 h-4" />
                Browse Files
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Recent Projects
            </h2>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All <ArrowRight className="w-3 h-3" />
            </Button>
          </div>

          <div className="space-y-3">
            {recentProjects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="p-4 bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <Music className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">{project.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{project.tracks} tracks</span>
                          <span>•</span>
                          <span>{project.updated}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          project.status === 'Complete' && 'border-green-500/50 text-green-400',
                          project.status === 'Mixing' && 'border-orange-500/50 text-orange-400',
                          project.status === 'In Progress' && 'border-blue-500/50 text-blue-400'
                        )}
                      >
                        {project.status}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DistrictPortal>
  );
}

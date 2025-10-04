import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, AlertTriangle, Clock, Play, Music, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAIProjectRecommendations } from '@/hooks/useAIProjectRecommendations';

interface ProjectCardProps {
  project: any;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const getUrgencyColor = () => {
    if (project.urgency === 'high') return 'from-red-500 to-orange-500';
    if (project.urgency === 'medium') return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-blue-500';
  };

  const getUrgencyIcon = () => {
    if (project.urgency === 'high') return <AlertTriangle className="w-4 h-4" />;
    if (project.urgency === 'medium') return <Clock className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-background to-background/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all cursor-pointer group">
        {/* AI Recommendation Badge */}
        {project.aiRecommended && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="default" className="gap-1 bg-gradient-to-r from-purple-500 to-pink-500">
              <Sparkles className="w-3 h-3" />
              AI Pick
            </Badge>
          </div>
        )}

        {/* Gradient Border Effect */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${getUrgencyColor()} opacity-0 group-hover:opacity-10 transition-opacity`}
        />

        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <motion.div
              className={`p-3 rounded-xl bg-gradient-to-br ${getUrgencyColor()}`}
              animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Music className="w-5 h-5 text-white" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1 truncate">{project.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline" className="gap-1">
              {getUrgencyIcon()}
              {project.urgency} priority
            </Badge>
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              Due {project.deadline}
            </Badge>
            {project.healthScore && (
              <Badge 
                variant="outline" 
                className={`${
                  project.healthScore >= 80 ? 'text-green-500' : 
                  project.healthScore >= 60 ? 'text-yellow-500' : 
                  'text-red-500'
                }`}
              >
                Health: {project.healthScore}%
              </Badge>
            )}
          </div>

          {/* AI Insight */}
          {project.aiInsight && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 rounded-lg bg-primary/5 border border-primary/20"
            >
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground">{project.aiInsight}</p>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1 gap-2"
              onClick={() => navigate(project.link)}
            >
              <Play className="w-4 h-4" />
              Continue Working
            </Button>
            <Button size="sm" variant="outline">
              Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const AIProjectRecommender = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useAIProjectRecommendations();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No active projects to recommend</p>
        <Button className="mt-4" onClick={() => navigate('/artist-studio')}>
          Start New Project
        </Button>
      </Card>
    );
  }

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Recommended Projects
          </CardTitle>
          <Badge variant="outline">
            {projects.filter(p => p.aiRecommended).length} priority
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map((project, index) => (
          <ProjectCard key={project.name} project={project} index={index} />
        ))}
      </CardContent>
    </Card>
  );
};
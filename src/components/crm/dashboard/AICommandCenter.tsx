import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AICommandCenterProps {
  insights: any[];
  isLoading: boolean;
}

export const AICommandCenter = ({ insights, isLoading }: AICommandCenterProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-20 right-6 z-40 w-80"
      >
        <Card className="p-4 bg-background/80 backdrop-blur-xl border-primary/20 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="font-semibold">AI Copilot</span>
          </div>
          <p className="text-sm text-muted-foreground">Analyzing your workspace...</p>
        </Card>
      </motion.div>
    );
  }

  const currentInsight = insights?.[0] || {
    type: 'success',
    title: 'All systems operational',
    message: 'Keep up the great work!',
    action: null
  };

  const getIcon = () => {
    switch (currentInsight.type) {
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'improvement': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      default: return <Sparkles className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 right-6 z-40 w-80 md:w-96"
    >
      <Card className="relative overflow-hidden bg-background/80 backdrop-blur-xl border-primary/20 shadow-2xl">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
        
        <div className="relative p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5 text-primary" />
              </motion.div>
              <span className="font-semibold">AI Copilot</span>
            </div>
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Active
            </Badge>
          </div>

          {/* Insight Card */}
          <motion.div
            key={currentInsight.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-3 rounded-lg bg-muted/50 border border-border/50"
          >
            <div className="flex items-start gap-3">
              {getIcon()}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1">{currentInsight.title}</h3>
                <p className="text-xs text-muted-foreground">{currentInsight.message}</p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          {currentInsight.action && (
            <Button 
              size="sm" 
              className="w-full gap-2"
              onClick={() => navigate(currentInsight.action.link)}
            >
              <Zap className="w-4 h-4" />
              {currentInsight.action.label}
              <ArrowRight className="w-3 h-3 ml-auto" />
            </Button>
          )}

          {/* Quick Stats */}
          <div className="flex gap-2 text-xs">
            <div className="flex-1 p-2 rounded bg-green-500/10 text-green-600 dark:text-green-400 text-center">
              <div className="font-bold">92%</div>
              <div className="opacity-70">Quality</div>
            </div>
            <div className="flex-1 p-2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-center">
              <div className="font-bold">5/7</div>
              <div className="opacity-70">On Track</div>
            </div>
            <div className="flex-1 p-2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 text-center">
              <div className="font-bold">+23%</div>
              <div className="opacity-70">Growth</div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
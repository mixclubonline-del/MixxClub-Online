import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, Music, TrendingUp, Star, Users, 
  Sparkles, Award 
} from 'lucide-react';

interface CompatibilityMetric {
  label: string;
  score: number;
  icon: any;
  color: string;
}

interface MusicalCompatibilityScoreProps {
  artistId: string;
  engineerId: string;
  projectId?: string;
}

export const MusicalCompatibilityScore = ({
  artistId,
  engineerId,
  projectId
}: MusicalCompatibilityScoreProps) => {
  // In a real implementation, this would be calculated from database
  const overallScore = 92;
  
  const metrics: CompatibilityMetric[] = [
    {
      label: 'Genre Alignment',
      score: 95,
      icon: Music,
      color: 'text-blue-500'
    },
    {
      label: 'Communication Style',
      score: 88,
      icon: Users,
      color: 'text-purple-500'
    },
    {
      label: 'Vision Matching',
      score: 94,
      icon: Sparkles,
      color: 'text-pink-500'
    },
    {
      label: 'Work Pace',
      score: 90,
      icon: TrendingUp,
      color: 'text-green-500'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-blue-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 75) return 'Great Match';
    if (score >= 60) return 'Good Match';
    return 'Fair Match';
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 mb-4">
            <Heart className="w-10 h-10 text-primary fill-primary/20" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Musical Compatibility</h3>
          <p className="text-sm text-muted-foreground">
            How well this collaboration is aligned musically and creatively
          </p>
        </div>

        {/* Overall Score */}
        <div className="text-center space-y-3">
          <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}%
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-base px-4 py-1">
            <Award className="w-4 h-4 mr-2" />
            {getScoreLabel(overallScore)}
          </Badge>
        </div>

        {/* Metrics Breakdown */}
        <div className="space-y-4 pt-4 border-t">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            
            return (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${metric.color}`} />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${getScoreColor(metric.score)}`}>
                    {metric.score}%
                  </span>
                </div>
                <Progress value={metric.score} className="h-2" />
              </div>
            );
          })}
        </div>

        {/* Insights */}
        <Card className="p-4 bg-background/50 border-dashed">
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            Why This Works
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Both prefer detailed, iterative approach to mixing</li>
            <li>• Shared experience in {'{genre}'} production</li>
            <li>• Similar communication style (quick responses, clear feedback)</li>
            <li>• Compatible work schedules and delivery expectations</li>
          </ul>
        </Card>

        {/* Success Prediction */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            Based on past collaborations with similar compatibility scores
          </p>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold text-primary">
              95% chance of a successful collaboration
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
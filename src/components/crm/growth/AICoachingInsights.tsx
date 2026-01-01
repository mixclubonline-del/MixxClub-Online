import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Sparkles, MessageSquare, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface AICoachingInsightsProps {
  userType: 'artist' | 'engineer';
}

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'achievement' | 'tip';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

interface WeeklyReview {
  summary: string;
  highlights: string[];
  improvements: string[];
  nextWeekFocus: string;
}

export const AICoachingInsights: React.FC<AICoachingInsightsProps> = ({ userType }) => {
  const insights: Insight[] = userType === 'artist' ? [
    {
      id: '1',
      type: 'opportunity',
      title: 'Optimal Release Window',
      description: 'Based on your audience engagement patterns, Friday 6 PM EST would be ideal for your next single release.',
      action: 'Schedule Release',
      priority: 'high',
    },
    {
      id: '2',
      type: 'warning',
      title: 'Streaming Growth Slowdown',
      description: 'Your weekly listener growth has decreased by 15%. Consider increasing social media engagement.',
      action: 'View Strategy',
      priority: 'high',
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Vocal Range Improved',
      description: 'AI analysis shows your vocal range has expanded by half an octave over the past month!',
      priority: 'medium',
    },
    {
      id: '4',
      type: 'tip',
      title: 'Collaboration Suggestion',
      description: 'Engineer "MixMaster Mike" has a 94% style compatibility with your sound. Consider reaching out.',
      action: 'View Profile',
      priority: 'medium',
    },
  ] : [
    {
      id: '1',
      type: 'opportunity',
      title: 'High-Demand Skill Gap',
      description: 'Dolby Atmos mixing is in high demand. Artists in your network are actively seeking this service.',
      action: 'Start Learning',
      priority: 'high',
    },
    {
      id: '2',
      type: 'warning',
      title: 'Response Time Alert',
      description: 'Your average response time to new projects has increased to 18 hours. Top engineers respond within 4 hours.',
      action: 'Set Alerts',
      priority: 'high',
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Client Retention Excellence',
      description: '85% of your clients have returned for additional projects. You\'re in the top 10% of engineers!',
      priority: 'medium',
    },
    {
      id: '4',
      type: 'tip',
      title: 'Portfolio Optimization',
      description: 'Adding 2 more hip-hop samples could increase your match rate by 25% based on current demand.',
      action: 'Update Portfolio',
      priority: 'medium',
    },
  ];

  const weeklyReview: WeeklyReview = userType === 'artist' ? {
    summary: 'Strong week with consistent activity. Your engagement with the community has increased by 40%.',
    highlights: [
      'Completed 2 collaboration sessions',
      'Released single reached 500 streams',
      'Earned "Rising Star" badge',
    ],
    improvements: [
      'Post more behind-the-scenes content',
      'Engage with more fan comments',
      'Complete vocal warm-up course',
    ],
    nextWeekFocus: 'Focus on building pre-save momentum for upcoming release',
  } : {
    summary: 'Excellent productivity with 5 projects completed. Client satisfaction remains high at 4.8/5.',
    highlights: [
      'Delivered 5 projects on time',
      'Received 3 five-star reviews',
      'Earned $2,450 in revenue',
    ],
    improvements: [
      'Reduce revision cycles per project',
      'Expand genre expertise to R&B',
      'Update equipment showcase',
    ],
    nextWeekFocus: 'Target 6 project completions while maintaining quality standards',
  };

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'achievement': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'tip': return <Lightbulb className="w-5 h-5 text-purple-500" />;
    }
  };

  const getInsightBorder = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity': return 'border-l-emerald-500';
      case 'warning': return 'border-l-yellow-500';
      case 'achievement': return 'border-l-blue-500';
      case 'tip': return 'border-l-purple-500';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* AI Insights */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">AI Insights</h3>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Ask Prime
          </Button>
        </div>

        <div className="space-y-3">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`bg-card/50 border-l-4 ${getInsightBorder(insight.type)} hover:bg-card/80 transition-all`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{insight.title}</h4>
                        {insight.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs">Priority</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                    {insight.action && (
                      <Button variant="ghost" size="sm" className="shrink-0 gap-1">
                        {insight.action}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weekly Review */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Weekly Review</h3>
        </div>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">{weeklyReview.summary}</p>

            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Highlights
              </h4>
              <ul className="space-y-1">
                {weeklyReview.highlights.map((highlight, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-green-500" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-500" />
                Areas to Improve
              </h4>
              <ul className="space-y-1">
                {weeklyReview.improvements.map((improvement, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-yellow-500" />
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-border/50">
              <h4 className="text-sm font-medium mb-2">Next Week Focus</h4>
              <p className="text-sm text-primary">{weeklyReview.nextWeekFocus}</p>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full gap-2">
          <Brain className="w-4 h-4" />
          Get Personalized Plan
        </Button>
      </div>
    </div>
  );
};

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  X, Star, MessageCircle, Sparkles, Music, Award,
  Target, Zap, Clock, CheckCircle, TrendingUp, Users
} from 'lucide-react';
import { MatchProfile } from './AIMatchesHub';

interface CompatibilityBreakdownProps {
  match: MatchProfile;
  userType: 'artist' | 'engineer' | 'producer';
  onClose: () => void;
  onContact: () => void;
}

export const CompatibilityBreakdown = ({
  match,
  userType,
  onClose,
  onContact
}: CompatibilityBreakdownProps) => {
  const compatibilityDetails = [
    {
      label: 'Genre Match',
      score: match.compatibilityScores.genre,
      icon: <Music className="w-5 h-5" />,
      description: `Strong alignment with ${match.genres.slice(0, 2).join(' & ')} production`,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Style Compatibility',
      score: match.compatibilityScores.style,
      icon: <Sparkles className="w-5 h-5" />,
      description: 'Creative vision and aesthetic preferences align well',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Technical Match',
      score: match.compatibilityScores.technical,
      icon: <Zap className="w-5 h-5" />,
      description: `Expertise in ${match.specialties.slice(0, 2).join(' & ')}`,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      label: 'Availability',
      score: match.compatibilityScores.availability,
      icon: <Clock className="w-5 h-5" />,
      description: 'Currently accepting new projects',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const strengths = [
    `${match.completedProjects}+ projects completed`,
    `${match.experience}+ years of experience`,
    match.specialties[0] && `Expert in ${match.specialties[0]}`,
    match.rating >= 4.5 && 'Highly rated professional',
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={match.avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xl">
                  {match.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-2xl font-bold">{match.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{match.rating.toFixed(1)}</span>
                  <span>•</span>
                  <span>{match.completedProjects} projects</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Overall Score */}
          <div className="text-center mb-8 p-6 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{match.matchScore}%</span>
            </div>
            <h4 className="text-lg font-semibold mb-2">Overall Match Score</h4>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Based on your preferences, genre, budget, and style compatibility
            </p>
          </div>

          {/* Compatibility Breakdown */}
          <div className="space-y-4 mb-8">
            <h4 className="font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Compatibility Breakdown
            </h4>
            <div className="grid gap-4">
              {compatibilityDetails.map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white`}>
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold">{item.score}%</span>
                  </div>
                  <Progress value={item.score} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          {/* AI Insight */}
          {match.aiInsight && (
            <div className="mb-8 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h5 className="font-semibold mb-1">AI Insight</h5>
                  <p className="text-sm text-muted-foreground">{match.aiInsight}</p>
                </div>
              </div>
            </div>
          )}

          {/* Strengths */}
          <div className="mb-8">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-yellow-500" />
              Key Strengths
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {strengths.map((strength, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Specialties & Genres */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-2">Specialties</h5>
              <div className="flex flex-wrap gap-2">
                {match.specialties.map((specialty, idx) => (
                  <Badge key={idx} variant="secondary">{specialty}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-2">Genres</h5>
              <div className="flex flex-wrap gap-2">
                {match.genres.map((genre, idx) => (
                  <Badge key={idx} variant="outline">{genre}</Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onContact}
              className="flex-1 bg-gradient-to-r from-primary to-purple-600"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Conversation
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

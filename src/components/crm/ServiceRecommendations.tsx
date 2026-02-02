import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Music, TrendingUp, Award, ArrowRight, Check } from 'lucide-react';
import { useFlowNavigation } from '@/core/fabric/useFlow';

interface ServiceRecommendation {
  id: string;
  service: 'mastering' | 'mixing' | 'production' | 'vocal-tuning';
  title: string;
  description: string;
  reason: string;
  benefits: string[];
  priceRange: string;
  icon: any;
  color: string;
}

interface ServiceRecommendationsProps {
  projectId: string;
  currentService: string;
  genre?: string;
}

export const ServiceRecommendations = ({ 
  projectId, 
  currentService, 
  genre 
}: ServiceRecommendationsProps) => {
  const { openArtistCRM } = useFlowNavigation();
  
  const getRecommendations = (): ServiceRecommendation[] => {
    const recommendations: ServiceRecommendation[] = [];

    if (currentService === 'mixing') {
      recommendations.push({
        id: '1',
        service: 'mastering',
        title: 'AI Mastering',
        description: 'Perfect your mix with professional mastering',
        reason: 'Complete your track journey with platform-optimized mastering',
        benefits: [
          'Platform-specific optimization (Spotify, Apple Music)',
          'Professional loudness standards',
          'Final polish and enhancement',
          'Instant preview and delivery'
        ],
        priceRange: '$29-99',
        icon: Sparkles,
        color: 'from-purple-500/20 to-pink-500/20'
      });
    }

    if (currentService === 'mastering') {
      recommendations.push({
        id: '2',
        service: 'mixing',
        title: 'Professional Mixing',
        description: 'Take your next track to the next level',
        reason: 'Work with our pros for your upcoming releases',
        benefits: [
          'Expert engineer matching',
          'Unlimited revisions',
          'Fast turnaround time',
          'Live collaboration available'
        ],
        priceRange: '$99-299',
        icon: Music,
        color: 'from-blue-500/20 to-cyan-500/20'
      });
    }

    // Genre-specific recommendations
    if (genre?.toLowerCase().includes('hip hop') || genre?.toLowerCase().includes('rap')) {
      recommendations.push({
        id: '3',
        service: 'vocal-tuning',
        title: 'Vocal Tuning & Polish',
        description: 'Perfect vocal performance and tuning',
        reason: 'Essential for modern hip-hop production',
        benefits: [
          'Natural-sounding pitch correction',
          'Vocal timing and alignment',
          'Breath control and dynamics',
          'Professional vocal chain'
        ],
        priceRange: '$49-149',
        icon: TrendingUp,
        color: 'from-green-500/20 to-emerald-500/20'
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  if (recommendations.length === 0) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-primary" />
            Complete Your Track Journey
          </h3>
          <p className="text-sm text-muted-foreground">
            Recommended services to take your track to the next level
          </p>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const Icon = rec.icon;
            
            return (
              <Card 
                key={rec.id} 
                className={`p-5 bg-gradient-to-br ${rec.color} border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg`}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                        <Badge variant="outline" className="bg-primary/5 border-primary/20">
                          {rec.reason}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{rec.priceRange}</div>
                      <div className="text-xs text-muted-foreground">per track</div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {rec.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action */}
                  <Button 
                    className="w-full group"
                    onClick={() => {
                      if (rec.service === 'mastering') {
                        openArtistCRM('ai-mastering');
                      } else if (rec.service === 'mixing') {
                        openArtistCRM('book-session');
                      }
                    }}
                  >
                    Explore {rec.title}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bundle Offer */}
        <Card className="p-4 bg-gradient-to-r from-primary/10 via-purple-500/10 to-accent/10 border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">Bundle & Save</p>
                <p className="text-sm text-muted-foreground">
                  Get mixing + mastering together and save 20%
                </p>
              </div>
            </div>
            <Button variant="outline">View Packages</Button>
          </div>
        </Card>
      </div>
    </Card>
  );
};
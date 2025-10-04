import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Share2, Zap, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PrimeAvatar } from '@/components/prime/PrimeAvatar';

interface PostMixUpsellProps {
  projectTitle: string;
  onDismiss?: () => void;
}

export const PostMixUpsell = ({ projectTitle, onDismiss }: PostMixUpsellProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <Card
        className="w-full max-w-3xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
        
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <PrimeAvatar size="xl" />
            </div>
            <h2 className="text-3xl font-black mb-2">
              Your Mix is Ready! 🎉
            </h2>
            <p className="text-lg text-muted-foreground">
              <span className="font-semibold">{projectTitle}</span> sounds incredible. Now let's make it shine.
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* AI Mastering */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative group"
            >
              <Card className="relative overflow-hidden border-primary/20 hover:border-primary transition-colors h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary-glow/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="p-6 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">AI Master</h3>
                      <Badge variant="secondary" className="text-xs">Instant</Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {[
                      'Radio-ready in 60 seconds',
                      'Optimized for all platforms',
                      'From $9.99 per track',
                      'Unlimited revisions',
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button onClick={() => navigate('/ai-mastering')} className="w-full gap-2">
                    Master Now
                    <Zap className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Distribution */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative group"
            >
              <Card className="relative overflow-hidden border-accent/20 hover:border-accent transition-colors h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="p-6 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <Share2 className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Distribute</h3>
                      <Badge variant="secondary" className="text-xs">30+ DSPs</Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {[
                      'Spotify, Apple Music, etc.',
                      'Keep 100% of royalties',
                      'Instant playlist pitching',
                      'Analytics dashboard',
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-accent flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button onClick={() => navigate('/distribution')} variant="outline" className="w-full gap-2">
                    Release Music
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <Button onClick={onDismiss} variant="ghost">
              I'll do this later
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

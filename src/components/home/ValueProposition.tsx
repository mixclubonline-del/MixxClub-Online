import { motion } from 'framer-motion';
import { Music, Headphones, ArrowRight, CheckCircle, DollarSign, Target, TrendingUp, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export const ValueProposition = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Artist Path - Rewritten */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 h-full hover:shadow-xl transition-shadow border-2 hover:border-primary">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Music className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">For Artists</h3>
              </div>

              <h4 className="text-3xl font-bold mb-4">
                Stop Overpaying.<br />Start Sounding Professional.
              </h4>

              <div className="space-y-3 mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Traditional Studio:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">$250-500/track</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Automated Bots (LANDR):</span>
                  <span className="font-bold">$9-19/track</span>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="font-semibold">Mixxclub:</span>
                  <span className="font-bold text-primary">$29-149/track</span>
                </div>
                <p className="text-xs text-muted-foreground">Human expertise + AI power</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">10,000+ tracks mixed to perfection</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">4.8★ average engineer rating</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">72hr typical turnaround</span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={() => navigate('/auth')}>
                Browse Engineers by Budget
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Card>
          </motion.div>

          {/* Engineer Path - Rewritten */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 h-full hover:shadow-xl transition-shadow border-2 hover:border-primary">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Headphones className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">For Engineers</h3>
              </div>

              <h4 className="text-3xl font-bold mb-4">
                Keep 70% of Every Dollar.<br />We Do the Marketing.
              </h4>

              <div className="space-y-3 mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Fiverr/Upwork:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">20% platform fee</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">SoundBetter:</span>
                  <span className="font-bold">30% commission</span>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="font-semibold">Mixxclub:</span>
                  <span className="font-bold text-primary">30% (you keep 70%)</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Avg. engineer earns <strong>$2,500/month</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm">Get matched with artists who can afford you</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <span className="text-sm">Build your brand with portfolio tools</span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={() => navigate('/auth')}>
                Start Earning Today
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* Hybrid Creator Card - Keep it */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Card className="relative overflow-hidden p-8 border-2 border-purple-500/30 hover:border-purple-500 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 opacity-50" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <Badge className="mb-4 bg-gradient-to-r from-primary to-purple-600">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Best Value
                  </Badge>
                  <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Hybrid Creator
                  </h3>
                  <p className="text-muted-foreground">
                    Be both artist and engineer - unlock the full platform
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-primary">25%</div>
                  <div className="text-sm text-muted-foreground">Discount</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Music className="w-4 h-4 text-primary" />
                    As Artist
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Post unlimited projects</li>
                    <li>• Access all services</li>
                    <li>• Join competitions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-primary" />
                    As Engineer
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Earn 70% on projects</li>
                    <li>• Build your portfolio</li>
                    <li>• Unlock pro tools</li>
                  </ul>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:opacity-90"
                onClick={() => navigate('/auth')}
              >
                Unlock Both Worlds
                <Sparkles className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

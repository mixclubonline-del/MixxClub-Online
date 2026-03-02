import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const SubscriptionCTA = () => {
  const benefits = [
    'Unlimited revisions on all projects',
    '20% off all services',
    'Priority engineer matching',
    'Early access to new features',
    'No platform fees (for hybrid users)',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-12"
    >
      <Card className="relative overflow-hidden border-2 border-primary bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative p-8 md:p-12">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <Badge className="bg-primary text-primary-foreground">Most Value</Badge>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Professional Artists Choose Mixxclub Pro
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold">$49</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <Button size="lg" className="w-full md:w-auto">
                Start Free 7-Day Trial
              </Button>
            </div>
            
            <Card className="p-6 bg-background/50 backdrop-blur-sm">
              <h3 className="font-bold text-xl mb-4">ROI Calculator</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">2 tracks/month at $79</span>
                  <span className="font-bold">$158</span>
                </div>
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>With Pro (20% off + $49 sub)</span>
                  <span className="font-bold">$126</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-lg font-bold">
                  <span>You save</span>
                  <span className="text-primary">$32/month</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

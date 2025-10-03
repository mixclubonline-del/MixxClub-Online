import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const EngineerAvailability = () => {
  const availability = [
    { genre: 'Hip-Hop', count: 8, status: 'high', tier: 'Professional' },
    { genre: 'Pop/R&B', count: 5, status: 'medium', tier: 'Premium' },
    { genre: 'Electronic', count: 12, status: 'high', tier: 'All Tiers' },
    { genre: 'Rock', count: 3, status: 'low', tier: 'Starter' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'low':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-12"
    >
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold">Engineer Availability Right Now</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {availability.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:border-primary transition-all"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-semibold">{item.genre}</div>
                  <div className="text-sm text-muted-foreground">{item.tier}</div>
                </div>
              </div>
              <Badge className={getStatusColor(item.status)}>
                {item.count} available
              </Badge>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            🔥 <strong>12 Premium spots</strong> left this week • Book now to guarantee your slot
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

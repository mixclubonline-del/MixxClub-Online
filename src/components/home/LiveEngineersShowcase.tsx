import { motion } from 'framer-motion';
import { Star, CheckCircle, Headphones } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useDemoData } from '@/hooks/useDemoData';

export const LiveEngineersShowcase = () => {
  const { data, isLoading } = useDemoData('engineers');
  const engineers = data?.engineers || [];

  if (isLoading) {
    return (
      <section className="py-24 relative overflow-hidden">
        <div className="container px-4">
          <div className="text-center mb-12">
            <div className="h-8 w-48 bg-muted/30 rounded-lg mx-auto animate-pulse" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-muted/20 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
            Live Now
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Top Engineers <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Online</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with world-class audio professionals ready to transform your tracks
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {engineers.slice(0, 3).map((engineer, index) => (
            <motion.div
              key={engineer.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group glass-morphic-card p-6 border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-glow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16 border-2 border-primary/30">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-lg font-bold">
                        {engineer.full_name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{engineer.full_name}</h3>
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{engineer.rating}</span>
                      <span>•</span>
                      <span>{engineer.completed_projects} projects</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {engineer.bio}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {engineer.specialties?.slice(0, 3).map((specialty: string) => (
                    <Badge 
                      key={specialty} 
                      variant="secondary" 
                      className="text-xs bg-primary/10 text-primary border-primary/20"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">${engineer.hourly_rate}/hr</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 text-xs">
                    Available Now
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

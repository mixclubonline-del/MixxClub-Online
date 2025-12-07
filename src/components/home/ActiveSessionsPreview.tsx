import { motion } from 'framer-motion';
import { Music, Users, Clock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDemoData } from '@/hooks/useDemoData';
import { useNavigate } from 'react-router-dom';

export const ActiveSessionsPreview = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useDemoData('sessions');
  const sessions = data?.sessions || [];

  if (isLoading) {
    return (
      <section className="py-24 relative">
        <div className="container px-4">
          <div className="text-center mb-12">
            <div className="h-8 w-64 bg-muted/30 rounded-lg mx-auto animate-pulse" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-muted/20 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
      />

      <div className="container relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            <Music className="w-3 h-3 mr-2" />
            Open Sessions
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Collaboration <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Happening Now</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join active sessions or post your own to connect with the perfect engineer
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {sessions.slice(0, 2).map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <Card className="glass-morphic-card p-6 border-primary/20 hover:border-primary/40 transition-all duration-300 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg line-clamp-1">{session.title}</h3>
                      <p className="text-sm text-muted-foreground">by {session.host?.name}</p>
                    </div>
                  </div>
                  <Badge 
                    className={
                      session.status === 'open' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }
                  >
                    {session.status === 'open' ? 'Open' : 'In Progress'}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {session.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">
                    {session.genre}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {session.session_type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {session.budget_range}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {session.visibility}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Just posted
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="gap-2 group"
          >
            Start Collaborating
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

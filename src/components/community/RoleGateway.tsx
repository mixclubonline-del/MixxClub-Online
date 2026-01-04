import { motion } from 'framer-motion';
import { Mic2, Headphones, ArrowRight, Sparkles, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const RoleGateway = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-2"
        >
          Ready to Join?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Choose your path and start your journey
        </motion.p>
      </div>

      {/* Gateway Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Artist Path */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-card to-primary/5 border border-primary/30 p-6 group cursor-pointer"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Animated Particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-50"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}

          <div className="relative">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
              <Mic2 className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-2xl font-bold mb-2">I'm an Artist</h3>
            <p className="text-muted-foreground mb-6">
              Get your music professionally mixed and mastered by top engineers
            </p>

            {/* Benefits */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>AI-powered engineer matching</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span>Real-time collaboration sessions</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-primary" />
                <span>Premiere your tracks to fans</span>
              </div>
            </div>

            <Link to="/for-artists">
              <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
                Start as Artist
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Engineer Path */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-cyan/20 via-card to-accent-cyan/5 border border-accent-cyan/30 p-6 group cursor-pointer"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-accent-cyan/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Animated Particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-accent-cyan rounded-full opacity-0 group-hover:opacity-50"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}

          <div className="relative">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-cyan/50 flex items-center justify-center mb-4 shadow-lg shadow-accent-cyan/20">
              <Headphones className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-2xl font-bold mb-2">I'm an Engineer</h3>
            <p className="text-muted-foreground mb-6">
              Build your client base and earn from your mixing expertise
            </p>

            {/* Benefits */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-accent-cyan" />
                <span>10 revenue streams available</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-accent-cyan" />
                <span>Artists come to you automatically</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-accent-cyan" />
                <span>Full CRM & business tools</span>
              </div>
            </div>

            <Link to="/for-engineers">
              <Button className="w-full gap-2 bg-accent-cyan hover:bg-accent-cyan/90 text-background">
                Start as Engineer
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleGateway;

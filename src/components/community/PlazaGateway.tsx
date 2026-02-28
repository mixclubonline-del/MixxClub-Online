import { motion } from 'framer-motion';
import { Mic2, Headphones, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const PlazaGateway = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="relative"
    >
      {/* Glass container */}
      <div className="relative backdrop-blur-xl bg-card/30 rounded-2xl border border-white/10 p-8 overflow-hidden">
        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              '0 0 20px hsl(var(--primary) / 0.2), inset 0 0 20px hsl(var(--primary) / 0.05)',
              '0 0 40px hsl(var(--primary) / 0.3), inset 0 0 40px hsl(var(--primary) / 0.1)',
              '0 0 20px hsl(var(--primary) / 0.2), inset 0 0 20px hsl(var(--primary) / 0.05)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        <div className="relative text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Join the Community</h2>
          <p className="text-muted-foreground">Choose your path and enter Mixxclub City</p>
        </div>
        
        {/* Gateway cards */}
        <div className="relative grid md:grid-cols-2 gap-6">
          {/* Artist Gateway */}
          <Link to="/for-artists" className="group">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 transition-all duration-300 group-hover:border-primary/50"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                style={{ boxShadow: '0 0 30px hsl(var(--primary) / 0.3)' }} 
              />
              
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 mx-auto">
                  <Mic2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">I'm an Artist</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get your music mixed and mastered by professionals
                </p>
                <Button className="w-full gap-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
                  Enter as Artist
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </Link>
          
          {/* Engineer Gateway */}
          <Link to="/for-engineers" className="group">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative p-6 rounded-xl bg-gradient-to-br from-accent-cyan/10 to-accent-blue/10 border border-accent-cyan/20 transition-all duration-300 group-hover:border-accent-cyan/50"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                style={{ boxShadow: '0 0 30px hsl(var(--accent-cyan) / 0.3)' }} 
              />
              
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-accent-cyan/20 flex items-center justify-center mb-4 mx-auto">
                  <Headphones className="w-8 h-8 text-accent-cyan" />
                </div>
                <h3 className="text-xl font-bold mb-2">I'm an Engineer</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with artists and grow your business
                </p>
                <Button className="w-full gap-2 bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan border border-accent-cyan/30">
                  Enter as Engineer
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PlazaGateway;

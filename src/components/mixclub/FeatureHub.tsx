import { motion } from 'framer-motion';
import { ShoppingBag, Trophy, BarChart3, Zap, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const FeatureHub = () => {
  return (
    <section className="relative py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A complete ecosystem for music creation, collaboration, and growth
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={ShoppingBag}
            title="Marketplace"
            description="Buy and sell plugin preset packs from industry pros. FabFilter, UAD, Slate, Valhalla — all in one place."
            color="primary"
            delay={0}
          />
          <FeatureCard
            icon={Trophy}
            title="Mix Battles"
            description="Compete globally in remix contests. Climb the leaderboard and showcase your skills to the world."
            color="cyan"
            delay={0.1}
          />
          <FeatureCard
            icon={BarChart3}
            title="Analytics Dashboard"
            description="Track project progress, earnings, and performance metrics in real-time with beautiful visualizations."
            color="blue"
            delay={0.2}
          />
          <FeatureCard
            icon={Zap}
            title="AI-Powered Tools"
            description="From stem separation to intelligent EQ suggestions, let AI handle the heavy lifting."
            color="primary"
            delay={0.3}
          />
          <FeatureCard
            icon={Users}
            title="Community"
            description="Connect with artists and engineers worldwide. Share techniques, get feedback, grow together."
            color="cyan"
            delay={0.4}
          />
          <FeatureCard
            icon={Star}
            title="Unlockables"
            description="Complete projects to earn badges, unlock premium tools, and level up your profile."
            color="blue"
            delay={0.5}
          />
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  color,
  delay 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  color: 'primary' | 'cyan' | 'blue';
  delay: number;
}) => {
  const colorMap = {
    primary: 'from-primary to-primary-glow',
    cyan: 'from-accent-cyan to-accent-blue',
    blue: 'from-accent-blue to-primary',
  };

  const glowMap = {
    primary: 'group-hover:shadow-glow',
    cyan: 'group-hover:shadow-glow-cyan',
    blue: 'group-hover:shadow-glow-blue',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
      className="relative group cursor-pointer"
    >
      <div className={`glass p-6 rounded-xl border border-border hover:border-${color}/50 transition-all duration-300 ${glowMap[color]}`}>
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorMap[color]} p-[2px] mb-4`}>
          <div className="w-full h-full rounded-lg bg-card flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
        </div>

        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-4 text-${color} hover:text-${color}/80 p-0 h-auto font-medium"
        >
          Learn more →
        </Button>
      </div>
    </motion.div>
  );
};

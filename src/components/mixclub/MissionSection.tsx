import { motion } from 'framer-motion';
import { Mic, Headphones, Sparkles } from 'lucide-react';

export const MissionSection = () => {
  return (
    <section className="relative py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Your Sound. Elevated.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Mixxclub Online transforms low-quality, home-recorded tracks into industry-standard, 
            radio-ready songs. The platform empowers artists and engineers to collaborate, compete, 
            and create together — merging traditional audio engineering with cutting-edge AI tools.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <MissionCard
            icon={Mic}
            title="Artists"
            description="Upload stems, receive AI-assisted mix analysis, connect with vetted engineers, and track your project milestones."
            gradient="from-primary to-primary-glow"
            delay={0}
          />
          <MissionCard
            icon={Headphones}
            title="Engineers"
            description="Manage project queues, access AI mix tools, earn badges, and participate in Mix Battles with the community."
            gradient="from-accent-blue to-accent-cyan"
            delay={0.1}
          />
          <MissionCard
            icon={Sparkles}
            title="AI Studio"
            description="Bring old tracks back to life. Upload vintage or poorly recorded vocals and let AI restore, rebuild, and re-master them."
            gradient="from-primary-glow to-accent-blue"
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
};

const MissionCard = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient,
  delay 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  gradient: string;
  delay: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="relative group"
    >
      <div className="glass p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-transparent rounded-2xl transition-all duration-300" />
        
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} p-[2px] mb-6 shadow-glow-sm`}>
          <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
            <Icon className="w-8 h-8 text-foreground" />
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

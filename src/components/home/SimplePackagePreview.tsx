import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const SimplePackagePreview = () => {
  const navigate = useNavigate();

  const packages = [
    {
      name: "Bronze",
      price: "$29",
      description: "Perfect for your first professional mix",
      highlight: false,
      color: "from-orange-600 to-orange-400"
    },
    {
      name: "Silver",
      price: "$79",
      description: "Industry-standard results, unlimited revisions",
      highlight: true,
      color: "from-slate-400 to-slate-300"
    },
    {
      name: "Gold",
      price: "$149",
      description: "Top-tier engineers, express delivery",
      highlight: false,
      color: "from-yellow-600 to-yellow-400"
    }
  ];

  return (
    <section className="min-h-screen flex items-center py-16 md:py-20 relative">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="glass-morphic backdrop-blur-xl border-primary/30 gap-2 px-5 py-2 text-base mb-6">
              <Sparkles className="w-4 h-4" />
              Simple Pricing
            </Badge>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              Choose Your Package
            </h2>
            <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
              Professional mixing & mastering at every budget. All packages include AI session prep.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`
                glass-morphic-card backdrop-blur-xl relative overflow-hidden p-8 md:p-10 h-full flex flex-col
                ${pkg.highlight ? 'border-2 border-primary' : 'border-primary/20'}
                hover:scale-105 transition-all duration-300 group
              `}>
                {/* Gradient Accent Top */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${pkg.color}`} />

                {/* Highlight Badge */}
                {pkg.highlight && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}

                {/* Package Name */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold">{pkg.name}</h3>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className={`text-5xl font-black bg-gradient-to-r ${pkg.color} bg-clip-text text-transparent`}>
                    {pkg.price}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">per track</div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-8 flex-grow">
                  {pkg.description}
                </p>

                {/* CTA */}
                <Button 
                  variant={pkg.highlight ? "default" : "outline"}
                  className="w-full group-hover:shadow-md transition-shadow"
                  onClick={() => navigate('/pricing')}
                  size="lg"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* View All Plans CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Button 
            variant="ghost" 
            size="lg"
            onClick={() => navigate('/pricing')}
            className="gap-2 text-lg"
          >
            See All Plans & Features
            <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Compare all packages, add-ons, and mastering options
          </p>
        </motion.div>
      </div>
    </section>
  );
};

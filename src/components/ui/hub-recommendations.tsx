import { Link } from 'react-router-dom';
import { Sword, GraduationCap, ShoppingBag, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Recommendation {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

const allRecommendations: Recommendation[] = [
  {
    title: 'Battle in Arena',
    description: 'Test your skills in mix battles',
    href: '/arena',
    icon: <Sword className="w-5 h-5" />,
    color: 'from-destructive to-orange-600'
  },
  {
    title: 'Learn & Grow',
    description: 'Master advanced techniques',
    href: '/education',
    icon: <GraduationCap className="w-5 h-5" />,
    color: 'from-accent-blue to-accent-cyan'
  },
  {
    title: 'Explore Marketplace',
    description: 'Get samples and presets',
    href: '/marketplace',
    icon: <ShoppingBag className="w-5 h-5" />,
    color: 'from-primary to-secondary'
  },
  {
    title: 'AI Studio',
    description: 'AI-powered production tools',
    href: '/ai-studio',
    icon: <Zap className="w-5 h-5" />,
    color: 'from-accent-purple to-accent-magenta'
  }
];

interface HubRecommendationsProps {
  excludeHref?: string;
  maxItems?: number;
}

export const HubRecommendations = ({ excludeHref, maxItems = 3 }: HubRecommendationsProps) => {
  const recommendations = allRecommendations
    .filter(rec => rec.href !== excludeHref)
    .slice(0, maxItems);

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6 text-center">
        While you're here, check out...
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {recommendations.map((rec) => (
          <Link key={rec.href} to={rec.href}>
            <Card className="group hover:scale-105 transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] cursor-pointer h-full">
              <CardHeader>
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${rec.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {rec.icon}
                </div>
                <CardTitle className="text-xl">{rec.title}</CardTitle>
                <CardDescription className="text-base">
                  {rec.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Clock, Award, TrendingUp, DollarSign, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stat {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

interface MobileStatsCarouselProps {
  stats: {
    activeProjects: number;
    completedProjects: number;
    averageRating: number;
    totalEarnings: number;
    pendingEarnings: number;
    currentStreak: number;
  };
}

export const MobileStatsCarousel = ({ stats }: MobileStatsCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const statCards: Stat[] = [
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      subtitle: 'In progress',
      icon: <Music className="w-5 h-5" />,
      color: 'text-primary',
    },
    {
      title: 'Completed',
      value: stats.completedProjects,
      subtitle: 'All time',
      icon: <Clock className="w-5 h-5" />,
      color: 'text-green-500',
    },
    {
      title: 'Rating',
      value: stats.averageRating.toFixed(1),
      subtitle: 'Average',
      icon: <Star className="w-5 h-5" />,
      color: 'text-yellow-500',
    },
    {
      title: 'Total Earnings',
      value: `$${stats.totalEarnings.toLocaleString()}`,
      subtitle: 'All time',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-emerald-500',
    },
    {
      title: 'Pending',
      value: `$${stats.pendingEarnings.toLocaleString()}`,
      subtitle: 'To be paid',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-orange-500',
    },
    {
      title: 'Streak',
      value: `${stats.currentStreak} days`,
      subtitle: 'Current',
      icon: <Award className="w-5 h-5" />,
      color: 'text-purple-500',
    },
  ];

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="md:hidden space-y-4">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {statCards.map((stat, index) => (
            <div key={index} className="min-w-full px-2">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className={cn('flex items-center gap-2 text-base', stat.color)}>
                    {stat.icon}
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {statCards.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={cn(
              'h-2 rounded-full transition-all',
              currentIndex === index ? 'w-8 bg-primary' : 'w-2 bg-muted'
            )}
            aria-label={`Go to stat ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

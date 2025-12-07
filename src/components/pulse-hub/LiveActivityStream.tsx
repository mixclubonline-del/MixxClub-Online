import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, CheckCircle, Trophy, Award, UserPlus } from 'lucide-react';
import { useDemoData } from '@/hooks/useDemoData';

export default function LiveActivityStream() {
  const { data, isLoading } = useDemoData('activity');

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <Card key={i} className="bg-card/20 backdrop-blur-sm border-white/5">
            <CardContent className="p-3 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-64 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const activities = data?.activity || [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'upload': return <Upload className="w-4 h-4 text-primary" />;
      case 'completion': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'battle': return <Trophy className="w-4 h-4 text-accent-cyan" />;
      case 'achievement': return <Award className="w-4 h-4 text-yellow-500" />;
      case 'signup': return <UserPlus className="w-4 h-4 text-accent-blue" />;
      default: return <Upload className="w-4 h-4 text-primary" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      upload: 'Upload',
      completion: 'Completed',
      battle: 'Battle',
      achievement: 'Achievement',
      signup: 'New Member'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
      {activities.map((activity, i) => (
        <Card key={i} className="bg-card/20 backdrop-blur-sm border-white/5 hover:border-primary/20 transition-all">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={activity.icon} />
                <AvatarFallback>{activity.message[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                {getIcon(activity.type)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{activity.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {getTypeLabel(activity.type)}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {activity.time}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

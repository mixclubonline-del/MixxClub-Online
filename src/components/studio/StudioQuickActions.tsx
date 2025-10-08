import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Radio,
  Headphones,
  Sparkles,
  Users,
  Upload,
  Music
} from 'lucide-react';

export const StudioQuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Radio,
      label: 'Start Recording',
      description: 'Solo session with AI assistance',
      onClick: () => navigate('/ai-studio-workspace'),
      color: 'text-red-500',
    },
    {
      icon: Users,
      label: 'Collaborate',
      description: 'Start or join a session',
      onClick: () => {}, // Handled by SessionManager
      color: 'text-blue-500',
    },
    {
      icon: Headphones,
      label: 'Mix Project',
      description: 'Open existing project',
      onClick: () => navigate('/artist-crm'),
      color: 'text-purple-500',
    },
    {
      icon: Sparkles,
      label: 'AI Master',
      description: 'Quick mastering suite',
      onClick: () => navigate('/ai-studio-workspace'),
      color: 'text-yellow-500',
    },
    {
      icon: Upload,
      label: 'Upload Audio',
      description: 'Import tracks to work on',
      onClick: () => navigate('/ai-studio-workspace'),
      color: 'text-green-500',
    },
    {
      icon: Music,
      label: 'Mixing Battle',
      description: 'Join the competition',
      onClick: () => navigate('/battles'),
      color: 'text-pink-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Card
            key={action.label}
            className="p-6 hover:border-primary/50 transition-all cursor-pointer group"
            onClick={action.onClick}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors`}>
                <Icon className={`h-6 w-6 ${action.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  {action.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

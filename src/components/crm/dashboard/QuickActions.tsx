import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Search, Zap } from 'lucide-react';

interface QuickActionsProps {
  role: 'artist' | 'engineer';
  onAction: (action: string) => void;
}

export const QuickActions = ({ role, onAction }: QuickActionsProps) => {
  const artistActions = [
    { id: 'new-project', label: 'New Project', icon: Plus },
    { id: 'upload-track', label: 'Upload Track', icon: Upload },
    { id: 'find-engineer', label: 'Find Engineer', icon: Search },
    { id: 'ai-match', label: 'AI Match', icon: Zap },
  ];

  const engineerActions = [
    { id: 'browse-jobs', label: 'Browse Jobs', icon: Search },
    { id: 'upload-portfolio', label: 'Upload Sample', icon: Upload },
    { id: 'ai-match', label: 'AI Match', icon: Zap },
    { id: 'new-session', label: 'New Session', icon: Plus },
  ];

  const actions = role === 'artist' ? artistActions : engineerActions;

  return (
    <Card variant="glass-near" hover="lift">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant="outline"
            className="h-20 flex flex-col gap-2"
            onClick={() => onAction(id)}
          >
            <Icon className="h-5 w-5" />
            <span className="text-sm">{label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

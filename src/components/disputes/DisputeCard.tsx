import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface DisputeCardProps {
  dispute: any;
  onResolve?: (disputeId: string) => void;
  canResolve?: boolean;
}

export const DisputeCard = ({ dispute, onResolve, canResolve }: DisputeCardProps) => {
  const statusIcons = {
    'open': <AlertCircle className="h-4 w-4" />,
    'in_progress': <Clock className="h-4 w-4" />,
    'resolved': <CheckCircle className="h-4 w-4" />
  };

  const statusColors = {
    'open': 'destructive',
    'in_progress': 'default',
    'resolved': 'secondary'
  } as const;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {dispute.projects?.title || 'Unknown Project'}
            </CardTitle>
            <CardDescription>
              Raised by {dispute.profiles?.full_name} on {format(new Date(dispute.created_at), 'PPp')}
            </CardDescription>
          </div>
          <Badge variant={statusColors[dispute.status as keyof typeof statusColors]} className="gap-1">
            {statusIcons[dispute.status as keyof typeof statusIcons]}
            {dispute.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-1">Reason</p>
          <p className="text-sm text-muted-foreground">{dispute.reason}</p>
        </div>
        {dispute.description && (
          <div>
            <p className="text-sm font-medium mb-1">Description</p>
            <p className="text-sm text-muted-foreground">{dispute.description}</p>
          </div>
        )}
        {dispute.resolution && (
          <div>
            <p className="text-sm font-medium mb-1">Resolution</p>
            <p className="text-sm text-muted-foreground">{dispute.resolution}</p>
          </div>
        )}
        {canResolve && dispute.status !== 'resolved' && (
          <Button 
            onClick={() => onResolve?.(dispute.id)}
            className="w-full"
          >
            Resolve Dispute
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

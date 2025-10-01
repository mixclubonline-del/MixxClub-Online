import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music, Calendar, DollarSign, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MobileJobCardProps {
  job: {
    id: string;
    title: string;
    description?: string;
    genre?: string;
    budget?: number;
    deadline?: string;
    service_type: string;
    created_at: string;
  };
  onApply: (jobId: string) => void;
  onViewDetails: (jobId: string) => void;
}

export const MobileJobCard = ({ job, onApply, onViewDetails }: MobileJobCardProps) => {
  return (
    <Card className="p-4 space-y-3 active:scale-[0.98] transition-transform">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base line-clamp-2 mb-1">{job.title}</h3>
          {job.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
          )}
        </div>
        <Badge variant="secondary" className="shrink-0">
          {job.service_type}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        {job.genre && (
          <div className="flex items-center gap-1">
            <Music className="h-4 w-4" />
            <span>{job.genre}</span>
          </div>
        )}
        {job.budget && (
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>${job.budget}</span>
          </div>
        )}
        {job.deadline && (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDistanceToNow(new Date(job.deadline), { addSuffix: true })}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button 
          onClick={() => onApply(job.id)}
          className="flex-1"
          size="sm"
        >
          Quick Apply
        </Button>
        <Button
          onClick={() => onViewDetails(job.id)}
          variant="outline"
          size="sm"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

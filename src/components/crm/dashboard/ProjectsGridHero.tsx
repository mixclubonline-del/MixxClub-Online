import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ProjectsGridHeroProps {
  userRole: 'artist' | 'engineer';
}

export const ProjectsGridHero = ({ userRole }: ProjectsGridHeroProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects Grid</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This feature requires additional database setup. Please use the main projects dashboard.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

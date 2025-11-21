import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const MusicalProfile = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Musical Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This feature requires additional database tables that haven't been set up yet.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

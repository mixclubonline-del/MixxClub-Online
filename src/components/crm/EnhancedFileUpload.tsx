import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const EnhancedFileUpload = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enhanced File Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please use the audio file upload feature in the main project dashboard.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

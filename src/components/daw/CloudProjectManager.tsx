import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CloudProjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudProjectManager = ({ isOpen, onClose }: CloudProjectManagerProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="glass p-6 max-w-4xl w-full">
        <CardHeader>
          <CardTitle>Cloud Project Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This feature requires additional database tables that haven't been set up yet.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const PackagesShop = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Packages Shop</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            View available mixing and mastering packages in the main services section.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

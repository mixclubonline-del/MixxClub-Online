import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { SessionInvitationsList } from '@/components/collaboration/SessionInvitationsList';
import { PublicSessionBrowser } from '@/components/collaboration/PublicSessionBrowser';

export const EngineerCRMDashboard = () => {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Engineer CRM Dashboard is currently being rebuilt. Please use the Session Invitations and Public Sessions features below.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Session Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionInvitationsList />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Browse Public Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <PublicSessionBrowser />
        </CardContent>
      </Card>
    </div>
  );
};

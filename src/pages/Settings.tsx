import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { PrivacySettings } from '@/components/settings/PrivacySettings';
import { SubscriptionSettings } from '@/components/settings/SubscriptionSettings';

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-12 px-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account preferences and privacy</p>
          </div>

          <Tabs defaultValue="subscription" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscription" className="mt-6">
              <SubscriptionSettings />
            </TabsContent>
            
            <TabsContent value="account" className="mt-6">
              <AccountSettings />
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-6">
              <NotificationSettings />
            </TabsContent>
            
            <TabsContent value="privacy" className="mt-6">
              <PrivacySettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

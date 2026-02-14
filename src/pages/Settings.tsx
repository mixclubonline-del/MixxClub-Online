import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountSettings } from '@/components/settings/AccountSettings';

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

          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="mt-6">
              <AccountSettings />
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-6">
              <p className="text-muted-foreground">Notification preferences coming soon...</p>
            </TabsContent>
            
            <TabsContent value="privacy" className="mt-6">
              <p className="text-muted-foreground">Privacy settings coming soon...</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JobPool } from '@/components/JobPool';
import { JobPostingForm } from '@/components/JobPostingForm';

import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';

export const JobBoard = () => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-background to-muted/20 ${isMobile ? 'pb-20' : ''}`}>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Mixxclub Job Board</h1>
            <p className="text-xl text-muted-foreground">
              Connect artists with professional engineers
            </p>
          </div>

          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
              <TabsTrigger value="post">Post a Job</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              <JobPool />
            </TabsContent>

            <TabsContent value="post" className="space-y-6">
              <JobPostingForm />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {isMobile && <MobileBottomNav />}
    </div>
  );
};
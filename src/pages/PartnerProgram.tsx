/**
 * Partner Program Page
 * Dedicated page for the partner/affiliate program
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layouts/AppLayout';
import PartnerProgramDashboard from '@/components/partner/PartnerProgramDashboard';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const PartnerProgram: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth?redirect=/partner-program" replace />;
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container max-w-6xl mx-auto py-8 px-4"
      >
        <PartnerProgramDashboard />
      </motion.div>
    </AppLayout>
  );
};

export default PartnerProgram;

import React from 'react';
import { DirectMessaging } from '@/components/crm/DirectMessaging';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * MessagingTest - Standalone test page for Direct Messaging system
 * 
 * This page allows testing the full direct messaging functionality including:
 * - Real-time message updates
 * - Conversation list
 * - Message sending/receiving
 * - Read receipts
 * - File attachments
 */
const MessagingTest: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-white text-lg">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.history.back()}
                            className="text-slate-400 hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Direct Messaging Test
                            </h1>
                            <p className="text-sm text-slate-400">
                                Real-time messaging system with live updates
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-slate-400">
                            Real-time enabled
                        </span>
                    </div>
                </div>
            </div>

            {/* Messaging Component */}
            <DirectMessaging userType="artist" />
        </div>
    );
};

export default MessagingTest;

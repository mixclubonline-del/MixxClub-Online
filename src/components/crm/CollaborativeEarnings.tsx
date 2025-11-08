/**
 * CollaborativeEarnings Component
 * 
 * Displays Collaborative Earnings Dashboard showing:
 * - Total partnership revenue and metrics
 * - Active partnerships with earnings breakdown
 * - Recent collaborative projects
 * - Payment links for sharing
 * - Links back to conversations that generated revenue
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DollarSign,
    Users,
    TrendingUp,
    Handshake,
    Music,
    MessageSquare,
    Plus,
    Copy,
    Link as LinkIcon,
    CheckCircle,
    Clock,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import { usePartnershipEarnings } from '@/hooks/usePartnershipEarnings';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CollaborativeEarningsProps {
    userType: 'artist' | 'engineer';
}

export const CollaborativeEarnings: React.FC<CollaborativeEarningsProps> = ({ userType }) => {
    const { user } = useAuth();
    const {
        summary,
        loading,
        fetchAllData,
        createPartnership,
        acceptPartnership,
        createProject,
        createPaymentLink,
    } = usePartnershipEarnings();

    const [activeTab, setActiveTab] = useState('overview');
    const [showCreatePartner, setShowCreatePartner] = useState(false);
    const [partnerId, setPartnerId] = useState('');

    useEffect(() => {
        if (user?.id) {
            fetchAllData();
        }
    }, [user?.id, fetchAllData]);

    if (loading && !summary) {
        return (
            <div className="space-y-6 p-6">
                <div className="h-32 bg-slate-800 rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-slate-800 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="flex items-center justify-center h-96">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <Users className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                        <h3 className="font-semibold mb-2">No Partnerships Yet</h3>
                        <p className="text-slate-400 mb-4">
                            Start collaborating with other {userType === 'artist' ? 'engineers' : 'artists'} to earn shared revenue.
                        </p>
                        <Button onClick={() => setShowCreatePartner(true)}>
                            Create Partnership
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(value);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Collaborative Earnings</h2>
                    <p className="text-slate-400 mt-1">
                        Track revenue from partnerships with {userType === 'artist' ? 'engineers' : 'artists'}
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreatePartner(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Partnership
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            Total Partnership Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(summary.total_partnership_revenue)}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            {summary.active_partnerships} active partnership{summary.active_partnerships !== 1 ? 's' : ''}
                        </p>
                    </CardContent>
                </Card>

                {/* Active Partnerships */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <Handshake className="w-4 h-4 text-blue-500" />
                            Active Partnerships
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.active_partnerships}</div>
                        <p className="text-xs text-slate-400 mt-1">
                            {summary.recent_projects.length} active projects
                        </p>
                    </CardContent>
                </Card>

                {/* Pending Payments */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-yellow-500" />
                            Pending Payments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(summary.pending_payments_total)}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Awaiting settlement</p>
                    </CardContent>
                </Card>

                {/* Average Partnership Value */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-purple-500" />
                            Avg Partnership Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(summary.average_partnership_value)}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Per partnership</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-slate-800 border border-slate-700">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="partners">Partners</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="payments">Payment Links</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle>Collaboration Activity</CardTitle>
                            <CardDescription>
                                Your recent collaborative projects and partners
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {summary.recent_projects.length === 0 ? (
                                <div className="text-center py-8">
                                    <Music className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                                    <p className="text-slate-400">
                                        No collaborative projects yet
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {summary.recent_projects.map((project) => (
                                        <div
                                            key={project.id}
                                            className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-blue-500 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                                    <Music className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold">{project.title}</h4>
                                                    <p className="text-sm text-slate-400">
                                                        {project.project_type} • {project.messages_count} messages
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-green-400">
                                                    {formatCurrency(project.total_revenue)}
                                                </div>
                                                <Badge
                                                    variant={
                                                        project.status === 'completed' ? 'default' : 'secondary'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {project.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Partners Tab */}
                <TabsContent value="partners" className="space-y-4">
                    {summary.top_partners.length === 0 ? (
                        <Card className="bg-slate-800 border-slate-700">
                            <CardContent className="pt-6 text-center">
                                <Users className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                                <p className="text-slate-400">No partners yet</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {summary.top_partners.map((partner) => (
                                <Card
                                    key={partner.partnership_id}
                                    className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {partner.partner_avatar ? (
                                                    <img
                                                        src={partner.partner_avatar}
                                                        alt={partner.partner_name}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                                        <Users className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-semibold">{partner.partner_name}</h4>
                                                    <p className="text-xs text-slate-400 capitalize">
                                                        {partner.partner_type}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div
                                                    className={cn(
                                                        'text-2xl font-bold',
                                                        partner.health_score >= 75
                                                            ? 'text-green-400'
                                                            : partner.health_score >= 50
                                                                ? 'text-yellow-400'
                                                                : 'text-red-400'
                                                    )}
                                                >
                                                    {Math.round(partner.health_score)}
                                                </div>
                                                <p className="text-xs text-slate-400">Health</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Revenue */}
                                        <div className="bg-slate-700 p-3 rounded-lg">
                                            <p className="text-sm text-slate-400 mb-1">Year to Date</p>
                                            <div className="text-2xl font-bold text-green-400">
                                                {formatCurrency(partner.year_to_date)}
                                            </div>
                                        </div>

                                        {/* Projects */}
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <p className="text-xs text-slate-400 mb-1">Active Projects</p>
                                                <p className="text-lg font-semibold">
                                                    {partner.active_projects}
                                                </p>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-slate-400 mb-1">Pending Payments</p>
                                                <p className="text-lg font-semibold text-yellow-400">
                                                    {formatCurrency(partner.pending_payments)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2">
                                            <Button size="sm" variant="outline" className="flex-1">
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                Message
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Project
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Projects Tab */}
                <TabsContent value="projects" className="space-y-4">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle>Recent Collaborative Projects</CardTitle>
                            <CardDescription>
                                Projects and earnings from artist-engineer collaborations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {summary.recent_projects.length === 0 ? (
                                <div className="text-center py-8">
                                    <Music className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                                    <p className="text-slate-400">No projects yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {summary.recent_projects.map((project) => (
                                        <div
                                            key={project.id}
                                            className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-blue-500 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold flex items-center gap-2">
                                                        {project.title}
                                                        <Badge variant="secondary" className="text-xs">
                                                            {project.project_type}
                                                        </Badge>
                                                    </h4>
                                                    <p className="text-sm text-slate-400 mt-1">
                                                        {project.messages_count} messages • {project.milestone_count} milestones
                                                    </p>
                                                </div>
                                                <Badge
                                                    className={cn(
                                                        project.status === 'completed'
                                                            ? 'bg-green-600'
                                                            : project.status === 'in_progress'
                                                                ? 'bg-blue-600'
                                                                : 'bg-slate-600'
                                                    )}
                                                >
                                                    {project.status}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-xs text-slate-400">Total Revenue</p>
                                                    <p className="font-semibold text-green-400">
                                                        {formatCurrency(project.total_revenue)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400">Your Share</p>
                                                    <p className="font-semibold">
                                                        {formatCurrency(
                                                            userType === 'artist'
                                                                ? project.artist_earnings
                                                                : project.engineer_earnings
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400">Last Updated</p>
                                                    <p className="font-semibold text-xs">
                                                        {project.last_message_at
                                                            ? formatDistanceToNow(
                                                                new Date(project.last_message_at),
                                                                { addSuffix: true }
                                                            )
                                                            : 'Never'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent value="payments" className="space-y-4">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Payment Links</CardTitle>
                                <CardDescription>
                                    Pending and completed payment links
                                </CardDescription>
                            </div>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Link
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <LinkIcon className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                                <p className="text-slate-400">
                                    No payment links created yet
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

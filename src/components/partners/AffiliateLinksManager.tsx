/**
 * AffiliateLinksManager Component
 * Manage affiliate links, track clicks/conversions, and analyze performance
 */

import React, { useMemo, useState } from 'react';
import { useAffiliateLinks } from '@/hooks/useAffiliateLinks';
import { usePartnerManagement } from '@/hooks/usePartnerManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Copy, ExternalLink, TrendingUp, MousePointer, Target } from 'lucide-react';
import type { AffiliateLink } from '@/stores/partnerStore';

interface AffiliateLinkRowProps {
    link: AffiliateLink;
    onCopy: (url: string) => void;
    isLoading: boolean;
}

const AffiliateLinkRow: React.FC<AffiliateLinkRowProps> = ({ link, onCopy, isLoading }) => {
    const conversionRate = link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(2) : '0.00';
    const avgValue = link.conversions > 0 ? (link.revenue / link.conversions).toFixed(2) : '0.00';

    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-6 py-4">
                <p className="font-mono text-sm text-gray-900">{link.code}</p>
            </td>
            <td className="px-6 py-4">
                <p className="text-sm text-gray-600 truncate max-w-xs">{link.url}</p>
            </td>
            <td className="px-6 py-4">
                <p className="text-sm text-gray-600">
                    {link.campaign ? link.campaign : '-'}
                </p>
            </td>
            <td className="px-6 py-4 text-center">
                <p className="font-semibold text-gray-900">{link.clicks}</p>
            </td>
            <td className="px-6 py-4 text-center">
                <p className="font-semibold text-gray-900">{link.conversions}</p>
            </td>
            <td className="px-6 py-4 text-center">
                <p className="font-semibold text-blue-600">{conversionRate}%</p>
            </td>
            <td className="px-6 py-4 text-right">
                <p className="font-semibold text-green-600">${link.revenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">${avgValue} avg</p>
            </td>
            <td className="px-6 py-4">
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCopy(link.url)}
                        disabled={isLoading}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(link.url, '_blank')}
                        disabled={isLoading}
                        className="border-gray-300"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </div>
            </td>
        </tr>
    );
};

export const AffiliateLinksManager: React.FC = () => {
    const { partners } = usePartnerManagement();
    const {
        createAffiliateLink,
        getPartnerLinks,
        getTopPerformingLinks,
        loading: linkLoading
    } = useAffiliateLinks();

    const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
    const [campaignName, setCampaignName] = useState('');
    const [isCreatingLink, setIsCreatingLink] = useState(false);
    const [sortBy, setSortBy] = useState<'clicks' | 'conversions' | 'revenue'>('revenue');

    const selectedPartner = partners.find((p) => p.id === selectedPartnerId);

    const partnerLinks = useMemo(() => {
        return selectedPartnerId ? getPartnerLinks(selectedPartnerId) : [];
    }, [selectedPartnerId, getPartnerLinks]);

    const topLinks = useMemo(() => {
        return selectedPartnerId ? getTopPerformingLinks(selectedPartnerId, 5) : [];
    }, [selectedPartnerId, getTopPerformingLinks]);

    const stats = useMemo(() => {
        return {
            totalLinks: partnerLinks.length,
            totalClicks: partnerLinks.reduce((sum, l) => sum + l.clicks, 0),
            totalConversions: partnerLinks.reduce((sum, l) => sum + l.conversions, 0),
            totalRevenue: partnerLinks.reduce((sum, l) => sum + l.revenue, 0),
            avgConversionRate: partnerLinks.length > 0
                ? (partnerLinks.reduce((sum, l) => sum + (l.clicks > 0 ? (l.conversions / l.clicks) * 100 : 0), 0) / partnerLinks.length).toFixed(2)
                : '0.00',
        };
    }, [partnerLinks]);

    const chartData = useMemo(() => {
        return topLinks.map((link) => ({
            code: link.code,
            clicks: link.clicks,
            conversions: link.conversions,
            revenue: link.revenue,
        }));
    }, [topLinks]); const handleCreateLink = async () => {
        if (!selectedPartnerId) {
            return;
        }

        setIsCreatingLink(true);
        try {
            await createAffiliateLink(selectedPartnerId, campaignName || undefined);
            setCampaignName('');
        } catch (error) {
            console.error('Failed to create affiliate link:', error);
        } finally {
            setIsCreatingLink(false);
        }
    };

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Affiliate Links Manager</h1>
                    <p className="text-gray-600">Create and manage affiliate links for partners</p>
                </div>
            </div>

            {/* Partner Selection */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                        <SelectTrigger className="w-full md:w-64">
                            <SelectValue placeholder="Select a partner..." />
                        </SelectTrigger>
                        <SelectContent>
                            {partners.map((partner) => (
                                <SelectItem key={partner.id} value={partner.id}>
                                    {partner.companyName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedPartnerId && (
                <>
                    {/* Stats */}
                    <div className="bg-white border-b border-gray-200 px-6 py-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <Card className="border-0 shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-gray-600 mb-1">Total Links</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stats.totalLinks}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-gray-600 mb-1">Total Clicks</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {stats.totalClicks}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-gray-600 mb-1">Conversions</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {stats.totalConversions}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-gray-600 mb-1">Total Revenue</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            ${stats.totalRevenue.toFixed(2)}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-gray-600 mb-1">Conv. Rate</p>
                                        <p className="text-2xl font-bold text-orange-600">
                                            {stats.avgConversionRate}%
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Create Link Form */}
                    <div className="bg-white border-b border-gray-200 px-6 py-6">
                        <div className="max-w-7xl mx-auto">
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Create New Link</CardTitle>
                                    <CardDescription>Generate a new affiliate link for your campaign</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Campaign Name (Optional)
                                            </label>
                                            <Input
                                                placeholder="e.g., Summer 2024 Campaign"
                                                value={campaignName}
                                                onChange={(e) => setCampaignName(e.target.value)}
                                                className="border-gray-300"
                                            />
                                        </div>

                                        <div className="flex items-end">
                                            <Button
                                                onClick={handleCreateLink}
                                                disabled={isCreatingLink}
                                                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                {isCreatingLink ? 'Creating...' : 'Create Link'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Performance Chart */}
                    {chartData.length > 0 && (
                        <div className="bg-white border-b border-gray-200 px-6 py-6">
                            <div className="max-w-7xl mx-auto">
                                <Card className="border-0 shadow-sm">
                                    <CardHeader>
                                        <CardTitle>Top Performing Links</CardTitle>
                                        <CardDescription>Your best performing affiliate links</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="code" />
                                                <YAxis yAxisId="left" />
                                                <YAxis yAxisId="right" orientation="right" />
                                                <Tooltip />
                                                <Legend />
                                                <Bar yAxisId="left" dataKey="clicks" fill="#3b82f6" />
                                                <Bar yAxisId="left" dataKey="conversions" fill="#10b981" />
                                                <Bar yAxisId="right" dataKey="revenue" fill="#f59e0b" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Links Table */}
                    <div className="bg-white px-6 py-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="mb-4 flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-900">All Links</h2>
                                <Select value={sortBy} onValueChange={(value) => {
                                    if (value === 'clicks' || value === 'conversions' || value === 'revenue') {
                                        setSortBy(value as 'clicks' | 'conversions' | 'revenue');
                                    }
                                }}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="revenue">Sort by Revenue</SelectItem>
                                        <SelectItem value="clicks">Sort by Clicks</SelectItem>
                                        <SelectItem value="conversions">Sort by Conversions</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {linkLoading ? (
                                <div className="text-center py-12 text-gray-600">Loading links...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Code</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">URL</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Campaign</th>
                                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                                                    <span className="flex items-center justify-center gap-1">
                                                        <MousePointer className="h-4 w-4" />
                                                        Clicks
                                                    </span>
                                                </th>
                                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                                                    <span className="flex items-center justify-center gap-1">
                                                        <Target className="h-4 w-4" />
                                                        Conversions
                                                    </span>
                                                </th>
                                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Conv. Rate</th>
                                                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Revenue</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {partnerLinks.map((link) => (
                                                <AffiliateLinkRow
                                                    key={link.id}
                                                    link={link}
                                                    onCopy={handleCopy}
                                                    isLoading={linkLoading}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                    {partnerLinks.length === 0 && (
                                        <div className="text-center py-12 text-gray-500">
                                            No affiliate links created yet. Create your first link above!
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AffiliateLinksManager;

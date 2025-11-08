/**
 * PartnerDashboard Component
 * Partner management dashboard for admins to view, approve, and manage partners
 */

import React, { useMemo } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import type { Partner } from '@/stores/partnerStore';

const statusColors: Record<Partner['status'], string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    suspended: 'bg-red-100 text-red-800',
    inactive: 'bg-gray-100 text-gray-800',
};

const tierColors: Record<Partner['tier'], string> = {
    bronze: 'bg-yellow-600',
    silver: 'bg-gray-400',
    gold: 'bg-yellow-500',
    platinum: 'bg-purple-600',
};

interface PartnerRowProps {
    partner: Partner;
    onApprove: (id: string) => Promise<void>;
    onSuspend: (id: string) => Promise<void>;
    onSelect: (partner: Partner) => void;
    isLoading: boolean;
}

const PartnerRow: React.FC<PartnerRowProps> = ({ partner, onApprove, onSuspend, onSelect, isLoading }) => {
    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-6 py-4">
                <div>
                    <p className="font-semibold text-gray-900">{partner.companyName}</p>
                    <p className="text-sm text-gray-500">{partner.email}</p>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${tierColors[partner.tier]}`} />
                    <span className="capitalize text-sm font-medium">{partner.tier}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <Badge className={statusColors[partner.status]}>
                    {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                </Badge>
            </td>
            <td className="px-6 py-4">
                <div className="text-right">
                    <p className="font-semibold text-gray-900">${partner.metrics.totalSales.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{partner.metrics.totalReferrals} referrals</p>
                </div>
            </td>
            <td className="px-6 py-4">
                <p className="font-semibold text-green-600">${partner.metrics.totalCommission.toLocaleString()}</p>
            </td>
            <td className="px-6 py-4">
                <p className="text-sm text-gray-600">{partner.commissionRate}%</p>
            </td>
            <td className="px-6 py-4">
                <div className="flex gap-2">
                    {partner.status === 'pending' && (
                        <Button
                            size="sm"
                            onClick={() => onApprove(partner.id)}
                            disabled={isLoading}
                            className="bg-green-600 text-white hover:bg-green-700"
                        >
                            Approve
                        </Button>
                    )}
                    {partner.status === 'active' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSuspend(partner.id)}
                            disabled={isLoading}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                            Suspend
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSelect(partner)}
                        className="text-blue-600 hover:bg-blue-50"
                    >
                        View
                    </Button>
                </div>
            </td>
        </tr>
    );
};

export const PartnerDashboard: React.FC = () => {
    const {
        partners,
        loading,
        approvePartner,
        suspendPartner,
        selectPartner,
        searchPartners,
        filterPartners,
        getFilteredPartners,
    } = usePartnerManagement();

    const filteredPartners = getFilteredPartners();

    const stats = useMemo(
        () => ({
            totalPartners: partners.length,
            activePartners: partners.filter((p) => p.status === 'active').length,
            totalCommissions: partners.reduce((sum, p) => sum + p.metrics.totalCommission, 0),
            totalReferrals: partners.reduce((sum, p) => sum + p.metrics.totalReferrals, 0),
        }),
        [partners]
    );

    const handleApprove = async (partnerId: string) => {
        try {
            await approvePartner(partnerId);
        } catch (error) {
            console.error('Failed to approve partner:', error);
        }
    };

    const handleSuspend = async (partnerId: string) => {
        try {
            await suspendPartner(partnerId, 'Suspended by admin');
        } catch (error) {
            console.error('Failed to suspend partner:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Partner Management</h1>
                    <p className="text-gray-600">Manage resellers, commissions, and affiliate programs</p>
                </div>
            </div>

            {/* Stats */}
            <div className="bg-white border-b border-gray-200 px-6 py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Partners</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalPartners}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Active Partners</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.activePartners}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </div>

                        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Commissions</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        ${(stats.totalCommissions / 1000).toFixed(0)}K
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-purple-500" />
                            </div>
                        </div>

                        <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Referrals</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalReferrals}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-orange-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            placeholder="Search by company or email..."
                            onChange={(e) => searchPartners(e.target.value)}
                            className="border-gray-300"
                        />
                        <Select onValueChange={(value) => {
                            if (value === 'all' || value === 'active' || value === 'pending' || value === 'suspended') {
                                filterPartners(value as 'all' | 'active' | 'pending' | 'suspended');
                            }
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button className="bg-blue-600 text-white hover:bg-blue-700">
                            + Add Partner
                        </Button>
                    </div>
                </div>
            </div>

            {/* Partners Table */}
            <div className="bg-white px-6 py-6">
                <div className="max-w-7xl mx-auto overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-12 text-gray-600">Loading partners...</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Company</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tier</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Sales</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Commission</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rate</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPartners.map((partner) => (
                                    <PartnerRow
                                        key={partner.id}
                                        partner={partner}
                                        onApprove={handleApprove}
                                        onSuspend={handleSuspend}
                                        onSelect={selectPartner}
                                        isLoading={loading}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PartnerDashboard;

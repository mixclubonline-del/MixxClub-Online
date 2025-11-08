/**
 * CommissionTracker Component
 * Track and manage partner commissions with detailed history and analytics
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useCommissionTracking } from '@/hooks/useCommissionTracking';
import { usePartnerManagement } from '@/hooks/usePartnerManagement';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import type { Commission } from '@/stores/partnerStore';

const statusColors: Record<Commission['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    earned: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    reversed: 'bg-red-100 text-red-800',
};

const statusIcons: Record<Commission['status'], React.ReactNode> = {
    pending: <Clock className="h-4 w-4" />,
    earned: <TrendingUp className="h-4 w-4" />,
    paid: <CheckCircle className="h-4 w-4" />,
    reversed: <AlertCircle className="h-4 w-4" />,
};

interface CommissionRowProps {
    commission: Commission;
    onMarkPaid: () => Promise<void>;
    isLoading: boolean;
}

const CommissionRow: React.FC<CommissionRowProps> = ({ commission, onMarkPaid, isLoading }) => {
    const dueDate = new Date(commission.dueDate);
    const isOverdue = dueDate < new Date() && commission.status === 'pending';

    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-6 py-4">
                <p className="font-mono text-sm text-gray-900">{commission.id}</p>
            </td>
            <td className="px-6 py-4">
                <p className="text-sm text-gray-600">Sale: {commission.saleId}</p>
            </td>
            <td className="px-6 py-4">
                <p className="font-semibold text-gray-900">${commission.amount.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{commission.rate}% rate</p>
            </td>
            <td className="px-6 py-4">
                <Badge className={statusColors[commission.status]}>
                    <span className="flex items-center gap-1">
                        {statusIcons[commission.status]}
                        {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                    </span>
                </Badge>
            </td>
            <td className="px-6 py-4">
                <p className="text-sm text-gray-600">
                    Due: {dueDate.toLocaleDateString()}
                </p>
                {isOverdue && (
                    <p className="text-xs text-red-600 font-semibold">OVERDUE</p>
                )}
            </td>
            <td className="px-6 py-4">
                {commission.paidDate ? (
                    <p className="text-sm text-gray-600">
                        {new Date(commission.paidDate).toLocaleDateString()}
                    </p>
                ) : (
                    <p className="text-sm text-gray-500">Not paid</p>
                )}
            </td>
            <td className="px-6 py-4">
                <div className="flex gap-2">
                    {commission.status === 'earned' && (
                        <Button
                            size="sm"
                            onClick={onMarkPaid}
                            disabled={isLoading}
                            className="bg-green-600 text-white hover:bg-green-700"
                        >
                            Mark Paid
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={isLoading}
                        className="border-gray-300"
                    >
                        Details
                    </Button>
                </div>
            </td>
        </tr>
    );
};

export const CommissionTracker: React.FC = () => {
    const { partners } = usePartnerManagement();
    const { getPartnerCommissions, loading: commissionLoading } = useCommissionTracking();
    const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<Commission['status'] | 'all'>('all');
    const [commissions, setCommissions] = useState<Commission[]>([]);

    // Fetch commissions when partner changes
    useEffect(() => {
        if (selectedPartnerId) {
            getPartnerCommissions(selectedPartnerId).then(setCommissions).catch((err) => {
                console.error('Failed to fetch commissions:', err);
                setCommissions([]);
            });
        } else {
            setCommissions([]);
        }
    }, [selectedPartnerId, getPartnerCommissions]);

    const selectedPartner = partners.find((p) => p.id === selectedPartnerId);

    const filteredCommissions = useMemo(() => {
        if (statusFilter === 'all') {
            return commissions;
        }
        return commissions.filter((c) => c.status === statusFilter);
    }, [commissions, statusFilter]);

    const stats = useMemo(() => {
        return {
            totalCommissions: commissions.reduce((sum, c) => sum + c.amount, 0),
            pendingCommissions: commissions
                .filter((c) => c.status === 'pending')
                .reduce((sum, c) => sum + c.amount, 0),
            earnedCommissions: commissions
                .filter((c) => c.status === 'earned')
                .reduce((sum, c) => sum + c.amount, 0),
            paidCommissions: commissions
                .filter((c) => c.status === 'paid')
                .reduce((sum, c) => sum + c.amount, 0),
            avgCommission: commissions.length > 0 ? commissions.reduce((sum, c) => sum + c.amount, 0) / commissions.length : 0,
        };
    }, [commissions]);

    const chartData = useMemo(() => {
        const grouped: Record<string, Record<Commission['status'], number>> = {};
        commissions.forEach((c) => {
            const date = new Date(c.dueDate).toLocaleDateString();
            if (!grouped[date]) {
                grouped[date] = { pending: 0, earned: 0, paid: 0, reversed: 0 };
            }
            grouped[date][c.status]++;
        });
        return Object.entries(grouped).map(([date, statuses]) => ({
            date,
            ...statuses,
        }));
    }, [commissions]);

    const handleMarkPaid = async (commissionId: string) => {
        console.log('Mark commission paid:', commissionId);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Commission Tracker</h1>
                    <p className="text-gray-600">Track and manage partner commissions</p>
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
                                        <p className="text-xs text-gray-600 mb-1">Total Commissions</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ${stats.totalCommissions.toFixed(2)}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-gray-600 mb-1">Pending</p>
                                        <p className="text-2xl font-bold text-yellow-600">
                                            ${stats.pendingCommissions.toFixed(2)}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-gray-600 mb-1">Earned</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            ${stats.earnedCommissions.toFixed(2)}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-gray-600 mb-1">Paid</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            ${stats.paidCommissions.toFixed(2)}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-gray-600 mb-1">Average</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            ${stats.avgCommission.toFixed(2)}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white border-b border-gray-200 px-6 py-6">
                        <div className="max-w-7xl mx-auto">
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Commission Timeline</CardTitle>
                                    <CardDescription>Commission status distribution over time</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="pending" fill="#eab308" />
                                                <Bar dataKey="earned" fill="#3b82f6" />
                                                <Bar dataKey="paid" fill="#10b981" />
                                                <Bar dataKey="reversed" fill="#ef4444" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            No commission data available
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Commissions Table */}
                    <div className="bg-white px-6 py-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="mb-4 flex gap-4">
                                <Select value={statusFilter} onValueChange={(value) => {
                                    if (value === 'all' || value === 'pending' || value === 'earned' || value === 'paid' || value === 'reversed') {
                                        setStatusFilter(value as Commission['status'] | 'all');
                                    }
                                }}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="earned">Earned</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="reversed">Reversed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {commissionLoading ? (
                                <div className="text-center py-12 text-gray-600">Loading commissions...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sale</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Paid Date</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCommissions.map((commission) => (
                                                <CommissionRow
                                                    key={commission.id}
                                                    commission={commission}
                                                    onMarkPaid={() => handleMarkPaid(commission.id)}
                                                    isLoading={commissionLoading}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CommissionTracker;

/**
 * PayoutUI Component
 * Interface for partner payout requests, management, and tracking
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useCommissionTracking } from '@/hooks/useCommissionTracking';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock, TrendingUp, DollarSign } from 'lucide-react';
import type { Payout } from '@/stores/partnerStore';

const payoutStatusColors: Record<Payout['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
};

const payoutStatusIcons: Record<Payout['status'], React.ReactNode> = {
    pending: <Clock className="h-4 w-4" />,
    processing: <TrendingUp className="h-4 w-4" />,
    completed: <CheckCircle className="h-4 w-4" />,
    failed: <AlertCircle className="h-4 w-4" />,
};

interface PayoutRowProps {
    payout: Payout;
    onRetry: () => Promise<void>;
    onView: () => void;
    isLoading: boolean;
}

const PayoutRow: React.FC<PayoutRowProps> = ({ payout, onRetry, onView, isLoading }) => {
    const createdDate = new Date(payout.createdAt || new Date());
    const completedDate = payout.processedAt ? new Date(payout.processedAt) : null;
    const daysPending = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-6 py-4">
                <p className="font-mono text-sm text-gray-900">{payout.id}</p>
            </td>
            <td className="px-6 py-4">
                <p className="font-semibold text-gray-900">${payout.amount.toFixed(2)}</p>
            </td>
            <td className="px-6 py-4">
                <Badge className={payoutStatusColors[payout.status]}>
                    <span className="flex items-center gap-1">
                        {payoutStatusIcons[payout.status]}
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </span>
                </Badge>
            </td>
            <td className="px-6 py-4">
                <p className="text-sm text-gray-600">
                    {payout.method === 'bank_transfer' && 'Bank Transfer'}
                    {payout.method === 'paypal' && 'PayPal'}
                    {payout.method === 'check' && 'Check'}
                </p>
            </td>
            <td className="px-6 py-4">
                <p className="text-sm text-gray-600">
                    {createdDate.toLocaleDateString()}
                </p>
                {payout.status === 'pending' && (
                    <p className="text-xs text-gray-500">{daysPending} days ago</p>
                )}
            </td>
            <td className="px-6 py-4">
                {completedDate ? (
                    <p className="text-sm text-gray-600">
                        {completedDate.toLocaleDateString()}
                    </p>
                ) : (
                    <p className="text-sm text-gray-500">-</p>
                )}
            </td>
            <td className="px-6 py-4">
                <div className="flex gap-2">
                    {payout.status === 'failed' && (
                        <Button
                            size="sm"
                            onClick={onRetry}
                            disabled={isLoading}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Retry
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onView}
                        disabled={isLoading}
                        className="border-gray-300"
                    >
                        View
                    </Button>
                </div>
            </td>
        </tr>
    );
};

export const PayoutUI: React.FC = () => {
    const { partners } = usePartnerManagement();
    const {
        getPartnerPayouts,
        getEarnedCommissions,
        getPendingCommissions,
        createPayout,
        loading: payoutLoading,
    } = useCommissionTracking();

    const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
    const [payoutMethod, setPayoutMethod] = useState<Payout['method']>('bank_transfer');
    const [statusFilter, setStatusFilter] = useState<Payout['status'] | 'all'>('all');
    const [isCreatingPayout, setIsCreatingPayout] = useState(false);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [earnedAmount, setEarnedAmount] = useState(0);
    const [pendingAmount, setPendingAmount] = useState(0);

    // Fetch payouts when partner changes
    useEffect(() => {
        if (selectedPartnerId) {
            Promise.all([
                getPartnerPayouts(selectedPartnerId),
                Promise.resolve(getEarnedCommissions(selectedPartnerId)),
                Promise.resolve(getPendingCommissions(selectedPartnerId)),
            ]).then(([fetchedPayouts, earned, pending]) => {
                setPayouts(fetchedPayouts);
                setEarnedAmount(earned);
                setPendingAmount(pending);
            }).catch((err) => {
                console.error('Failed to fetch payout data:', err);
                setPayouts([]);
            });
        } else {
            setPayouts([]);
            setEarnedAmount(0);
            setPendingAmount(0);
        }
    }, [selectedPartnerId, getPartnerPayouts, getEarnedCommissions, getPendingCommissions]);

    const selectedPartner = partners.find((p) => p.id === selectedPartnerId);

    const filteredPayouts = useMemo(() => {
        if (statusFilter === 'all') {
            return payouts;
        }
        return payouts.filter((p) => p.status === statusFilter);
    }, [payouts, statusFilter]);

    const stats = useMemo(() => {
        return {
            totalPayouts: payouts.reduce((sum, p) => sum + p.amount, 0),
            completedPayouts: payouts
                .filter((p) => p.status === 'completed')
                .reduce((sum, p) => sum + p.amount, 0),
            pendingPayouts: payouts
                .filter((p) => p.status === 'pending')
                .reduce((sum, p) => sum + p.amount, 0),
            failedPayouts: payouts.filter((p) => p.status === 'failed').length,
        };
    }, [payouts]);

    const handleCreatePayout = async () => {
        if (!selectedPartnerId || earnedAmount === 0) {
            return;
        }

        setIsCreatingPayout(true);
        try {
            await createPayout(selectedPartnerId, earnedAmount, payoutMethod);
            // Refresh payouts
            const updated = await getPartnerPayouts(selectedPartnerId);
            setPayouts(updated);
        } catch (error) {
            console.error('Failed to create payout:', error);
        } finally {
            setIsCreatingPayout(false);
        }
    };

    const handleRetryPayout = async (payoutId: string) => {
        // Retry logic will be wired to backend
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payout Management</h1>
                    <p className="text-gray-600">Request and track partner payouts</p>
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
                    {/* Stats and Request Payout */}
                    <div className="bg-white border-b border-gray-200 px-6 py-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
                                <Card className="border-0 shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-gray-600 mb-1">Earned</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            ${earnedAmount.toFixed(2)}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-gray-600 mb-1">Pending</p>
                                        <p className="text-2xl font-bold text-yellow-600">
                                            ${pendingAmount.toFixed(2)}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-gray-600 mb-1">Total Paid</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            ${stats.completedPayouts.toFixed(2)}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-gray-600 mb-1">Processing</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            ${stats.pendingPayouts.toFixed(2)}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-gray-600 mb-1">Failed</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            {stats.failedPayouts}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Request Payout Form */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Request Payout</CardTitle>
                                    <CardDescription>Request a new payout for earned commissions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Amount
                                            </label>
                                            <Input
                                                type="number"
                                                value={earnedAmount.toFixed(2)}
                                                disabled
                                                className="bg-gray-50"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Based on earned commissions
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Payout Method
                                            </label>
                                            <Select value={payoutMethod} onValueChange={(value) => {
                                                if (value === 'bank_transfer' || value === 'paypal' || value === 'check') {
                                                    setPayoutMethod(value as Payout['method']);
                                                }
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                    <SelectItem value="paypal">PayPal</SelectItem>
                                                    <SelectItem value="check">Check</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex items-end">
                                            <Button
                                                onClick={handleCreatePayout}
                                                disabled={isCreatingPayout || earnedAmount === 0}
                                                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                {isCreatingPayout ? 'Creating...' : 'Request Payout'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Payouts Table */}
                    <div className="bg-white px-6 py-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="mb-4 flex gap-4">
                                <h2 className="text-lg font-semibold text-gray-900">Payout History</h2>
                                <Select value={statusFilter} onValueChange={(value) => {
                                    if (value === 'all' || value === 'pending' || value === 'processing' || value === 'completed' || value === 'failed') {
                                        setStatusFilter(value as Payout['status'] | 'all');
                                    }
                                }}>
                                    <SelectTrigger className="w-48 ml-auto">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {payoutLoading ? (
                                <div className="text-center py-12 text-gray-600">Loading payouts...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Method</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Completed</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPayouts.map((payout) => (
                                                <PayoutRow
                                                    key={payout.id}
                                                    payout={payout}
                                                    onRetry={() => handleRetryPayout(payout.id)}
                                                    onView={() => { /* View payout detail */ }}
                                                    isLoading={payoutLoading}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredPayouts.length === 0 && (
                                        <div className="text-center py-12 text-gray-500">
                                            No payouts found
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

export default PayoutUI;

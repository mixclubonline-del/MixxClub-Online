import React, { useState } from 'react';
import { Copy, Share2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PaymentLink } from '@/types/partnership';
import { usePaymentLink } from '@/hooks/usePaymentLink';
import { useAuth } from '@/hooks/useAuth';

interface PaymentLinkGeneratorProps {
    partnershipId?: string;
    projectId?: string;
    recipientId?: string;
    recipientName?: string;
    onLinkCreated?: (link: PaymentLink) => void;
    isLoading?: boolean;
}

/**
 * PaymentLinkGenerator Component
 * 
 * Generates and manages payment links for partnerships:
 * - Create shareable payment URLs
 * - Set custom amounts and descriptions
 * - Multiple payment method support
 * - Real-time link status tracking
 * - Easy sharing and copying
 */
export const PaymentLinkGenerator: React.FC<PaymentLinkGeneratorProps> = ({
    partnershipId,
    projectId,
    recipientId,
    recipientName = 'Partner',
    onLinkCreated,
    isLoading: externalLoading = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        paymentMethod: 'stripe' as 'stripe' | 'paypal' | 'bank_transfer',
        expirationDays: '7',
    });

    const { toast } = useToast();
    const { createShareableLink } = usePaymentLink();
    const { user } = useAuth();

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Generate payment link
    const handleCreateLink = async () => {
        if (!recipientId) {
            toast({
                title: 'Missing Information',
                description: 'Recipient ID is required to generate a payment link',
                variant: 'destructive',
            });
            return;
        }

        if (!formData.amount) {
            toast({
                title: 'Missing Amount',
                description: 'Please enter a payment amount',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            const amount = parseFloat(formData.amount);
            const expiresAt = new Date(Date.now() + parseInt(formData.expirationDays, 10) * 24 * 60 * 60 * 1000).toISOString();
            const description = formData.description || `Payment for ${recipientName}`;

            const response = await createShareableLink({
                amount,
                currency: 'USD',
                description,
                partnershipId,
                recipientId,
                metadata: {
                    project_id: projectId || '',
                    payment_method: formData.paymentMethod,
                    expiration_days: formData.expirationDays,
                },
            });

            const generatedId = String(response?.id || `link_${Date.now()}`);
            const generatedUrl = String(response?.url || '');
            const generatedToken = generatedUrl.split('/').pop() || generatedId;

            const newLink: PaymentLink = {
                id: generatedId,
                token: generatedToken,
                url: generatedUrl,
                creator_id: user?.id || 'unknown',
                recipient_id: recipientId,
                partnership_id: partnershipId,
                project_id: projectId,
                amount,
                currency: 'USD',
                description,
                payment_method: formData.paymentMethod,
                status: 'pending',
                expires_at: expiresAt,
                paid_at: undefined,
                created_at: new Date().toISOString(),
            };

            setPaymentLinks((prev) => [newLink, ...prev]);
            onLinkCreated?.(newLink);

            toast({
                title: 'Payment Link Created',
                description: 'Link has been generated and is ready to share',
            });

            // Reset form
            setFormData({
                amount: '',
                description: '',
                paymentMethod: 'stripe',
                expirationDays: '7',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create payment link',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Copy link to clipboard
    const copyToClipboard = (url: string, linkId: string) => {
        navigator.clipboard.writeText(url);
        setCopiedId(linkId);
        setTimeout(() => setCopiedId(null), 2000);

        toast({
            title: 'Copied!',
            description: 'Payment link copied to clipboard',
        });
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'default';
            case 'paid':
                return 'secondary';
            case 'expired':
                return 'destructive';
            case 'cancelled':
                return 'outline';
            default:
                return 'outline';
        }
    };

    // Check if link is expired
    const isLinkExpired = (expiresAt: string) => {
        return new Date(expiresAt) < new Date();
    };

    return (
        <div className="space-y-4">
            {/* Header Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Payment Links</CardTitle>
                            <CardDescription>
                                Create and manage shareable payment links for {recipientName}
                            </CardDescription>
                        </div>
                        <Button
                            onClick={() => setIsOpen(!isOpen)}
                            size="sm"
                            className="gap-2"
                            disabled={externalLoading || isLoading}
                        >
                            <Share2 className="w-4 h-4" />
                            {isOpen ? 'Cancel' : 'Create Link'}
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Form Card - Create New Link */}
            {isOpen && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Generate New Payment Link</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (USD)</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-gray-600">$</span>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="text-lg"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (optional)</Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="e.g., Payment for Remix Mastering"
                                value={formData.description}
                                onChange={handleInputChange}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Payment Method</Label>
                            <select
                                id="paymentMethod"
                                name="paymentMethod"
                                title="Select a payment method"
                                value={formData.paymentMethod}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
                            >
                                <option value="stripe">Stripe (Credit/Debit Card)</option>
                                <option value="paypal">PayPal</option>
                                <option value="bank_transfer">Bank Transfer</option>
                            </select>
                        </div>

                        {/* Expiration */}
                        <div className="space-y-2">
                            <Label htmlFor="expirationDays">Link Expires In (days)</Label>
                            <select
                                id="expirationDays"
                                name="expirationDays"
                                title="Select expiration period"
                                value={formData.expirationDays}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
                            >
                                <option value="1">1 day</option>
                                <option value="3">3 days</option>
                                <option value="7">7 days</option>
                                <option value="14">14 days</option>
                                <option value="30">30 days</option>
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4">
                            <Button
                                onClick={handleCreateLink}
                                disabled={isLoading || externalLoading}
                                className="gap-2 flex-1"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-4 h-4" />
                                        Generate Link
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={() => setIsOpen(false)}
                                variant="outline"
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment Links List */}
            {paymentLinks.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">Recent Links</h3>
                    {paymentLinks.map((link) => {
                        const isExpired = isLinkExpired(link.expires_at || '');
                        const isPaid = link.status === 'completed';

                        return (
                            <Card key={link.id}>
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
                                        {/* Link Header */}
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    ${link.amount.toFixed(2)}
                                                </p>
                                                {link.description && (
                                                    <p className="text-xs text-gray-600">{link.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={getStatusColor(isExpired ? 'expired' : link.status)}
                                                    className="capitalize"
                                                >
                                                    {isExpired ? 'Expired' : link.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Link URL */}
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={link.url}
                                                readOnly
                                                className="text-xs"
                                            />
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => copyToClipboard(link.url, link.id)}
                                                disabled={isExpired}
                                            >
                                                {copiedId === link.id ? (
                                                    <Check className="w-4 h-4" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>

                                        {/* Metadata */}
                                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                                            <div>
                                                <span className="font-medium">Method:</span> {link.payment_method}
                                            </div>
                                            <div>
                                                <span className="font-medium">Created:</span>{' '}
                                                {new Date(link.created_at).toLocaleDateString()}
                                            </div>
                                            <div>
                                                <span className="font-medium">Expires:</span>{' '}
                                                {new Date(link.expires_at || '').toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* Expiration Warning */}
                                        {isExpired && (
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200">
                                                <AlertCircle className="w-4 h-4 text-red-600" />
                                                <span className="text-xs font-medium text-red-700">
                                                    This link has expired and can no longer be used
                                                </span>
                                            </div>
                                        )}

                                        {/* Paid Status */}
                                        {isPaid && (
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200">
                                                <Check className="w-4 h-4 text-green-600" />
                                                <span className="text-xs font-medium text-green-700">
                                                    Payment received on {new Date(link.paid_at || '').toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {!isOpen && paymentLinks.length === 0 && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Share2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-4">
                            No payment links created yet. Generate one to share with your partner.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PaymentLinkGenerator;

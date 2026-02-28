import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ExternalLink, Copy, Check } from 'lucide-react';

interface PaymentLinkGeneratorProps {
  accountId?: string;
}

export function PaymentLinkGenerator({ accountId }: PaymentLinkGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    accountId: accountId || '',
    packageType: 'starter',
    customAmount: '',
    description: '',
    customerEmail: '',
    customerName: '',
  });

  const packagePrices: Record<string, number> = {
    starter: 499,
    professional: 999,
    enterprise: 2499,
    custom: 0,
  };

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedUrl(null);

    try {
      const amount = formData.packageType === 'custom' 
        ? parseFloat(formData.customAmount) 
        : packagePrices[formData.packageType];

      if (!amount || amount <= 0) {
        throw new Error('Invalid amount');
      }

      const { data, error } = await supabase.functions.invoke('create-enterprise-payment-link', {
        body: {
          accountId: formData.accountId,
          packageType: formData.packageType,
          amount,
          description: formData.description || `Mixxclub ${formData.packageType} package`,
          customerEmail: formData.customerEmail,
          customerName: formData.customerName,
        },
      });

      if (error) throw error;

      if (data?.url) {
        setGeneratedUrl(data.url);
        toast({
          title: 'Payment Link Generated',
          description: 'Payment link has been created successfully.',
        });
      }
    } catch (error) {
      console.error('Error generating payment link:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate payment link',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (generatedUrl) {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      toast({
        title: 'Copied',
        description: 'Payment link copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenLink = () => {
    if (generatedUrl) {
      window.open(generatedUrl, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Payment Link</CardTitle>
        <CardDescription>
          Create a Stripe payment link for enterprise packages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerateLink} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountId">Enterprise Account ID</Label>
            <Input
              id="accountId"
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              placeholder="Enter account ID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="packageType">Package Type</Label>
            <Select
              value={formData.packageType}
              onValueChange={(value) =>
                setFormData({ ...formData, packageType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">Starter - $499/month</SelectItem>
                <SelectItem value="professional">Professional - $999/month</SelectItem>
                <SelectItem value="enterprise">Enterprise - $2,499/month</SelectItem>
                <SelectItem value="custom">Custom Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.packageType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customAmount">Custom Amount ($)</Label>
              <Input
                id="customAmount"
                type="number"
                step="0.01"
                min="1"
                value={formData.customAmount}
                onChange={(e) => setFormData({ ...formData, customAmount: e.target.value })}
                placeholder="Enter custom amount"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Payment description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name (Optional)</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email (Optional)</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Payment Link'
            )}
          </Button>
        </form>

        {generatedUrl && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <Label className="text-sm font-medium mb-2 block">Generated Payment Link</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={generatedUrl}
                  readOnly
                  className="flex-1 bg-background"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleOpenLink}
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this link with your customer to complete the payment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

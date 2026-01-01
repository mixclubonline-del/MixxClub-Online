import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface PayoutRequestFormProps {
  availableBalance: number;
  onSuccess?: () => void;
}

export const PayoutRequestForm = ({ availableBalance, onSuccess }: PayoutRequestFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [notes, setNotes] = useState('');

  const minPayout = 50;
  const maxPayout = availableBalance;
  const parsedAmount = parseFloat(amount) || 0;

  const isValidAmount = parsedAmount >= minPayout && parsedAmount <= maxPayout;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !isValidAmount) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('request-payout', {
        body: {
          amount: parsedAmount,
          paymentMethod,
          notes,
        },
      });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: 'Payout Requested',
        description: `Your payout request for $${parsedAmount.toFixed(2)} has been submitted.`,
      });
      
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      console.error('Payout request error:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to request payout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="bg-green-500/10 border-green-500/30">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Payout Requested!</h3>
          <p className="text-muted-foreground">
            Your payout of ${parsedAmount.toFixed(2)} is being processed. 
            You'll receive it within 3-5 business days.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (availableBalance < minPayout) {
    return (
      <Alert className="bg-yellow-500/10 border-yellow-500/30">
        <AlertCircle className="h-4 w-4 text-yellow-400" />
        <AlertDescription className="text-yellow-400">
          Minimum payout amount is ${minPayout}. 
          You need ${(minPayout - availableBalance).toFixed(2)} more to request a payout.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Input */}
      <div className="space-y-2">
        <Label htmlFor="amount">Payout Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-8 text-lg"
            min={minPayout}
            max={maxPayout}
            step="0.01"
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Available: ${availableBalance.toFixed(2)}
          </span>
          <Button 
            type="button" 
            variant="link" 
            className="h-auto p-0 text-primary"
            onClick={() => setAmount(availableBalance.toString())}
          >
            Withdraw All
          </Button>
        </div>
        {amount && !isValidAmount && (
          <p className="text-sm text-destructive">
            {parsedAmount < minPayout 
              ? `Minimum payout is $${minPayout}` 
              : `Maximum payout is $${maxPayout.toFixed(2)}`}
          </p>
        )}
      </div>

      {/* Payment Method */}
      <div className="space-y-3">
        <Label>Payment Method</Label>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          <div className="flex items-center space-x-3 p-4 rounded-lg border border-border bg-muted/30 cursor-pointer hover:border-primary/50">
            <RadioGroupItem value="stripe" id="stripe" />
            <Label htmlFor="stripe" className="flex items-center gap-3 cursor-pointer flex-1">
              <CreditCard className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Stripe Connect</p>
                <p className="text-sm text-muted-foreground">Direct bank transfer (2-3 days)</p>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 rounded-lg border border-border bg-muted/30 cursor-pointer hover:border-primary/50 opacity-50">
            <RadioGroupItem value="paypal" id="paypal" disabled />
            <Label htmlFor="paypal" className="flex items-center gap-3 cursor-pointer flex-1">
              <Wallet className="w-5 h-5 text-blue-400" />
              <div>
                <p className="font-medium">PayPal</p>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes for this payout request..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Summary */}
      {isValidAmount && (
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Payout Amount</span>
              <span className="font-medium text-foreground">${parsedAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Processing Fee</span>
              <span className="font-medium text-foreground">$0.00</span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">You'll Receive</span>
                <span className="text-xl font-bold text-green-400">${parsedAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={loading || !isValidAmount}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Request Payout
          </>
        )}
      </Button>
    </form>
  );
};

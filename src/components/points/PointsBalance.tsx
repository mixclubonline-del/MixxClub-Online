import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePoints } from '@/hooks/usePoints';
import { Coins, TrendingUp, Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const PointsBalance = () => {
  const { balance, isLoading, cashout } = usePoints();
  const [cashoutAmount, setCashoutAmount] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCashout = () => {
    const amount = parseInt(cashoutAmount);
    if (amount > 0 && amount <= (balance || 0)) {
      cashout.mutate(amount);
      setDialogOpen(false);
      setCashoutAmount('');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Points Balance
        </CardTitle>
        <CardDescription>
          Earn points for activity and cash them out
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-6">
          <p className="text-5xl font-bold text-primary mb-2">
            {balance?.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Available Points (1 point = $0.01)
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2" size="lg">
              <TrendingUp className="h-4 w-4" />
              Cash Out Points
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cash Out Points</DialogTitle>
              <DialogDescription>
                Convert your points to cash. Available balance: {balance} points (${((balance || 0) / 100).toFixed(2)})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Points to Cash Out</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={cashoutAmount}
                  onChange={(e) => setCashoutAmount(e.target.value)}
                  max={balance}
                />
                <p className="text-sm text-muted-foreground">
                  You'll receive: ${((parseInt(cashoutAmount) || 0) / 100).toFixed(2)}
                </p>
              </div>
              <Button 
                onClick={handleCashout} 
                disabled={!cashoutAmount || parseInt(cashoutAmount) > (balance || 0)}
                className="w-full"
              >
                Confirm Cash Out
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

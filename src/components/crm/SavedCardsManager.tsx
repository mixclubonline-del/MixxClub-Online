import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Trash2, Star, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

const CARD_ICONS: Record<string, string> = {
  visa: '💳',
  mastercard: '💳',
  amex: '💳',
  discover: '💳',
  default: '💳',
};

export const SavedCardsManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);

  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ['payment-methods', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Fetch from edge function that calls Stripe
      const { data, error } = await supabase.functions.invoke('get-payment-methods', {
        body: { user_id: user.id },
      });
      
      if (error) {
        console.error('Error fetching payment methods:', error);
        return [];
      }
      
      return (data?.payment_methods || []) as PaymentMethod[];
    },
    enabled: !!user?.id,
  });

  const addCardMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.functions.invoke('create-setup-session', {
        body: { 
          user_id: user.id,
          return_url: window.location.href,
        },
      });
      
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: () => toast.error('Failed to initiate card setup'),
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase.functions.invoke('set-default-payment-method', {
        body: { user_id: user.id, payment_method_id: paymentMethodId },
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Default payment method updated');
    },
    onError: () => toast.error('Failed to update default payment method'),
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase.functions.invoke('delete-payment-method', {
        body: { user_id: user.id, payment_method_id: paymentMethodId },
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      setDeleteCardId(null);
      toast.success('Card removed');
    },
    onError: () => toast.error('Failed to remove card'),
  });

  const formatExpiry = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Saved Payment Methods
          </CardTitle>
          <Button onClick={() => addCardMutation.mutate()} disabled={addCardMutation.isPending}>
            {addCardMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add Card
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No saved payment methods</p>
              <Button variant="outline" onClick={() => addCardMutation.mutate()}>
                Add your first card
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">
                      {CARD_ICONS[method.brand.toLowerCase()] || CARD_ICONS.default}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{method.brand}</span>
                        <span className="text-muted-foreground">•••• {method.last4}</span>
                        {method.is_default && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="h-3 w-3" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Expires {formatExpiry(method.exp_month, method.exp_year)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDefaultMutation.mutate(method.id)}
                        disabled={setDefaultMutation.isPending}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteCardId(method.id)}
                      disabled={method.is_default}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteCardId} onOpenChange={() => setDeleteCardId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCardId && deleteCardMutation.mutate(deleteCardId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

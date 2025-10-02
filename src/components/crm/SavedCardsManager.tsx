import { useState, useEffect } from 'react';
import { CreditCard, Trash2, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
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

export const SavedCardsManager = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteCard, setDeleteCard] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedCards();
  }, []);

  const fetchSavedCards = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('saved_payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved cards:', error);
      return;
    }

    setCards(data || []);
    setLoading(false);
  };

  const setDefaultCard = async (cardId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Unset all as default
    await supabase
      .from('saved_payment_methods')
      .update({ is_default: false })
      .eq('user_id', user.id);

    // Set selected as default
    const { error } = await supabase
      .from('saved_payment_methods')
      .update({ is_default: true })
      .eq('id', cardId);

    if (error) {
      toast.error('Failed to set default card');
      return;
    }

    toast.success('Default card updated');
    fetchSavedCards();
  };

  const removeCard = async (cardId: string) => {
    const { error } = await supabase
      .from('saved_payment_methods')
      .delete()
      .eq('id', cardId);

    if (error) {
      toast.error('Failed to remove card');
      return;
    }

    toast.success('Card removed');
    setDeleteCard(null);
    fetchSavedCards();
  };

  const getCardIcon = (brand: string) => {
    const icons: Record<string, string> = {
      'visa': '💳',
      'mastercard': '💳',
      'amex': '💳',
      'discover': '💳',
    };
    return icons[brand?.toLowerCase()] || '💳';
  };

  if (loading) {
    return <div className="text-center py-8">Loading saved cards...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Saved Payment Methods</h3>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Card
        </Button>
      </div>

      {cards.length === 0 ? (
        <Card className="p-8 text-center">
          <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Saved Cards</h3>
          <p className="text-muted-foreground mb-4">
            Add a payment method for faster checkout
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <Card key={card.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{getCardIcon(card.card_brand)}</div>
                  <div>
                    <div className="font-semibold capitalize">
                      {card.card_brand} •••• {card.card_last4}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expires {card.card_exp_month}/{card.card_exp_year}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteCard(card.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              {card.is_default ? (
                <Badge variant="secondary">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Default
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDefaultCard(card.id)}
                >
                  Set as Default
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteCard} onOpenChange={() => setDeleteCard(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteCard && removeCard(deleteCard)}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

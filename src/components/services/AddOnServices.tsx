import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Zap, Clock, Layers, HeadphonesIcon, Check, ShoppingCart } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddOnServicesProps {
  projectId?: string;
  onPurchaseComplete?: () => void;
}

interface AddOnService {
  id: string;
  service_name: string;
  service_description: string | null;
  price: number;
  currency: string | null;
  is_active: boolean | null;
  sort_order: number | null;
}

const FALLBACK_SERVICES: AddOnService[] = [
  {
    id: 'rush',
    service_name: 'Rush Delivery',
    service_description: 'Get your mix back in 24-48 hours instead of the standard timeline',
    price: 4999,
    currency: 'usd',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'extra-revisions',
    service_name: 'Extra Revisions (3)',
    service_description: 'Add 3 additional revision rounds to your project',
    price: 2499,
    currency: 'usd',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'stem-separation',
    service_name: 'AI Stem Separation',
    service_description: 'Isolate vocals, drums, bass, and other instruments from your track',
    price: 1499,
    currency: 'usd',
    is_active: true,
    sort_order: 3,
  },
  {
    id: 'reference-mix',
    service_name: 'Reference Mix Analysis',
    service_description: 'Engineer analyzes your reference tracks and matches the sonic profile',
    price: 1999,
    currency: 'usd',
    is_active: true,
    sort_order: 4,
  },
  {
    id: 'dolby-atmos',
    service_name: 'Dolby Atmos Mix',
    service_description: 'Spatial audio mix for Apple Music and supported platforms',
    price: 9999,
    currency: 'usd',
    is_active: true,
    sort_order: 5,
  },
  {
    id: 'vinyl-master',
    service_name: 'Vinyl Master',
    service_description: 'Specialized mastering for vinyl pressing with proper EQ and loudness',
    price: 3999,
    currency: 'usd',
    is_active: true,
    sort_order: 6,
  },
];

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  rush: <Zap className="w-5 h-5 text-amber-500" />,
  'extra-revisions': <Clock className="w-5 h-5 text-blue-500" />,
  'stem-separation': <Layers className="w-5 h-5 text-green-500" />,
  'reference-mix': <HeadphonesIcon className="w-5 h-5 text-purple-500" />,
  'dolby-atmos': <HeadphonesIcon className="w-5 h-5 text-cyan-500" />,
  'vinyl-master': <HeadphonesIcon className="w-5 h-5 text-orange-500" />,
};

export function AddOnServices({ projectId, onPurchaseComplete }: AddOnServicesProps) {
  const { toast } = useToast();
  const [services, setServices] = useState<AddOnService[]>(FALLBACK_SERVICES);
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('addon_services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setServices(data);
      }
    } catch (error) {
      // Silently fall back to defaults
      console.error('Using fallback services:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (id: string) => {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedTotal = services
    .filter((s) => selectedServices.has(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  const handlePurchase = async () => {
    if (selectedServices.size === 0) {
      toast({
        title: 'No services selected',
        description: 'Please select at least one add-on service',
        variant: 'destructive',
      });
      return;
    }

    setPurchasing(true);
    try {
      // In production, this would create a Stripe checkout session
      toast({
        title: 'Add-ons requested!',
        description: `${selectedServices.size} service${selectedServices.size > 1 ? 's' : ''} added to your project`,
      });

      onPurchaseComplete?.();
      setSelectedServices(new Set());
    } catch (error: any) {
      console.error('Error purchasing add-ons:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process add-ons',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[400px] pr-4">
        <div className="grid gap-3">
          {services.map((service) => {
            const isSelected = selectedServices.has(service.id);
            return (
              <Card
                key={service.id}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => toggleService(service.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {SERVICE_ICONS[service.id] || <Zap className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{service.service_name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">
                          {formatPrice(service.price)}
                        </span>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                    {service.service_description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.service_description}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-between border-t pt-4">
        <div>
          <span className="text-sm text-muted-foreground">
            {selectedServices.size} selected
          </span>
          {selectedTotal > 0 && (
            <span className="text-lg font-bold ml-4">
              Total: {formatPrice(selectedTotal)}
            </span>
          )}
        </div>
        <Button
          onClick={handlePurchase}
          disabled={purchasing || selectedServices.size === 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {purchasing ? 'Processing...' : 'Add to Project'}
        </Button>
      </div>
    </div>
  );
}

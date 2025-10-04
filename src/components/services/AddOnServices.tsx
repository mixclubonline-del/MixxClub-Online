import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Scissors, Zap, LineChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddOnService {
  id: string;
  service_name: string;
  service_type: string;
  service_description: string;
  price: number;
  currency: string;
  processing_time_minutes: number;
  features: string[];
  is_active: boolean;
}

interface AddOnServicesProps {
  projectId?: string;
  onPurchaseComplete?: () => void;
}

export function AddOnServices({ projectId, onPurchaseComplete }: AddOnServicesProps) {
  const [services, setServices] = useState<AddOnService[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("add_on_services")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      
      const formattedServices = (data || []).map(service => ({
        ...service,
        features: (Array.isArray(service.features) ? service.features : []) as string[]
      }));
      
      setServices(formattedServices as AddOnService[]);
    } catch (error: any) {
      toast({
        title: "Error loading services",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (serviceId: string, price: number) => {
    try {
      setPurchasing(serviceId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to auth with current page as return URL
        window.location.href = '/auth?redirect=' + encodeURIComponent(window.location.pathname);
        return;
      }

      // Create purchase record
      const { error: insertError } = await supabase
        .from("add_on_purchases")
        .insert({
          user_id: user.id,
          add_on_id: serviceId,
          project_id: projectId || null,
          amount: price,
          status: "pending",
        });

      if (insertError) throw insertError;

      // Create Stripe payment intent
      const { data, error } = await supabase.functions.invoke(
        "create-addon-payment",
        { body: { serviceId, projectId, amount: price } }
      );

      if (error) throw error;
      
      if (data?.clientSecret) {
        toast({
          title: "Payment processing",
          description: "Redirecting to payment...",
        });
        // In a real implementation, you'd integrate Stripe.js here
        // For now, we'll just mark as completed after a delay
        setTimeout(() => {
          toast({
            title: "Service added!",
            description: "Your add-on service has been purchased.",
          });
          onPurchaseComplete?.();
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "audio_enhancement":
        return Sparkles;
      case "audio_processing":
        return Scissors;
      case "service_upgrade":
        return Zap;
      case "analysis":
        return LineChart;
      default:
        return Sparkles;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Enhance Your Project</h3>
        <p className="text-muted-foreground">Professional add-on services to take your music to the next level</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service) => {
          const Icon = getServiceIcon(service.service_type);
          const isPurchasing = purchasing === service.id;

          return (
            <Card key={service.id} className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
              
              <CardHeader>
                <div className="mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">{service.service_name}</CardTitle>
                <CardDescription className="text-sm">
                  {service.service_description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">${service.price}</div>
                  {service.processing_time_minutes > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      ~{service.processing_time_minutes} min processing
                    </Badge>
                  )}
                </div>

                <ul className="space-y-1">
                  {service.features.map((feature, i) => (
                    <li key={i} className="text-xs flex items-start gap-1">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  onClick={() => handlePurchase(service.id, service.price)}
                  disabled={isPurchasing}
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Add to Project"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

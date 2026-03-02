import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Loader2, 
  DollarSign, 
  Clock, 
  Music,
  Headphones,
  Mic2,
  Sliders,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStartConversation } from "@/hooks/useStartConversation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface HireModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    id: string;
    full_name?: string | null;
    username?: string | null;
    role?: string | null;
  };
  specialties?: string[];
}

const SERVICE_TYPES = [
  { id: "mixing", label: "Mixing", icon: Sliders, description: "Full mix from stems" },
  { id: "mastering", label: "Mastering", icon: Sparkles, description: "Final polish for release" },
  { id: "vocal_production", label: "Vocal Production", icon: Mic2, description: "Tuning, comp, effects" },
  { id: "full_production", label: "Full Production", icon: Music, description: "Beat + mix + master" },
];

const BUDGET_RANGES = [
  { value: "under_100", label: "Under $100" },
  { value: "100_500", label: "$100 - $500" },
  { value: "500_1000", label: "$500 - $1,000" },
  { value: "1000_plus", label: "$1,000+" },
  { value: "discuss", label: "Let's discuss" },
];

const TIMELINE_OPTIONS = [
  { value: "asap", label: "ASAP" },
  { value: "1_week", label: "Within 1 week" },
  { value: "2_weeks", label: "1-2 weeks" },
  { value: "flexible", label: "Flexible" },
];

export function HireModal({ open, onOpenChange, profile, specialties = [] }: HireModalProps) {
  const { user } = useAuth();
  const { startConversation, sendInitialMessage } = useStartConversation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [projectDescription, setProjectDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to send a request");
      return;
    }

    if (!selectedService || !projectDescription.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Compose initial message
      const serviceName = SERVICE_TYPES.find(s => s.id === selectedService)?.label || selectedService;
      const budgetLabel = BUDGET_RANGES.find(b => b.value === budget)?.label || budget;
      const timelineLabel = TIMELINE_OPTIONS.find(t => t.value === timeline)?.label || timeline;
      
      const message = `🎵 **New Project Request**

**Service:** ${serviceName}
**Budget:** ${budgetLabel}
**Timeline:** ${timelineLabel}

**Project Details:**
${projectDescription}

---
Sent via Mixxclub Hire`;

      // Send initial message (skip message notification since we send hire_request notification)
      const success = await sendInitialMessage(profile.id, message, true);
      
      if (success) {
        // Create hire request notification for recipient
        const senderName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Someone';
        await supabase.from('notifications').insert({
          user_id: profile.id,
          type: 'hire_request',
          title: 'New Hire Request',
          message: `${senderName} wants to work with you on ${serviceName}`,
          action_url: '/artist-crm?tab=messages',
          metadata: { sender_id: user.id, service: selectedService, budget, timeline }
        });
        
        toast.success("Request sent! Check your messages.");
        onOpenChange(false);
        
        // Navigate to messages
        const userRole = user?.user_metadata?.role === 'engineer' ? 'engineer' : 'artist';
        await startConversation(profile.id, userRole);
      }
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error("Failed to send request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedService("");
    setProjectDescription("");
    setBudget("");
    setTimeline("");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-primary" />
            Work with {profile.full_name || profile.username || "this creator"}
          </DialogTitle>
          <DialogDescription>
            Describe your project and they'll get back to you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Service Type */}
          <div className="space-y-3">
            <Label className="text-base">What do you need? *</Label>
            <div className="grid grid-cols-2 gap-2">
              {SERVICE_TYPES.map((service) => {
                const Icon = service.icon;
                const isSelected = selectedService === service.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedService(service.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      isSelected 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-medium text-sm">{service.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">Project Details *</Label>
            <Textarea
              id="description"
              placeholder="Describe your project, sound references, and what you're looking for..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Budget Range */}
          <div className="space-y-3">
            <Label className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget Range
            </Label>
            <div className="flex flex-wrap gap-2">
              {BUDGET_RANGES.map((option) => (
                <Badge
                  key={option.value}
                  variant={budget === option.value ? "default" : "outline"}
                  className="cursor-pointer py-1.5 px-3"
                  onClick={() => setBudget(option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <Label className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </Label>
            <div className="flex flex-wrap gap-2">
              {TIMELINE_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant={timeline === option.value ? "default" : "outline"}
                  className="cursor-pointer py-1.5 px-3"
                  onClick={() => setTimeline(option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !selectedService || !projectDescription.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useStorefront } from '@/hooks/useStorefront';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Store, Upload, Check, ArrowRight, ArrowLeft, Palette, Link2 } from 'lucide-react';

interface StorefrontSetupProps {
  onComplete?: () => void;
}

export const StorefrontSetup = ({ onComplete }: StorefrontSetupProps) => {
  const { user } = useAuth();
  const { createStorefront } = useStorefront(user?.id);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    storefront_slug: '',
    display_name: '',
    bio: '',
    banner_url: '',
    logo_url: '',
    theme_color: '#9b87f5',
    social_links: {
      instagram: '',
      twitter: '',
      spotify: '',
      soundcloud: ''
    }
  });

  const handleSubmit = async () => {
    if (!formData.storefront_slug || !formData.display_name) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createStorefront({
        ...formData,
        social_links: formData.social_links
      });
      toast.success('Storefront created successfully!');
      onComplete?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create storefront');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: Store },
    { number: 2, title: 'Branding', icon: Palette },
    { number: 3, title: 'Social Links', icon: Link2 },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, idx) => (
          <div key={s.number} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
              ${step >= s.number 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground/30 text-muted-foreground'}
            `}>
              {step > s.number ? (
                <Check className="w-5 h-5" />
              ) : (
                <s.icon className="w-5 h-5" />
              )}
            </div>
            <span className={`ml-2 text-sm font-medium hidden sm:block ${
              step >= s.number ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {s.title}
            </span>
            {idx < steps.length - 1 && (
              <div className={`w-12 sm:w-24 h-0.5 mx-4 ${
                step > s.number ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Set Up Your Storefront'}
            {step === 2 && 'Customize Your Brand'}
            {step === 3 && 'Connect Your Socials'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="slug">Storefront URL *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">mixxclub.com/store/</span>
                  <Input
                    id="slug"
                    placeholder="your-name"
                    value={formData.storefront_slug}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      storefront_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  placeholder="Your Artist Name"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell your story..."
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="banner">Banner Image URL</Label>
                <Input
                  id="banner"
                  placeholder="https://..."
                  value={formData.banner_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, banner_url: e.target.value }))}
                />
                {formData.banner_url && (
                  <div className="w-full h-32 rounded-lg overflow-hidden bg-muted mt-2">
                    <img 
                      src={formData.banner_url} 
                      alt="Banner preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo Image URL</Label>
                <Input
                  id="logo"
                  placeholder="https://..."
                  value={formData.logo_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                />
                {formData.logo_url && (
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-muted mt-2 border-4 border-background">
                    <img 
                      src={formData.logo_url} 
                      alt="Logo preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme Color</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="theme"
                    type="color"
                    value={formData.theme_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, theme_color: e.target.value }))}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">{formData.theme_color}</span>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="@username"
                    value={formData.social_links.instagram}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      social_links: { ...prev.social_links, instagram: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <Input
                    id="twitter"
                    placeholder="@username"
                    value={formData.social_links.twitter}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      social_links: { ...prev.social_links, twitter: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spotify">Spotify</Label>
                  <Input
                    id="spotify"
                    placeholder="Artist link"
                    value={formData.social_links.spotify}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      social_links: { ...prev.social_links, spotify: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="soundcloud">SoundCloud</Label>
                  <Input
                    id="soundcloud"
                    placeholder="Profile link"
                    value={formData.social_links.soundcloud}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      social_links: { ...prev.social_links, soundcloud: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {step < 3 ? (
              <Button onClick={() => setStep(s => s + 1)}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Launch Storefront'}
                <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

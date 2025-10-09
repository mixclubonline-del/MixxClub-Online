import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Music, Sparkles, Users, Upload, Wand2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GetStartedWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GetStartedWizard({ open, onOpenChange }: GetStartedWizardProps) {
  const navigate = useNavigate();

  const options = [
    {
      icon: Upload,
      title: 'Upload Vocals',
      description: 'Get professional mixing and mastering for your tracks',
      color: 'text-primary',
      bgColor: 'bg-primary/10 hover:bg-primary/20',
      borderColor: 'border-primary/40 hover:border-primary',
      action: () => {
        onOpenChange(false);
        setTimeout(() => {
          document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    },
    {
      icon: Wand2,
      title: 'AI Music Collaboration',
      description: 'Start creating with AI-powered music tools',
      color: 'text-[hsl(220_90%_60%)]',
      bgColor: 'bg-[hsl(220_90%_60%)]/10 hover:bg-[hsl(220_90%_60%)]/20',
      borderColor: 'border-[hsl(220_90%_60%)]/40 hover:border-[hsl(220_90%_60%)]',
      action: () => {
        onOpenChange(false);
        navigate('/mixing');
      }
    },
    {
      icon: Search,
      title: 'Browse Engineers',
      description: 'Find and hire top mixing/mastering engineers',
      color: 'text-[hsl(180_100%_50%)]',
      bgColor: 'bg-[hsl(180_100%_50%)]/10 hover:bg-[hsl(180_100%_50%)]/20',
      borderColor: 'border-[hsl(180_100%_50%)]/40 hover:border-[hsl(180_100%_50%)]',
      action: () => {
        onOpenChange(false);
        navigate('/engineers');
      }
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary via-[hsl(220_90%_60%)] to-[hsl(180_100%_50%)] bg-clip-text text-transparent">
            What would you like to do?
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-6">
          {options.map((option, index) => {
            const Icon = option.icon;
            return (
              <button
                key={index}
                onClick={option.action}
                className={`group relative p-6 rounded-xl border-2 ${option.borderColor} ${option.bgColor} transition-all duration-300 hover:scale-[1.02] hover:shadow-glow text-left`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className={`absolute inset-0 blur-xl opacity-0 group-hover:opacity-50 ${option.bgColor} rounded-full transition-opacity duration-300`} />
                    <Icon className={`w-10 h-10 ${option.color} relative z-10`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-foreground">
                      {option.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center text-sm text-muted-foreground pt-4 border-t">
          Choose any option to get started with MixClub
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ExitIntentPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [hasShown, setHasShown] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        const lastShown = localStorage.getItem('exitIntentShown');
        const now = Date.now();
        
        // Only show once per session or once every 24 hours
        if (!lastShown || now - parseInt(lastShown) > 86400000) {
          setOpen(true);
          setHasShown(true);
          localStorage.setItem('exitIntentShown', now.toString());
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store email (in real app, would send to backend)
    localStorage.setItem('exitIntentEmail', email);
    
    toast({
      title: 'Discount Code Sent! 🎉',
      description: 'Check your email for your 20% off code.',
    });
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Gift className="w-12 h-12 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">Wait! Don't Leave Empty-Handed</DialogTitle>
          <p className="text-center text-muted-foreground">
            Get <span className="font-bold text-primary">20% off</span> your first project
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-center"
          />
          
          <Button type="submit" className="w-full" size="lg">
            Send Me the Discount Code
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            No spam. Just your discount code and occasional updates.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

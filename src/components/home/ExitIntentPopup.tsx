import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'exitIntentShownAt';
const DISMISS_DURATION_DAYS = 7; // Don't show again for 7 days
const MIN_TIME_ON_PAGE_MS = 15000; // Must be on page 15+ seconds

export const ExitIntentPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [canShow, setCanShow] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if we should show the popup at all
    const lastShown = localStorage.getItem(STORAGE_KEY);
    if (lastShown) {
      const daysSinceShown = (Date.now() - parseInt(lastShown, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceShown < DISMISS_DURATION_DAYS) return;
    }

    // Wait minimum time before enabling exit intent
    const timer = setTimeout(() => setCanShow(true), MIN_TIME_ON_PAGE_MS);

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && canShow && !open) {
        setOpen(true);
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [canShow, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('exitIntentEmail', email);
    toast({
      title: 'Discount Code Sent! 🎉',
      description: 'Check your email for your 20% off code.',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm p-4">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Gift className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-lg text-center">Get 20% Off Your First Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-center h-9"
          />
          <Button type="submit" className="w-full h-9" size="sm">
            Send Me the Code
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            No spam, just your discount.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

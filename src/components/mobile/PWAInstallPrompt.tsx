import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export const PWAInstallPrompt = () => {
  const { canInstall, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setDismissed(true);
    }
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 p-4 shadow-lg border-primary z-50 animate-fade-in">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 hover:bg-muted rounded-full transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-full">
          <Download className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold mb-1">Install Mixxclub</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Get the full app experience with offline access and faster loading
          </p>
          <div className="flex gap-2">
            <Button onClick={handleInstall} size="sm" className="flex-1">
              Install App
            </Button>
            <Button 
              onClick={() => setDismissed(true)} 
              variant="outline" 
              size="sm"
            >
              Not Now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

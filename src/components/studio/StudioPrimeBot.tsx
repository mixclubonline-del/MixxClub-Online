import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const StudioPrimeBot = () => {
  return (
    <div className="absolute right-8 top-44 w-80 h-[calc(100vh-300px)] bg-background/40 backdrop-blur-md rounded-lg border border-border/50 p-6 flex flex-col">
      <div className="flex flex-col items-center flex-1 justify-center">
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border-4 border-primary/40">
            <Sparkles className="h-16 w-16 text-primary" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-background" />
        </div>

        <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent mb-2">
          PrimeBot 4.0
        </h3>
        
        <p className="text-sm text-muted-foreground text-center mb-6">
          How can I assist you today?
        </p>

        <div className="w-full space-y-2">
          <Button variant="outline" className="w-full justify-start" size="sm">
            Suggest mix improvements
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            Analyze frequency balance
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            Auto-master track
          </Button>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const DemoModeToggle = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const demoMode = localStorage.getItem('demo_mode') === 'true';
    setIsDemoMode(demoMode);
  }, []);

  const toggleDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    localStorage.setItem('demo_mode', enabled.toString());
    
    toast({
      title: enabled ? "Demo Mode Enabled" : "Demo Mode Disabled",
      description: enabled 
        ? "Sample data is now visible. Perfect for presentations and demos."
        : "Demo mode is now off. Real data will be displayed.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isDemoMode ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          Demo Mode
        </CardTitle>
        <CardDescription>
          Enable demo mode to show sample data for presentations and investor showcases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="demo-mode" className="text-base">
            {isDemoMode ? 'Demo Mode Active' : 'Demo Mode Inactive'}
          </Label>
          <Switch
            id="demo-mode"
            checked={isDemoMode}
            onCheckedChange={toggleDemoMode}
          />
        </div>

        {isDemoMode && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Demo mode is active. You're viewing sample data optimized for showcasing the platform's capabilities.
            </AlertDescription>
          </Alert>
        )}

        <div className="pt-4 border-t space-y-2">
          <h4 className="font-semibold text-sm">What's included in demo mode:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Sample user profiles and projects</li>
            <li>• Mock analytics and metrics</li>
            <li>• Pre-populated audio files</li>
            <li>• Simulated real-time activity</li>
            <li>• Example notifications and alerts</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

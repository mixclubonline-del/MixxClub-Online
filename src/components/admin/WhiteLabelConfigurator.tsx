import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Paintbrush } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const WhiteLabelConfigurator = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    companyName: "Acme Studios",
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    logoUrl: "",
    customDomain: "studio.acme.com",
  });

  const handleSave = () => {
    toast({
      title: "Configuration saved",
      description: "White label settings have been updated",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush className="h-5 w-5" />
          White Label Configurator
        </CardTitle>
        <CardDescription>Customize branding and appearance for each tenant</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              value={config.companyName}
              onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.secondaryColor}
                  onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={config.secondaryColor}
                  onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input
              placeholder="https://example.com/logo.png"
              value={config.logoUrl}
              onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Custom Domain</Label>
            <Input
              placeholder="yourdomain.com"
              value={config.customDomain}
              onChange={(e) => setConfig({ ...config, customDomain: e.target.value })}
            />
          </div>
        </div>

        <Card className="p-4 bg-muted">
          <h4 className="font-medium mb-3">Preview</h4>
          <div className="space-y-2 p-4 bg-background rounded-lg border">
            <div
              className="h-12 rounded flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: config.primaryColor }}
            >
              {config.companyName}
            </div>
            <div
              className="h-8 rounded"
              style={{ backgroundColor: config.secondaryColor }}
            />
          </div>
        </Card>

        <Button onClick={handleSave} className="w-full">
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
};

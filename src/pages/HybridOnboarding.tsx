import { useEffect } from "react";
import { useFlowNavigation } from "@/core/fabric/useFlow";

export default function HybridOnboarding() {
  const { openArtistCRM } = useFlowNavigation();

  useEffect(() => {
    openArtistCRM();
  }, [openArtistCRM]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Feature Being Rebuilt</h1>
        <p className="text-muted-foreground">Redirecting to Artist CRM...</p>
      </div>
    </div>
  );
}

import { Card } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ArtistOnboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="p-12 text-center max-w-2xl">
        <Construction className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Artist Onboarding</h2>
        <p className="text-muted-foreground mb-6">
          This feature is being rebuilt as part of the CRM reimagination.
        </p>
        <Button variant="outline" onClick={() => navigate('/artist-crm')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go to Dashboard
        </Button>
      </Card>
    </div>
  );
}

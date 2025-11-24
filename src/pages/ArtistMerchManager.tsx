import { Card } from "@/components/ui/card";
import { Construction } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function ArtistMerchManager() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container px-6 pt-24 pb-12">
        <Card className="p-12 text-center">
          <Construction className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Merch Manager</h2>
          <p className="text-muted-foreground">
            This feature is being rebuilt as part of the CRM reimagination.
          </p>
        </Card>
      </div>
    </div>
  );
}

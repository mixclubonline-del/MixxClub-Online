import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
export const StickyUploadButton = () => {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;
  return <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
      <div className="relative">
        {/* Pulse animation ring */}
        <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />
        
        {/* Main button */}
        <Button size="lg" asChild className="relative bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-2xl hover:shadow-primary/50 transition-all duration-300 pl-6 pr-6 py-6 text-base font-semibold">
          <Link to="/artist-studio">
            <Upload className="w-5 h-5 mr-2" />
            Upload Your Track
          </Link>
        </Button>

        {/* Close button */}
        <button onClick={() => setIsVisible(false)} className="absolute -top-2 -right-2 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors" aria-label="Close">
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>;
};
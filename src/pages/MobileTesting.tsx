import { AdminLayout } from "@/components/admin/AdminLayout";
import { MobileFeatureTester } from "@/components/mobile/MobileFeatureTester";
import { VoiceRecorderTest } from "@/components/mobile/VoiceRecorderTest";
import { MobileBuildGuide } from "@/components/admin/MobileBuildGuide";
import { Smartphone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function MobileTesting() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/admin')}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Smartphone className="h-8 w-8" />
              Mobile Testing Suite
            </h1>
            <p className="text-muted-foreground mt-2">
              Test native mobile features before deployment
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <MobileFeatureTester />
          <VoiceRecorderTest />
        </div>

        <MobileBuildGuide />

        <div className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border">
          <h3 className="font-bold text-lg mb-2">Next Steps After Testing</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              <span>Export project to GitHub and clone locally</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              <span>Follow build instructions for your target platform(s)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              <span>Test on physical devices (iOS and Android)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">4.</span>
              <span>Generate signing keys and certificates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">5.</span>
              <span>Prepare store assets (screenshots, descriptions)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">6.</span>
              <span>Submit to Google Play Store and/or Apple App Store</span>
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}

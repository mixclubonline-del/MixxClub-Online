import { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

export default function PresentationShare() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    if (!password) {
      toast.error("Please enter the password");
      return;
    }

    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-presentation-share", {
        body: {
          share_token: token,
          password,
        },
      });

      if (error) throw error;

      if (data.success) {
        setVerified(true);
        toast.success("Access granted!");
      } else {
        toast.error(data.error || "Invalid password");
      }
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">MixClub System Architecture</h1>
            <p className="text-muted-foreground">Platform Overview - Shared Presentation</p>
          </div>

          <Card>
            <CardContent className="p-12">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">MixClub Platform</h2>
                  <p className="text-xl text-muted-foreground">
                    Connecting Artists with Top Audio Engineers
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-primary">React + Vite</div>
                      <p className="text-sm text-muted-foreground mt-2">Modern Frontend</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-primary">Supabase</div>
                      <p className="text-sm text-muted-foreground mt-2">Backend Platform</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-primary">TypeScript</div>
                      <p className="text-sm text-muted-foreground mt-2">Type Safety</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-12 pt-6 border-t">
                  <p className="text-sm text-muted-foreground text-center">
                    Shared by MixClub Admin • Confidential
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center">MixClub System Presentation</CardTitle>
          <CardDescription className="text-center">
            This presentation is password-protected. Please enter the password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleVerify()}
              placeholder="Enter password"
            />
          </div>
          <Button onClick={handleVerify} disabled={verifying || !password} className="w-full">
            {verifying ? "Verifying..." : "Access Presentation"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
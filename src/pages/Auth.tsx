import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Music, User, Headphones } from "lucide-react";
import Navigation from "@/components/Navigation";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [userType, setUserType] = useState<"artist" | "engineer">("artist");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: isSignUp ? "Account created!" : "Welcome back!",
      description: "Redirecting to your dashboard...",
    });
    
    setTimeout(() => {
      navigate(userType === "artist" ? "/artist-dashboard" : "/engineer-dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />
      <div className="container px-6 py-32 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md border-border">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
              <Music className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">
              {isSignUp ? "Create your account" : "Welcome back"}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? "Join MixClubOnline and transform your music"
                : "Sign in to continue to your dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-6">
              {isSignUp && (
                <div className="space-y-4">
                  <Label>I am a</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setUserType("artist")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        userType === "artist"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <User className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-sm font-medium">Artist</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType("engineer")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        userType === "engineer"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Headphones className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-sm font-medium">Engineer</div>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="bg-background"
                />
              </div>

              <Button type="submit" className="w-full">
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:underline"
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;

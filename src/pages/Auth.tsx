import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Music, Sparkles, Users, Zap, Headphones, Mic2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import mixclub3DLogo from "@/assets/mixclub-3d-logo.png";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
  role: z.enum(["client", "engineer"]).optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"client" | "engineer">("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate input
      const validationData = {
        email,
        password,
        ...(mode === "signup" && { fullName, role })
      };
      
      authSchema.parse(validationData);

      if (mode === "signup") {
        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            }
          }
        });

        if (error) {
          if (error.message.includes("already registered")) {
            setError("This email is already registered. Please sign in instead.");
          } else {
            setError(error.message);
          }
          return;
        }

        // Update the profile with the selected role
        if (data.user) {
          await supabase
            .from('profiles')
            .update({ role })
            .eq('id', data.user.id);
        }

        toast.success("Account created! Redirecting to onboarding...");
        // Redirect to role-specific onboarding
        navigate(role === "engineer" ? "/onboarding/engineer" : "/onboarding/artist");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setError("Invalid email or password. Please try again.");
          } else {
            setError(error.message);
          }
          return;
        }

        // Get user profile to determine role-based redirect
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authUser.id)
            .single();

          toast.success("Welcome back!");
          
          // Redirect based on user role
          if (profile?.role === 'engineer') {
            navigate("/engineer-crm");
          } else {
            navigate("/artist-crm");
          }
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-[32rem] h-[32rem] bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse-glow"></div>
              <img 
                src={mixclub3DLogo} 
                alt="MixClub 3D Logo" 
                className="w-20 h-15 object-contain relative z-10"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              MixClub
            </span>{" "}
            <span className="text-foreground">Online</span>
          </h1>
          <p className="text-muted-foreground">
            {mode === "signup" 
              ? "Join the future of music collaboration" 
              : "Welcome back to the studio"
            }
          </p>
        </div>

        <Card className="p-8 bg-card/80 backdrop-blur-sm border-primary/20 shadow-xl">
          <form onSubmit={handleAuth} className="space-y-6">
            {mode === "signup" && (
              <>
                <div className="space-y-4">
                  <Label>I am a...</Label>
                  <RadioGroup value={role} onValueChange={(value: "client" | "engineer") => setRole(value)}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <RadioGroupItem value="client" id="client" className="peer sr-only" />
                        <Label
                          htmlFor="client"
                          className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-muted bg-card/50 p-6 hover:bg-accent/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                        >
                          <Mic2 className="w-8 h-8 text-primary" />
                          <span className="font-semibold">Artist</span>
                          <span className="text-xs text-muted-foreground text-center">Get professional mixing & mastering</span>
                        </Label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem value="engineer" id="engineer" className="peer sr-only" />
                        <Label
                          htmlFor="engineer"
                          className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-muted bg-card/50 p-6 hover:bg-accent/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                        >
                          <Headphones className="w-8 h-8 text-primary" />
                          <span className="font-semibold">Engineer</span>
                          <span className="text-xs text-muted-foreground text-center">Offer mixing & mastering services</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-background/50 border-primary/20 focus:border-primary/50"
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-primary/20 focus:border-primary/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 border-primary/20 focus:border-primary/50"
                required
              />
              {mode === "signup" && (
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            {error && (
              <Alert className="border-destructive/20 bg-destructive/10">
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  {mode === "signup" ? "Creating Account..." : "Signing In..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {mode === "signup" ? "Create Account" : "Sign In"}
                </div>
              )}
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {mode === "signup" 
                ? "Already have an account?" 
                : "Don't have an account?"
              }
            </p>
            <Button
              variant="outline"
              onClick={() => navigate(mode === "signup" ? "/auth" : "/auth?mode=signup")}
              className="w-full border-primary/20 hover:border-primary/40 hover:bg-primary/5"
            >
              {mode === "signup" ? "Sign In Instead" : "Create Account"}
            </Button>
          </div>

          {mode === "signup" && (
            <div className="mt-8 pt-6 border-t border-border">
              <div className="text-center mb-4">
                <p className="text-sm font-medium text-muted-foreground">Join thousands of creators</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="w-8 h-8 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">2.5K+ Engineers</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                    <Music className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">500K+ Tracks</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Real-time</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;

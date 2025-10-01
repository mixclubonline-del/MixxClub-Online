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
import { ArrowLeft, Music, Sparkles, Users, Zap, Headphones, Mic2, Apple } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

// Import Google icon
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
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

  const handleDemoLogin = async (role: 'client' | 'engineer' | 'admin') => {
    setLoading(true);
    setError('');
    
    const demoCredentials = {
      client: { email: 'mixclub.demo.artist@gmail.com', password: 'demo123456' },
      engineer: { email: 'mixclub.demo.engineer@gmail.com', password: 'demo123456' },
      admin: { email: 'mixclub.demo.admin@gmail.com', password: 'admin123456' }
    };

    const credentials = demoCredentials[role];

    try {
      // Try to sign in first
      let { data, error } = await supabase.auth.signInWithPassword(credentials);

      // If user doesn't exist, create them
      if (error?.message.includes('Invalid login')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            data: {
              full_name: role === 'client' ? 'Demo Artist' : 'Demo Engineer',
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

      // Update profile with role
      if (signUpData.user) {
        const profileRole = role === 'admin' ? 'client' : role;
        await supabase
          .from('profiles')
          .update({ role: profileRole })
          .eq('id', signUpData.user.id);

        toast.success(`Demo ${role} account ready!`);
        navigate(role === 'engineer' ? '/engineer-crm' : '/artist-crm');
      }
      } else if (error) {
        setError(error.message);
      } else if (data.user) {
        toast.success('Logged in as demo user!');
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        navigate(profile?.role === 'engineer' ? '/engineer-crm' : '/artist-crm');
      }
    } catch (err) {
      setError("Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setError("");
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          ...(mode === "signup" && {
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          })
        }
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
      // Don't set loading to false here as the redirect will happen
    } catch (err) {
      setError("Failed to sign in with " + provider);
      setLoading(false);
    }
  };

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
          // Check if user is admin using RPC function
          const { data: isAdminUser } = await supabase.rpc('is_admin', { 
            user_uuid: authUser.id 
          });

          if (isAdminUser) {
            toast.success("Welcome back, Admin!");
            navigate("/admin");
            return;
          }

          // Check regular role for non-admin users
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
          {/* Social Sign-in Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full border-border hover:bg-accent/10 hover:border-primary/30"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
            >
              <GoogleIcon />
              <span className="ml-2">Continue with Google</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-border hover:bg-accent/10 hover:border-primary/30"
              onClick={() => handleOAuthSignIn('apple')}
              disabled={loading}
            >
              <Apple className="w-5 h-5" />
              <span className="ml-2">Continue with Apple</span>
            </Button>
          </div>

          <div className="relative mb-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              or
            </span>
          </div>

          <div className="space-y-3 mb-6">
            <p className="text-sm text-center text-muted-foreground">Testing? Try demo accounts:</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleDemoLogin('client')}
                disabled={loading}
                className="flex flex-col items-center py-3 h-auto"
              >
                <Mic2 className="w-4 h-4 mb-1" />
                <span className="text-xs">Artist</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleDemoLogin('engineer')}
                disabled={loading}
                className="flex flex-col items-center py-3 h-auto"
              >
                <Headphones className="w-4 h-4 mb-1" />
                <span className="text-xs">Engineer</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="flex flex-col items-center py-3 h-auto"
              >
                <Sparkles className="w-4 h-4 mb-1" />
                <span className="text-xs">Admin</span>
              </Button>
            </div>
          </div>

          <div className="relative mb-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              or continue with email
            </span>
          </div>

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

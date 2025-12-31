import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Music, Sparkles, Users, Zap, Headphones, Mic2, Apple, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useAnalytics } from "@/hooks/useAnalytics";

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
  role: z.enum(["artist", "engineer"]).optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const redirectPath = searchParams.get("redirect") || null;
  const { trackSignup, trackEvent } = useAnalytics();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"artist" | "engineer">("artist");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [updatePasswordMode, setUpdatePasswordMode] = useState(false);

  // Listen for PASSWORD_RECOVERY event to show update password form
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setUpdatePasswordMode(true);
        setResetMode(false);
        toast.info("Please set your new password below.");
      }
    });

    // Check if we're in update-password mode from URL
    if (mode === 'update-password' || mode === 'reset') {
      setUpdatePasswordMode(true);
    }

    return () => subscription.unsubscribe();
  }, [mode]);

  const handleDemoLogin = async (role: 'client' | 'engineer' | 'admin') => {
    setLoading(true);
    setError('');
    
    try {
      // Create temporary demo session via secure edge function
      const { data, error } = await supabase.functions.invoke('create-demo-session', {
        body: { role }
      });

      if (error) {
        throw error;
      }

      if (!data?.email || !data?.password) {
        throw new Error('Invalid response from demo creation');
      }

      // Sign in with temporary credentials
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        throw authError;
      }

      // Clear localStorage slideshow flags for fresh demo experience
      localStorage.removeItem(`artist_crm_slideshow_seen_${data.userId}`);
      localStorage.removeItem('engineer_crm_slideshow_seen');

      toast.success(`Demo session created! Expires in 4 hours.`);
      
      // Route based on demo role
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'engineer') {
        navigate('/engineer-crm');
      } else {
        navigate('/artist-crm');
      }
    } catch (err) {
      console.error('Demo session creation failed:', err);
      setError("Failed to create demo session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setError("");
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      // Track OAuth attempt
      trackEvent('oauth_attempt', { provider, mode });
      
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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        if (error.message.includes("same password")) {
          setError("Please choose a different password than your current one.");
        } else {
          setError(error.message);
        }
        return;
      }

      toast.success("Password updated successfully! You can now sign in.");
      setUpdatePasswordMode(false);
      setPassword("");
      setConfirmPassword("");
      
      // Navigate to login
      navigate("/auth");
    } catch (err) {
      setError("Failed to update password. Please try again.");
    } finally {
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

        // Insert role into user_roles table (not profiles.role)
        if (data.user) {
          const roleToInsert = role === "artist" ? "artist" : "engineer";
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ user_id: data.user.id, role: roleToInsert });
          
          if (roleError) {
            console.error('Failed to assign role:', roleError);
          }
          
          // Track signup
          trackSignup('email');
        }

        toast.success("Account created! Redirecting...");
        
        // If there's a redirect path, go there after a brief delay for profile setup
        if (redirectPath) {
          setTimeout(() => {
            navigate(redirectPath);
          }, 500);
        } else {
          // Otherwise go to role-specific onboarding
          navigate(role === "engineer" ? "/onboarding/engineer" : "/onboarding/artist");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setError("Invalid email or password. Please try again.");
          } else if (error.message.includes("Email not confirmed")) {
            setError("Please confirm your email before signing in.");
          } else {
            setError(error.message);
          }
          return;
        }

        // Get user profile to determine role-based redirect
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          // Check if user is admin using RPC function
          const { data: isAdminUser } = await supabase.rpc('has_role', { _user_id: authUser.id, _role: 'admin' });

          if (isAdminUser) {
            toast.success("Welcome back, Admin!");
            navigate("/admin");
            return;
          }

          // Check user_roles table for role
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', authUser.id);

          toast.success("Welcome back!");
          
          // Check if there's a redirect path
          if (redirectPath) {
            navigate(redirectPath);
          } else {
            // Redirect based on user role from user_roles table
            const roles = userRoles?.map(r => r.role) || [];
            if (roles.includes('engineer')) {
              navigate("/engineer-crm");
            } else {
              navigate("/artist-crm");
            }
          }
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      if (!email) {
        setError("Please enter your email address");
        setLoading(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/auth?mode=update-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setError(error.message);
      } else {
        setResetEmailSent(true);
        toast.success("Password reset email sent! Check your inbox.");
      }
    } catch (err) {
      setError("Failed to send password reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setError("");
    setLoading(true);
    
    try {
      if (!email) {
        setError("Please enter your email address");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        setError(error.message);
      } else {
        toast.success("Confirmation email sent! Check your inbox.");
      }
    } catch (err) {
      setError("Failed to resend confirmation email");
    } finally {
      setLoading(false);
    }
  };

  // Update Password Form
  if (updatePasswordMode) {
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
                Set New Password
              </span>
            </h1>
            <p className="text-muted-foreground">
              Create a secure password for your account
            </p>
          </div>

          <Card className="p-8 bg-card/80 backdrop-blur-sm border-primary/20 shadow-xl">
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <KeyRound className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-primary/20 focus:border-primary/50"
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-background/50 border-primary/20 focus:border-primary/50"
                  required
                  minLength={6}
                />
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
                    Updating Password...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    Update Password
                  </div>
                )}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setUpdatePasswordMode(false);
                  setError("");
                  navigate("/auth");
                }}
                className="w-full border-primary/20 hover:border-primary/40 hover:bg-primary/5"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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

        {/* Demo Banner */}
        <div 
          onClick={() => navigate('/insider-demo')}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-accent-blue/20 border border-primary/30 cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary group-hover:animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Experience MIXXCLUB</p>
              <p className="text-xs text-muted-foreground">See the full experience demo →</p>
            </div>
          </div>
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


          {resetMode ? (
            // Password Reset Form
            <>
              <div className="mb-6 text-center">
                <h2 className="text-xl font-semibold mb-2">Reset Password</h2>
                <p className="text-sm text-muted-foreground">
                  {resetEmailSent 
                    ? "Check your email for a password reset link. Use only the most recent link—each link can only be used once."
                    : "Enter your email to receive a password reset link"
                  }
                </p>
              </div>

              {!resetEmailSent && (
                <form onSubmit={handlePasswordReset} className="space-y-6">
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
                        Sending Reset Link...
                      </div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              )}

              {resetEmailSent && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the email? Check your spam folder or request a new link.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setResetEmailSent(false);
                    }}
                    className="border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                  >
                    Send Another Link
                  </Button>
                </div>
              )}

              <Separator className="my-6" />

              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResetMode(false);
                    setResetEmailSent(false);
                    setError("");
                  }}
                  className="w-full border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                >
                  Back to Sign In
                </Button>
              </div>
            </>
          ) : (
            // Regular Auth Form
            <>
              <form onSubmit={handleAuth} className="space-y-6">
            {mode === "signup" && (
              <>
                <div className="space-y-4">
                  <Label>I am a...</Label>
                  <RadioGroup value={role} onValueChange={(value: "artist" | "engineer") => setRole(value)}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <RadioGroupItem value="artist" id="artist" className="peer sr-only" />
                        <Label
                          htmlFor="artist"
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
              {mode === "login" && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setResetMode(true)}
                    className="text-xs text-primary hover:text-primary/80 p-0 h-auto"
                  >
                    Forgot Password?
                  </Button>
                </div>
              )}
            </div>

            {error && (
              <div className="space-y-3">
                <Alert className="border-destructive/20 bg-destructive/10">
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
                {error.toLowerCase().includes("email not confirmed") && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendConfirmation}
                    disabled={loading}
                    className="w-full border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                  >
                    Resend Confirmation Email
                  </Button>
                )}
              </div>
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
            </>
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

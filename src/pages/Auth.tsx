import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Music, Sparkles, Users, Zap, Headphones, Mic2, Apple, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

// Parse Supabase auth errors into user-friendly messages
const parseAuthError = (error: { message: string; code?: string; status?: number }): string => {
  const msg = error.message?.toLowerCase() || '';
  const code = error.code?.toLowerCase() || '';
  
  // Password-related errors
  if (msg.includes('password') && (msg.includes('weak') || msg.includes('pwned') || msg.includes('compromised'))) {
    return "This password has been exposed in data breaches. Please choose a stronger, unique password.";
  }
  if (msg.includes('password') && msg.includes('short')) {
    return "Password must be at least 6 characters long.";
  }
  if (code === 'weak_password' || msg.includes('weak_password')) {
    return "Password is too weak. Please use a mix of letters, numbers, and symbols.";
  }
  
  // Email-related errors
  if (msg.includes('email') && msg.includes('invalid')) {
    return "Please enter a valid email address.";
  }
  if (msg.includes('already registered') || msg.includes('user already exists')) {
    return "This email is already registered. Please sign in instead.";
  }
  if (msg.includes('email not confirmed') || msg.includes('email_not_confirmed')) {
    return "Please confirm your email before signing in. Check your inbox for the verification link.";
  }
  
  // Login errors
  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
    return "Invalid email or password. Please try again.";
  }
  if (msg.includes('too many requests') || code === 'over_request_limit') {
    return "Too many attempts. Please wait a moment before trying again.";
  }
  
  // Rate limiting
  if (msg.includes('rate limit') || msg.includes('ratelimit')) {
    return "Too many requests. Please wait a few minutes and try again.";
  }
  
  // Network/server errors
  if (msg.includes('network') || msg.includes('fetch')) {
    return "Network error. Please check your connection and try again.";
  }
  
  // Signup-specific
  if (msg.includes('signup') && msg.includes('disabled')) {
    return "Sign-ups are currently disabled. Please try again later.";
  }
  
  // Return original message if no specific match (Supabase messages are often user-friendly)
  return error.message || "An unexpected error occurred. Please try again.";
};

import { useAnalytics } from "@/hooks/useAnalytics";
import { motion, AnimatePresence } from "framer-motion";
import authGatewayImage from "@/assets/auth-gateway.jpg";
import mixclub3DLogo from "@/assets/mixclub-3d-logo.png";
import { AuthSocialProof, RoleBenefits, UsernamePreview } from "@/components/auth/AuthSocialProof";

// Import Google icon
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
  role: z.enum(["artist", "engineer"]).optional(),
});

// Optimized ambient particles - CSS-based for performance
const AmbientParticles = () => {
  // Respect reduced motion preference
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }
  
  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ contain: 'layout' }}
    >
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30 animate-float-particle"
          style={{
            left: `${10 + (i * 11)}%`,
            top: `${15 + (i * 8)}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${4 + (i % 3)}s`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
};

// Role selection as visual paths - CSS-based for performance (no Framer Motion)
const RolePathSelector = ({ 
  role, 
  onRoleChange 
}: { 
  role: "artist" | "engineer"; 
  onRoleChange: (role: "artist" | "engineer") => void;
}) => (
  <div className="space-y-3">
    <Label className="text-white/80">Choose your path</Label>
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onRoleChange("artist")}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl p-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
          role === "artist" 
            ? "bg-primary/30 border-2 border-primary shadow-lg shadow-primary/30" 
            : "bg-white/5 border border-white/10 hover:bg-white/10"
        }`}
      >
        {role === "artist" && (
          <div className="absolute inset-0 rounded-xl bg-primary/20 animate-fade-in" />
        )}
        <div className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center ${
          role === "artist" ? "bg-primary/40" : "bg-white/10"
        }`}>
          <Mic2 className={`w-7 h-7 ${role === "artist" ? "text-primary" : "text-white/60"}`} />
        </div>
        <span className={`relative z-10 font-semibold ${role === "artist" ? "text-white" : "text-white/70"}`}>
          Artist
        </span>
        <span className="relative z-10 text-xs text-white/50 text-center">
          Get professional mixing & mastering
        </span>
      </button>
      
      <button
        type="button"
        onClick={() => onRoleChange("engineer")}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl p-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
          role === "engineer" 
            ? "bg-cyan-500/30 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30" 
            : "bg-white/5 border border-white/10 hover:bg-white/10"
        }`}
      >
        {role === "engineer" && (
          <div className="absolute inset-0 rounded-xl bg-cyan-500/20 animate-fade-in" />
        )}
        <div className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center ${
          role === "engineer" ? "bg-cyan-500/40" : "bg-white/10"
        }`}>
          <Headphones className={`w-7 h-7 ${role === "engineer" ? "text-cyan-400" : "text-white/60"}`} />
        </div>
        <span className={`relative z-10 font-semibold ${role === "engineer" ? "text-white" : "text-white/70"}`}>
          Engineer
        </span>
        <span className="relative z-10 text-xs text-white/50 text-center">
          Offer mixing & mastering services
        </span>
      </button>
    </div>
  </div>
);

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
  const [enteringCity, setEnteringCity] = useState(false);

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
      
      // Trigger entry animation then navigate
      setEnteringCity(true);
      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'engineer') {
          navigate('/engineer-crm');
        } else {
          navigate('/artist-crm');
        }
      }, 1000);
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
      // Track OAuth attempt
      trackEvent('oauth_attempt', { provider, mode });
      
      // Use Lovable Cloud managed OAuth
      const { error } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
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

  const triggerEntryAnimation = (destination: string) => {
    setEnteringCity(true);
    setTimeout(() => {
      navigate(destination);
    }, 1000);
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
          setError(parseAuthError(error));
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

        toast.success("Account created! Entering the city...");
        
        // Entry animation then navigate
        const destination = redirectPath 
          ? redirectPath 
          : (role === "engineer" ? "/onboarding/engineer" : "/onboarding/artist");
        triggerEntryAnimation(destination);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(parseAuthError(error));
          return;
        }

        // Get user profile to determine role-based redirect
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          toast.success("Welcome back to the city!");
          
          // Determine destination
          let destination = "/dashboard";
          
          // PRIORITY 1: Check if there's a redirect path (from Landing Forge, etc.)
          if (redirectPath) {
            destination = redirectPath;
          } else {
            // PRIORITY 2: Check if user is admin using RPC function
            const { data: isAdminUser } = await supabase.rpc('has_role', { _user_id: authUser.id, _role: 'admin' });

            if (isAdminUser) {
              destination = "/admin";
            } else {
              // PRIORITY 3: Redirect based on user role from user_roles table
              const { data: userRoles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', authUser.id);

              const roles = userRoles?.map(r => r.role) || [];
              destination = roles.includes('engineer') ? "/engineer-crm" : "/artist-crm";
            }
          }
          
          // Entry animation then navigate
          triggerEntryAnimation(destination);
        } else {
          triggerEntryAnimation("/dashboard");
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

  // Immersive Gateway Wrapper
  const GatewayWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-screen gateway background */}
      <div className="absolute inset-0">
        <img 
          src={authGatewayImage} 
          alt="MixClub City Gateway" 
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
      </div>
      
      {/* Ambient particles */}
      <AmbientParticles />
      
      {/* Entry animation overlay */}
      <AnimatePresence>
        {enteringCity && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Zoom through gates effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent"
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 2] }}
              transition={{ duration: 1, ease: "easeIn" }}
            />
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{ backgroundColor: "white" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {children}
      </div>
      
      {/* Back to home button */}
      <motion.div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-white/60 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to City
        </Button>
      </motion.div>
    </div>
  );

  // Update Password Form (immersive version)
  if (updatePasswordMode) {
    return (
      <GatewayWrapper>
  <motion.div 
    className="w-full max-w-md"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    layout={false}
  >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse"></div>
                <img 
                  src={mixclub3DLogo} 
                  alt="MixClub" 
                  className="w-20 h-15 object-contain relative z-10"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-white">
              Set New Password
            </h1>
            <p className="text-white/60">
              Create a secure password for your account
            </p>
          </div>

          {/* Glass panel */}
          <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <KeyRound className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-white/30"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <p className="text-xs text-white/40">
                  Password must be at least 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-white/30"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <Alert className="border-red-500/20 bg-red-500/10">
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
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

            <Separator className="my-6 bg-white/10" />

            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setUpdatePasswordMode(false);
                  setError("");
                  navigate("/auth");
                }}
                className="w-full border-white/10 hover:border-white/20 hover:bg-white/5 text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </div>
          </div>
        </motion.div>
      </GatewayWrapper>
    );
  }

  return (
    <GatewayWrapper>
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        layout={false}
      >
        {/* Header */}
        <div className="text-center mb-6" style={{ contain: 'layout' }}>
          <div 
            className="flex justify-center mb-4 animate-fade-in"
            style={{ animationDelay: '200ms' }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/40 rounded-full blur-2xl animate-pulse"></div>
              <img 
                src={mixclub3DLogo} 
                alt="MixClub" 
                className="w-16 h-12 object-contain relative z-10"
              />
            </div>
          </div>
          <h1 
            className="text-2xl font-bold mb-1 text-white animate-fade-in"
            style={{ animationDelay: '300ms' }}
          >
            {mode === "signup" ? "Enter the City" : "Welcome Back"}
          </h1>
          <p 
            className="text-white/50 text-sm animate-fade-in"
            style={{ animationDelay: '400ms' }}
          >
            {mode === "signup" 
              ? "Join the future of music collaboration" 
              : "The studio awaits"
            }
          </p>
        </div>

        {/* Demo Banner */}
        <div 
          onClick={() => navigate('/insider-demo')}
          className="mb-4 p-3 rounded-xl bg-white/5 border border-primary/30 cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all group hover:scale-[1.02]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary group-hover:animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-white">Experience MIXXCLUB</p>
              <p className="text-xs text-white/50">See the full experience demo →</p>
            </div>
          </div>
        </div>

        {/* Social Proof Stats */}
        <AuthSocialProof className="mb-4" />

        {/* Glass panel form */}
        <div 
          className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          {/* Social Sign-in Buttons */}
          <div className="space-y-3 mb-5">
            <Button
              type="button"
              variant="outline"
              className="w-full border-white/10 hover:bg-white/10 hover:border-white/20 text-white bg-white/5"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
            >
              <GoogleIcon />
              <span className="ml-2">Continue with Google</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-white/10 hover:bg-white/10 hover:border-white/20 text-white bg-white/5"
              onClick={() => handleOAuthSignIn('apple')}
              disabled={loading}
            >
              <Apple className="w-5 h-5" />
              <span className="ml-2">Continue with Apple</span>
            </Button>
          </div>

          <div className="relative mb-5">
            <Separator className="bg-white/10" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 px-3 text-xs text-white/40">
              or
            </span>
          </div>

          {resetMode ? (
            // Password Reset Form
            <>
              <div className="mb-5 text-center">
                <h2 className="text-lg font-semibold mb-2 text-white">Reset Password</h2>
                <p className="text-sm text-white/50">
                  {resetEmailSent 
                    ? "Check your email for a reset link"
                    : "Enter your email to receive a reset link"
                  }
                </p>
              </div>

              {!resetEmailSent && (
                <form onSubmit={handlePasswordReset} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/80">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-white/30"
                      required
                      autoComplete="email"
                    />
                  </div>

                  {error && (
                    <Alert className="border-red-500/20 bg-red-500/10">
                      <AlertDescription className="text-red-400">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary/80"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              )}

              {resetEmailSent && (
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-primary" />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setResetEmailSent(false)}
                    className="border-white/10 hover:border-white/20 hover:bg-white/5 text-white"
                  >
                    Send Another Link
                  </Button>
                </div>
              )}

              <Separator className="my-5 bg-white/10" />

              <Button
                variant="outline"
                onClick={() => {
                  setResetMode(false);
                  setResetEmailSent(false);
                  setError("");
                }}
                className="w-full border-white/10 hover:border-white/20 hover:bg-white/5 text-white"
              >
                Back to Sign In
              </Button>
            </>
          ) : (
            // Regular Auth Form
            <>
              <form onSubmit={handleAuth} className="space-y-5">
                {mode === "signup" && (
                  <>
                    <RolePathSelector role={role} onRoleChange={setRole} />
                    
                    {/* Role-specific benefits */}
                    <RoleBenefits role={role} />

                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-white/80">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-white/30"
                        required
                        autoComplete="name"
                      />
                      
                      {/* Username preview based on full name */}
                      <UsernamePreview username={fullName} />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-white/30"
                   required
                   autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/80">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-white/30"
                    required
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  />
                  {mode === "signup" && (
                    <p className="text-xs text-white/40">
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
                    <Alert className="border-red-500/20 bg-red-500/10">
                      <AlertDescription className="text-red-400">
                        {error}
                      </AlertDescription>
                    </Alert>
                    {error.toLowerCase().includes("email not confirmed") && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendConfirmation}
                        disabled={loading}
                        className="w-full border-white/10 hover:border-white/20 hover:bg-white/5 text-white"
                      >
                        Resend Confirmation Email
                      </Button>
                    )}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
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
                      {mode === "signup" ? "Enter the City" : "Enter"}
                    </div>
                  )}
                </Button>
              </form>

              <Separator className="my-5 bg-white/10" />

              <div className="text-center space-y-3">
                <p className="text-sm text-white/50">
                  {mode === "signup" 
                    ? "Already have an account?" 
                    : "Don't have an account?"
                  }
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate(mode === "signup" ? "/auth" : "/auth?mode=signup")}
                  className="w-full border-white/10 hover:border-white/20 hover:bg-white/5 text-white"
                >
                  {mode === "signup" ? "Sign In Instead" : "Create Account"}
                </Button>
              </div>

              {mode === "signup" && (
                <div className="mt-6 pt-5 border-t border-white/10">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-2">
                      <div className="w-8 h-8 mx-auto rounded-lg bg-primary/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-xs text-white/40">2.5K+ Engineers</p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-8 h-8 mx-auto rounded-lg bg-primary/20 flex items-center justify-center">
                        <Music className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-xs text-white/40">500K+ Tracks</p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-8 h-8 mx-auto rounded-lg bg-primary/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-xs text-white/40">Real-time</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </GatewayWrapper>
  );
};

export default Auth;

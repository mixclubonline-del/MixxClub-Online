import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mic2, Headphones, Shield } from 'lucide-react';

export default function DemoLogin() {
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const createDemoSession = async (role: 'client' | 'engineer' | 'admin') => {
    setLoading(role);
    try {
      const response = await supabase.functions.invoke('create-demo-session', {
        body: { role }
      });

      if (response.error) throw response.error;

      const { email, password } = response.data;

      // Sign in with the demo credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      toast.success(`Demo ${role} session created!`);
      
      // Navigate based on role
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'engineer') {
        navigate('/engineer-crm');
      } else {
        navigate('/artist-crm');
      }
    } catch (error) {
      console.error('Demo session error:', error);
      toast.error('Failed to create demo session');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Mixxclub CRM Demo</CardTitle>
          <CardDescription className="text-lg">
            Choose a role to explore the platform (session expires in 4 hours)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => !loading && createDemoSession('client')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Mic2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Artist Account</CardTitle>
                  <CardDescription>
                    Post jobs, manage projects, collaborate with engineers
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                size="lg"
                disabled={loading !== null}
                onClick={() => createDemoSession('client')}
              >
                {loading === 'client' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Session...
                  </>
                ) : (
                  'Launch Artist Demo'
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => !loading && createDemoSession('engineer')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Headphones className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Engineer Account</CardTitle>
                  <CardDescription>
                    Browse jobs, submit applications, deliver work
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                size="lg"
                disabled={loading !== null}
                onClick={() => createDemoSession('engineer')}
              >
                {loading === 'engineer' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Session...
                  </>
                ) : (
                  'Launch Engineer Demo'
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => !loading && createDemoSession('admin')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Admin Account</CardTitle>
                  <CardDescription>
                    Manage users, view analytics, oversee platform operations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                size="lg"
                disabled={loading !== null}
                onClick={() => createDemoSession('admin')}
              >
                {loading === 'admin' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Session...
                  </>
                ) : (
                  'Launch Admin Demo'
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground mt-6">
            <p>Demo accounts are temporary and will be automatically deleted after 4 hours</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

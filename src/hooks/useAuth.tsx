import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: 'client' | 'engineer' | 'admin' | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'client' | 'engineer' | 'admin' | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only log auth events in development
        if (import.meta.env.DEV) {
          console.log('Auth state changed:', event, session?.user ? 'authenticated' : 'no session');
        }
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Defer role fetching from user_roles table (secure)
        if (session?.user) {
          setTimeout(async () => {
            // Fetch from user_roles table for secure authorization
            const { data: roles } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id);
            
            // Set role priority: admin > engineer > client
            if (roles && roles.length > 0) {
              const roleTypes = roles.map(r => r.role);
              if (roleTypes.includes('admin')) {
                setUserRole('admin');
              } else if (roleTypes.includes('engineer')) {
                setUserRole('engineer');
              } else {
                setUserRole('client');
              }
            } else {
              // Fallback to profiles.role for display purposes only
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
              setUserRole(profile?.role || 'client');
            }
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Clear local session first to ensure UI updates immediately
    setSession(null);
    setUser(null);
    setUserRole(null);
    
    // Attempt to sign out from server, but ignore session errors
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error && error.message !== 'Auth session missing!') {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    userRole,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: 'client' | 'engineer' | 'admin' | null;
  userRoles: ('client' | 'engineer' | 'admin')[];
  activeRole: 'client' | 'engineer' | 'admin' | null;
  setActiveRole: (role: 'client' | 'engineer' | 'admin') => void;
  isHybridUser: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'client' | 'engineer' | 'admin' | null>(null);
  const [userRoles, setUserRoles] = useState<('client' | 'engineer' | 'admin')[]>([]);
  const [activeRole, setActiveRole] = useState<'client' | 'engineer' | 'admin' | null>(null);
  const [isHybridUser, setIsHybridUser] = useState(false);

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
            // Fetch ALL roles from user_roles table
            const { data: roles } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id);
            
            if (roles && roles.length > 0) {
              const roleTypes = roles.map(r => r.role) as ('client' | 'engineer' | 'admin')[];
              setUserRoles(roleTypes);
              setIsHybridUser(roleTypes.length > 1 && roleTypes.some(r => r === 'client' || r === 'engineer'));
              
              // Fetch primary role preference
              const { data: prefs } = await supabase
                .from('hybrid_user_preferences')
                .select('primary_role')
                .eq('user_id', session.user.id)
                .single();
              
              // Set primary role priority: admin > preference > first role
              if (roleTypes.includes('admin')) {
                setUserRole('admin');
                setActiveRole('admin');
              } else if (prefs?.primary_role) {
                setUserRole(prefs.primary_role as 'client' | 'engineer');
                setActiveRole(prefs.primary_role as 'client' | 'engineer');
              } else if (roleTypes.includes('engineer')) {
                setUserRole('engineer');
                setActiveRole('engineer');
              } else {
                setUserRole('client');
                setActiveRole('client');
              }
            } else {
              // Fallback to profiles.role for display purposes only
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
              const fallbackRole = profile?.role || 'client';
              setUserRole(fallbackRole);
              setUserRoles([fallbackRole]);
              setActiveRole(fallbackRole);
              setIsHybridUser(false);
            }
          }, 0);
        } else {
          setUserRole(null);
          setUserRoles([]);
          setActiveRole(null);
          setIsHybridUser(false);
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

  const handleSetActiveRole = async (role: 'client' | 'engineer' | 'admin') => {
    setActiveRole(role);
    setUserRole(role);
    
    // Save preference to database
    if (user && role !== 'admin') {
      await supabase
        .from('hybrid_user_preferences')
        .upsert({
          user_id: user.id,
          primary_role: role,
          default_dashboard: role === 'client' ? 'artist' : 'engineer'
        });
    }
  };

  const signOut = async () => {
    // Clear local session first to ensure UI updates immediately
    setSession(null);
    setUser(null);
    setUserRole(null);
    setUserRoles([]);
    setActiveRole(null);
    setIsHybridUser(false);
    
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
    userRoles,
    activeRole,
    setActiveRole: handleSetActiveRole,
    isHybridUser,
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

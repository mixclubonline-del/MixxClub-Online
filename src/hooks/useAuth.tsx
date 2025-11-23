import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'client' | 'engineer' | 'admin' | null>(null);
  const [userRoles, setUserRoles] = useState<('client' | 'engineer' | 'admin')[]>([]);
  const [activeRole, setActiveRoleState] = useState<'client' | 'engineer' | 'admin' | null>(null);
  const [isHybridUser] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Default to client role
        setUserRole('client');
        setUserRoles(['client']);
        setActiveRoleState('client');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setUserRole('client');
        setUserRoles(['client']);
        setActiveRoleState('client');
      } else {
        setUserRole(null);
        setUserRoles([]);
        setActiveRoleState(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSetActiveRole = async (role: 'client' | 'engineer' | 'admin') => {
    setActiveRoleState(role);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setUserRoles([]);
    setActiveRoleState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        userRole,
        userRoles,
        activeRole,
        setActiveRole: handleSetActiveRole,
        isHybridUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

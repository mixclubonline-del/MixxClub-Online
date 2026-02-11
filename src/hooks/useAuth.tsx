import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'artist' | 'engineer' | 'producer' | 'fan' | 'admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: AppRole | null;
  userRoles: AppRole[];
  activeRole: AppRole | null;
  setActiveRole: (role: AppRole) => void;
  isHybridUser: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Dev Auth Bypass ───────────────────────────────────────────────────
// Set VITE_DEV_AUTH_BYPASS=true in .env to skip Supabase login during dev.
// Provides a mock user so all protected routes are accessible.
const DEV_AUTH_BYPASS = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

const DEV_MOCK_USER = {
  id: 'dev-user-00000000-0000-0000-0000-000000000000',
  email: 'dev@mixxclub.local',
  app_metadata: {},
  user_metadata: { full_name: 'Dev User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as unknown as User;

const DEV_MOCK_SESSION = {
  access_token: 'dev-bypass-token',
  refresh_token: 'dev-bypass-refresh',
  expires_in: 999999,
  token_type: 'bearer',
  user: DEV_MOCK_USER,
} as unknown as Session;
// ────────────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ── If dev bypass is active, skip Supabase entirely ──
  if (DEV_AUTH_BYPASS) {
    return (
      <AuthContext.Provider
        value={{
          user: DEV_MOCK_USER,
          session: DEV_MOCK_SESSION,
          loading: false,
          userRole: 'producer',
          userRoles: ['producer', 'engineer', 'artist'],
          activeRole: 'producer',
          setActiveRole: () => { },
          isHybridUser: true,
          signOut: async () => { console.log('[Dev Bypass] signOut ignored'); },
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [activeRole, setActiveRoleState] = useState<AppRole | null>(null);
  const [isHybridUser, setIsHybridUser] = useState(false);

  // Fetch roles from user_roles table
  const fetchUserRoles = async (userId: string) => {
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return (roles?.map(r => r.role) || []) as AppRole[];
    } catch (err) {
      console.error('Failed to fetch user roles:', err);
      return [];
    }
  };

  // Load roles when user changes
  useEffect(() => {
    if (user) {
      // Defer the role fetching to avoid deadlock
      setTimeout(async () => {
        const roles = await fetchUserRoles(user.id);

        if (roles.length > 0) {
          setUserRoles(roles);
          setIsHybridUser(roles.length > 1);

          // Set primary role (admin > engineer > artist)
          if (roles.includes('admin')) {
            setUserRole('admin');
            setActiveRoleState('admin');
          } else if (roles.includes('producer')) {
            setUserRole('producer');
            setActiveRoleState('producer');
          } else if (roles.includes('engineer')) {
            setUserRole('engineer');
            setActiveRoleState('engineer');
          } else if (roles.includes('artist')) {
            setUserRole('artist');
            setActiveRoleState('artist');
          } else if (roles.includes('fan')) {
            setUserRole('fan');
            setActiveRoleState('fan');
          } else {
            // Default to fan if no recognized role
            setUserRole('fan');
            setActiveRoleState('fan');
          }
        } else {
          // No roles in table, default to fan
          setUserRole('fan');
          setUserRoles(['fan']);
          setActiveRoleState('fan');
        }
      }, 0);
    } else {
      setUserRole(null);
      setUserRoles([]);
      setActiveRoleState(null);
      setIsHybridUser(false);
    }
  }, [user]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSetActiveRole = (role: AppRole) => {
    if (userRoles.includes(role)) {
      setActiveRoleState(role);
      setUserRole(role);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setUserRoles([]);
    setActiveRoleState(null);
    setIsHybridUser(false);
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

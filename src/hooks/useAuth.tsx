import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
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
// Only allow dev bypass in actual development mode AND when explicitly enabled
const DEV_AUTH_BYPASS = import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

const DEV_MOCK_USER = {
  id: '00000000-0000-4000-8000-000000000000',
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

/** Resolve roles from user_roles table and return derived state */
async function resolveRoles(userId: string): Promise<{
  roles: AppRole[];
  primaryRole: AppRole;
  isHybrid: boolean;
}> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user roles:', error);
      return { roles: ['fan'], primaryRole: 'fan', isHybrid: false };
    }

    const roles = (data?.map(r => r.role) || []) as AppRole[];
    if (roles.length === 0) {
      return { roles: ['fan'], primaryRole: 'fan', isHybrid: false };
    }

    // Priority: admin > producer > engineer > artist > fan
    const priority: AppRole[] = ['admin', 'producer', 'engineer', 'artist', 'fan'];
    const primaryRole = priority.find(r => roles.includes(r)) ?? 'fan';

    return { roles, primaryRole, isHybrid: roles.length > 1 };
  } catch {
    return { roles: ['fan'], primaryRole: 'fan', isHybrid: false };
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ── Dev bypass ──
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
          signOut: async () => { window.location.href = '/auth'; },
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
  const isMounted = useRef(true);

  /** Apply resolved role state */
  const applyRoles = (result: Awaited<ReturnType<typeof resolveRoles>>) => {
    if (!isMounted.current) return;
    setUserRoles(result.roles);
    setUserRole(result.primaryRole);
    setActiveRoleState(result.primaryRole);
    setIsHybridUser(result.isHybrid);
  };

  const clearRoles = () => {
    setUserRole(null);
    setUserRoles([]);
    setActiveRoleState(null);
    setIsHybridUser(false);
  };

  useEffect(() => {
    isMounted.current = true;

    // 1. Listener for ONGOING auth changes (after initial load)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted.current) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Defer to avoid Supabase deadlock, but do NOT touch loading here
          setTimeout(() => {
            resolveRoles(newSession.user.id).then(result => {
              if (isMounted.current) applyRoles(result);
            });
          }, 0);
        } else {
          clearRoles();
        }
      }
    );

    // 2. INITIAL load — fetch session + roles BEFORE setting loading=false
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!isMounted.current) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const result = await resolveRoles(initialSession.user.id);
          if (isMounted.current) applyRoles(result);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
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
    clearRoles();
    // Redirect to home page so user doesn't remain on a stale protected page
    window.location.href = '/';
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

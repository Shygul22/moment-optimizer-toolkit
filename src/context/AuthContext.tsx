import { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase, withRetry } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { cleanupAuthState } from '@/lib/authUtils';
import { toast } from 'sonner';

type AppRole = Database["public"]["Enums"]["app_role"];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    cleanupAuthState();
    try {
        await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
        console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    setLoading(true);

    const handleUserAndRoleCheck = async (user: User) => {
      try {
        await withRetry(async () => {
          const [profileResult, rolesResult] = await Promise.all([
            supabase.from('profiles').select('is_active').eq('id', user.id).single(),
            supabase.from('user_roles').select('role').eq('user_id', user.id)
          ]);

          const { data: profile, error: profileError } = profileResult;
          // .single() throws an error if no row is found (PGRST116), which we can ignore for new users without a profile.
          if (profileError && profileError.code !== 'PGRST116') {
            throw new Error(`Profile fetch error: ${profileError.message}`);
          }

          const { data: userRoles, error: rolesError } = rolesResult;
          if (rolesError) {
            throw new Error(`Roles fetch error: ${rolesError.message}`);
          }

          if (profile && profile.is_active === false) {
            await signOut();
            toast.error("Your account has been deactivated by an administrator.");
            // After signOut, onAuthStateChange will fire again and handle loading state.
          } else {
            // User is active (or has no profile yet), so we set roles and finish loading.
            setRoles(userRoles ? userRoles.map((r) => r.role) : []);
            setLoading(false);
          }
        });
      } catch (error: any) {
        console.error("Error fetching user data:", error.message);
        setRoles([]);
        setLoading(false); // Stop loading to prevent app from getting stuck.
        
        // Show different messages based on error type
        if (error.message?.includes('Failed to fetch')) {
          toast.error("Network connection issue. Please check your internet connection and try again.");
        } else {
          toast.error("Failed to load your account information. Please try refreshing the page.");
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Defer the async checks to avoid potential deadlocks
          setTimeout(() => handleUserAndRoleCheck(currentUser), 0);
        } else {
          setRoles([]);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const updateUserPresence = async () => {
      if (user) {
        try {
          await withRetry(async () => {
            await supabase
              .from('profiles')
              .update({ last_seen: new Date().toISOString() })
              .eq('id', user.id);
          });
        } catch (error) {
          // Silently fail for presence updates to avoid spamming errors
          console.warn('Failed to update user presence:', error);
        }
      }
    };

    updateUserPresence();

    const presenceInterval = setInterval(updateUserPresence, 15000); // every 15 seconds

    return () => {
      clearInterval(presenceInterval);
    };
  }, [user]);

  const value = {
    session,
    user,
    roles,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
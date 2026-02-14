import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserRole } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, retries = 2): Promise<void> => {
    for (let i = 0; i < retries; i++) {
      try {
        const result = await Promise.race([
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle(),
          new Promise<{ data: null; error: { message: string } }>((resolve) =>
            setTimeout(() => resolve({ data: null, error: { message: 'Timeout' } }), 3000)
          ),
        ]);
        if (result.data) {
          setProfile(result.data as unknown as Profile);
          return;
        }
        if (result.error) console.warn('Profile fetch attempt failed:', result.error.message);
      } catch (err) {
        console.warn('Profile fetch error');
      }
      if (i < retries - 1) await new Promise(r => setTimeout(r, 300));
    }
  };

  useEffect(() => {
    let resolved = false;
    const done = () => { resolved = true; setLoading(false); };

    // Safety timeout: never stay on loading screen forever
    const safetyTimer = setTimeout(() => {
      if (!resolved) {
        console.warn('Auth: safety timeout reached, forcing loading=false');
        done();
      }
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      done();
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      done();
    }).catch(() => done());

    return () => { clearTimeout(safetyTimer); subscription.unsubscribe(); };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    if (data.user) {
      // Update profile with role
      await supabase.from('profiles').update({ role, full_name: fullName }).eq('user_id', data.user.id);
      await fetchProfile(data.user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

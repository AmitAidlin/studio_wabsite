import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;  // Admin flag
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    isEmailConfirmed?: boolean;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    user: User | null;
  }>;
  signOut: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<{
    error: Error | null;
  }>;
};

// List of admin emails - add your email here
const ADMIN_EMAILS = ['guyaga10@gmail.com', 'aidlin427@gmail.com']; // Added your email to admin list

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Check if the user's email is in the admin list
        const userEmail = currentSession?.user?.email;
        setIsAdmin(!!userEmail && ADMIN_EMAILS.includes(userEmail));
        
        setIsLoading(false);
        
        // Log for debugging
        if (currentSession?.user) {
          console.log('User authenticated:', {
            email: currentSession.user.email,
            id: currentSession.user.id,
            isAdmin: !!userEmail && ADMIN_EMAILS.includes(userEmail)
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Check if the user's email is in the admin list
      const userEmail = currentSession?.user?.email;
      setIsAdmin(!!userEmail && ADMIN_EMAILS.includes(userEmail));
      
      setIsLoading(false);
      
      // Log for debugging
      if (currentSession?.user) {
        console.log('Initial session check:', {
          email: currentSession.user.email,
          id: currentSession.user.id,
          isAdmin: !!userEmail && ADMIN_EMAILS.includes(userEmail)
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      // Check if error is specifically about email not being confirmed
      if (error && error.message.includes('Email not confirmed')) {
        return { error, isEmailConfirmed: false };
      }
      
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      return { user: data?.user ?? null, error };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    resendConfirmationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

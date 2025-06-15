
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/lib/types";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    const getSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          if (error) {
            console.error("Error fetching profile on initial load:", error);
            setProfile(null);
          } else {
            setProfile(profileData);
          }
        } catch (error) {
          console.error("Error fetching profile on initial load (catch):", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        // Defer profile fetch to avoid deadlocks
        setTimeout(() => {
          supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single()
            .then(({ data: profileData, error }) => {
              if (error) {
                console.error("Error fetching profile on auth change:", error);
                setProfile(null);
              } else {
                setProfile(profileData);
              }
            });
        }, 0);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    profile,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

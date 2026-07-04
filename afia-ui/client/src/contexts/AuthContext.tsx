import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, consent: boolean) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CONSENT_STORAGE_PREFIX = "afia:consent-pending:";

function consentStorageKey(email: string) {
  return `${CONSENT_STORAGE_PREFIX}${email.trim().toLowerCase()}`;
}

async function syncProfileConsent(user: User) {
  const email = user.email?.trim().toLowerCase();
  if (!email) return;

  const consentKey = consentStorageKey(email);
  const pendingConsent = localStorage.getItem(consentKey);

  const { data: existing, error: fetchError } = await supabase
    .from("profiles")
    .select("consent_given_at")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) {
    console.error("Failed to load profile:", fetchError.message);
    return;
  }

  const consentGivenAt =
    existing?.consent_given_at ??
    (pendingConsent ? new Date().toISOString() : null);

  const { error: upsertError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? email,
      consent_given_at: consentGivenAt,
    },
    { onConflict: "id" },
  );

  if (upsertError) {
    console.error("Failed to sync profile:", upsertError.message);
    return;
  }

  if (pendingConsent) {
    localStorage.removeItem(consentKey);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);

      if (nextSession?.user) {
        void syncProfileConsent(nextSession.user);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) {
      return { error: "Email is required." };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: window.location.origin,
      },
    });

    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, consent: boolean) => {
    const trimmed = email.trim();
    if (!trimmed) {
      return { error: "Email is required." };
    }
    if (!consent) {
      return { error: "You must accept the pilot consent statement." };
    }

    localStorage.setItem(consentStorageKey(trimmed), new Date().toISOString());

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      localStorage.removeItem(consentStorageKey(trimmed));
    }

    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signIn, signOut, signUp }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

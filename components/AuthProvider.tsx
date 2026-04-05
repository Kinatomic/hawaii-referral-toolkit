"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  demoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const DEMO_KEY = "pip_demo_mode";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // Check demo mode from localStorage
    if (typeof window !== "undefined" && localStorage.getItem(DEMO_KEY) === "1") {
      setDemoMode(true);
      setLoading(false);
      return;
    }

    if (!SUPABASE_CONFIGURED) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!SUPABASE_CONFIGURED) return { error: "Supabase not configured. Use Demo Mode." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    if (!SUPABASE_CONFIGURED) return { error: "Supabase not configured. Use Demo Mode." };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (demoMode) {
      localStorage.removeItem(DEMO_KEY);
      setDemoMode(false);
      return;
    }
    if (SUPABASE_CONFIGURED) await supabase.auth.signOut();
  };

  const enterDemoMode = () => {
    localStorage.setItem(DEMO_KEY, "1");
    setDemoMode(true);
  };

  const isAuthenticated = demoMode || !!user;

  return (
    <AuthContext.Provider value={{ user, session, loading, demoMode, signIn, signUp, signOut, enterDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function useIsAuthenticated() {
  const { user, demoMode, loading } = useAuth();
  return { isAuthenticated: demoMode || !!user, loading };
}

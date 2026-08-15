"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, clearAccessToken, refreshSession, setAccessToken, type AuthUser } from "@/lib/api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, firstName: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const authVersion = useRef(0);

  useEffect(() => {
    let active = true;
    const initialVersion = authVersion.current;
    refreshSession().then((session) => {
      if (!active || initialVersion !== authVersion.current) return;
      setUser(session?.user ?? null);
      setStatus(session ? "authenticated" : "unauthenticated");
    });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    user,
    async login(email, password) {
      authVersion.current += 1;
      try {
        const session = await api.auth.login({ email, password });
        setAccessToken(session.access_token);
        setUser(session.user);
        setStatus("authenticated");
        return session.user;
      } catch (error) {
        setStatus("unauthenticated");
        throw error;
      }
    },
    async register(email, password, firstName) {
      authVersion.current += 1;
      try {
        const session = await api.auth.register({ email, password, first_name: firstName });
        setAccessToken(session.access_token);
        setUser(session.user);
        setStatus("authenticated");
        return session.user;
      } catch (error) {
        setStatus("unauthenticated");
        throw error;
      }
    },
    async logout() {
      authVersion.current += 1;
      try {
        await api.auth.logout();
      } catch {
        // Clear local state even when the API is temporarily unavailable.
      } finally {
        clearAccessToken();
        setUser(null);
        setStatus("unauthenticated");
      }
    },
  }), [status, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, setAccessToken, setRefreshToken, clearTokens, refreshSession, type AuthUser } from "./api";

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
    const v = authVersion.current;
    refreshSession().then((session) => {
      if (!active || v !== authVersion.current) return;
      setUser(session?.user ?? null);
      setStatus(session ? "authenticated" : "unauthenticated");
    });
    return () => { active = false; };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    user,
    async login(email, password) {
      authVersion.current += 1;
      const session = await api.auth.login({ email, password });
      await setAccessToken(session.access_token);
      if (session.refresh_token) await setRefreshToken(session.refresh_token);
      setUser(session.user);
      setStatus("authenticated");
      return session.user;
    },
    async register(email, password, firstName) {
      authVersion.current += 1;
      const session = await api.auth.register({ email, password, first_name: firstName });
      await setAccessToken(session.access_token);
      if (session.refresh_token) await setRefreshToken(session.refresh_token);
      setUser(session.user);
      setStatus("authenticated");
      return session.user;
    },
    async logout() {
      authVersion.current += 1;
      try { await api.auth.logout(); } catch { /* clear local anyway */ }
      await clearTokens();
      setUser(null);
      setStatus("unauthenticated");
    },
  }), [status, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

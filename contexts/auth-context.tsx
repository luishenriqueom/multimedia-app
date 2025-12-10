"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { apiFetch, setToken } from "@/lib/api";

export interface User {
  id: number | string;
  email: string;
  username?: string;
  fullName?: string;
  avatar?: string;
  bio?: string | null;
  createdAt?: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // on mount, try to load current user if token exists
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        const me = await apiFetch("/users/me", { method: "GET" });
        if (!mounted) return;
        const normalized: User = {
          id: me.id,
          email: me.email,
          // prefer explicit username returned by API, fallback to full_name or email localpart
          username: me.username ?? me.full_name ?? me.email.split("@")[0],
          fullName: me.full_name ?? undefined,
          bio: me.bio ?? null,
          avatar: me.avatar_url ?? undefined,
          createdAt: me.created_at ? new Date(me.created_at) : undefined,
        };
        setUser(normalized);
      } catch (err) {
        // no token or invalid token — ignore
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // OAuth2PasswordRequestForm expects form-urlencoded data
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: params,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const token = data?.access_token;
      if (!token) throw new Error("No token received");
      setToken(token);
      // fetch user
      const me = await apiFetch("/users/me", { method: "GET" });
      const normalized: User = {
        id: me.id,
        email: me.email,
        username: me.username ?? me.full_name ?? me.email.split("@")[0],
        fullName: me.full_name ?? undefined,
        bio: me.bio ?? null,
        avatar: me.avatar_url ?? undefined,
        createdAt: me.created_at ? new Date(me.created_at) : undefined,
      };
      setUser(normalized);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (email: string, username: string, password: string) => {
      setIsLoading(true);
      try {
        // backend expects full_name field
        await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password, full_name: username }),
        });
        // after register, auto-login
        await login(email, password);
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // try to revoke session/token on the server; ignore errors
      try {
        await apiFetch("/auth/logout", { method: "POST" });
      } catch (err) {
        // ignore server-side errors — we'll still clear client-side state
      }

      // clear client-side token and user state
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

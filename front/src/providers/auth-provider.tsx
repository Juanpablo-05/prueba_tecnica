"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { api, setApiAccessToken } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import {
  clearStoredSession,
  getStoredAccessToken,
  getStoredProfile,
  getStoredRefreshToken,
  persistSession,
} from "@/lib/auth/session";
import type { AuthSessionResponse, UserProfile } from "@/types/auth";
import type { AdminCreateUserRequest } from "@/types/admin";

import type {
  AuthContextValue,
  AuthProviderProps,
  AuthStatus,
} from "@/types/ProviderAuthTypes";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const applySession = useCallback((session: AuthSessionResponse) => {
    persistSession(session);
    setApiAccessToken(session.accessToken);
    setAccessToken(session.accessToken);
    setRefreshToken(session.refreshToken);
    setUser(session.user);
    setStatus("authenticated");
  }, []);

  const clearSession = useCallback(() => {
    clearStoredSession();
    setApiAccessToken(null);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setStatus("anonymous");
  }, []);

  const refreshSession = useCallback(async (options?: { silent?: boolean }) => {
    const storedRefreshToken = getStoredRefreshToken();

    if (!storedRefreshToken) {
      clearSession();
      return false;
    }

    try {
      const refreshResponse = await api.post<AuthSessionResponse>("/auth/refresh", {
        refreshToken: storedRefreshToken,
      });

      applySession(refreshResponse.data);
      return true;
    } catch (error) {
      clearSession();
      if (!options?.silent) {
        toast.error(getApiErrorMessage(error, "No fue posible completar la autenticacion."));
      }
      return false;
    }
  }, [applySession, clearSession]);

  const hydrateSession = useCallback(async () => {
    const storedAccessToken = getStoredAccessToken();
    const storedRefreshToken = getStoredRefreshToken();
    const storedProfile = getStoredProfile();

    if (!storedAccessToken || !storedRefreshToken || !storedProfile) {
      clearSession();
      return;
    }

    setApiAccessToken(storedAccessToken);
    setAccessToken(storedAccessToken);
    setRefreshToken(storedRefreshToken);
    setUser(storedProfile);

    try {
      const profileResponse = await api.get<UserProfile>("/auth/profile");

      persistSession({
        accessToken: storedAccessToken,
        refreshToken: storedRefreshToken,
        user: profileResponse.data,
      });

      setUser(profileResponse.data);
      setStatus("authenticated");
    } catch {
      const refreshed = await refreshSession({ silent: true });

      if (!refreshed) {
        clearSession();
      }
    }
  }, [clearSession, refreshSession]);

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      try {
        const response = await api.post<AuthSessionResponse>(
          "/auth/login",
          credentials,
        );

        applySession(response.data);
        return response.data.user;
      } catch (error) {
        throw new Error(getApiErrorMessage(error, "No fue posible completar la autenticacion."));
      }
    },
    [applySession],
  );

  const logout = useCallback(() => {
    clearSession();
    toast.success("Sesion cerrada.");
  }, [clearSession]);

  const createAccountUser = useCallback(async (userData: AdminCreateUserRequest) => {
    const response = await api.post<AuthSessionResponse>("/admin/create/user", userData);
    return response.data.user;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      isAuthenticated: status === "authenticated",
      login,
      logout,
      refreshSession,
      createAccountUser,
      refreshToken,
      status,
      user,
    }),
    [accessToken, login, logout, refreshSession, createAccountUser, refreshToken, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

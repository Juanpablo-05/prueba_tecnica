import type { UserProfile } from "./auth";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

export type AuthContextValue = {
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<UserProfile>;
  logout: () => void;
  refreshSession: (options?: { silent?: boolean }) => Promise<boolean>;
  refreshToken: string | null;
  status: AuthStatus;
  user: UserProfile | null;
};

export type AuthProviderProps = {
  children: React.ReactNode;
};

import type { AuthSessionResponse, UserProfile } from "@/types/auth";

const ACCESS_TOKEN_KEY = "prescriptions.access-token";
const REFRESH_TOKEN_KEY = "prescriptions.refresh-token";
const PROFILE_KEY = "prescriptions.profile";

function readStorageItem(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(key);
}

function writeStorageItem(key: string, value: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, value);
}

function removeStorageItem(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(key);
}

export const sessionKeys = {
  accessToken: ACCESS_TOKEN_KEY,
  profile: PROFILE_KEY,
  refreshToken: REFRESH_TOKEN_KEY,
} as const;

export function getStoredAccessToken() {
  return readStorageItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken() {
  return readStorageItem(REFRESH_TOKEN_KEY);
}

export function getStoredProfile(): UserProfile | null {
  const rawProfile = readStorageItem(PROFILE_KEY);

  if (!rawProfile) {
    return null;
  }

  try {
    return JSON.parse(rawProfile) as UserProfile;
  } catch {
    removeStorageItem(PROFILE_KEY);
    return null;
  }
}

export function persistSession(session: AuthSessionResponse) {
  writeStorageItem(ACCESS_TOKEN_KEY, session.accessToken);
  writeStorageItem(REFRESH_TOKEN_KEY, session.refreshToken);
  writeStorageItem(PROFILE_KEY, JSON.stringify(session.user));
}

export function clearStoredSession() {
  removeStorageItem(ACCESS_TOKEN_KEY);
  removeStorageItem(REFRESH_TOKEN_KEY);
  removeStorageItem(PROFILE_KEY);
}

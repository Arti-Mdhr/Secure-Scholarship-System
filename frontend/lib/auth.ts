// Handles storing/reading auth tokens in the browser and pulling
// non-sensitive info (id, role) out of the access token for UI use.
// This does NOT verify the token — the backend is the source of truth
// for anything security-sensitive. It's only used to decide what to
// show in the UI (e.g. "show admin sidebar link").

const ACCESS_TOKEN_KEY = "ssas_access_token";
const REFRESH_TOKEN_KEY = "ssas_refresh_token";

export interface AccessTokenPayload {
  sub: string;
  role: "student" | "admin";
  exp: number;
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function decodeAccessToken(
  token: string | null
): AccessTokenPayload | null {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: AccessTokenPayload | null): boolean {
  if (!payload) return true;
  return payload.exp * 1000 < Date.now();
}

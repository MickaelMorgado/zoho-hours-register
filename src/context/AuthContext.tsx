"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { zohoFetch } from "@/lib/zohoFetch";

// --- Types ---

export type AuthStatus = "loading" | "disconnected" | "connected" | "expired";

export interface ZohoTokens {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
}

export interface ZohoCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  portalId: string;
  portalName: string;
  /** The portal URL slug used in Zoho web URLs, e.g. "dengun#zp" */
  portalSlug: string;
  /** The user's display name as it appears in Zoho (used for self-assigned task matching) */
  displayName: string;
}

interface AuthContextType {
  status: AuthStatus;
  tokens: ZohoTokens | null;
  credentials: ZohoCredentials | null;
  /** True while a connection test or refresh is in flight */
  checking: boolean;
  /** Human-readable error from last test/refresh */
  error: string | null;
  /** Re-read localStorage and re-test the connection */
  recheck: () => Promise<void>;
  /** Update tokens in state + localStorage */
  setTokens: (tokens: ZohoTokens | null) => void;
  /** Update credentials in state + localStorage */
  setCredentials: (credentials: ZohoCredentials) => void;
  /** Clear all auth data */
  disconnect: () => void;
  /** True when credentials (clientId, clientSecret, portalId) are filled */
  hasCredentials: boolean;
  /** True when tokens (access_token, refresh_token) exist */
  hasTokens: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Helpers ---

function readTokens(): ZohoTokens | null {
  try {
    const raw = localStorage.getItem("zoho_tokens");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.access_token && parsed?.refresh_token) return parsed;
    return null;
  } catch {
    return null;
  }
}

function readCredentials(): ZohoCredentials | null {
  try {
    const raw = localStorage.getItem("zoho_credentials");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Restore displayName from dedicated key if missing in credentials
    if (!parsed.displayName) {
      const savedName = localStorage.getItem("zoho_display_name");
      if (savedName) parsed.displayName = savedName;
    }
    return parsed;
  } catch {
    return null;
  }
}

function credentialsComplete(c: ZohoCredentials | null): boolean {
  return !!(c?.clientId?.trim() && c?.clientSecret?.trim() && c?.portalId?.trim());
}

// --- Provider ---

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [tokens, setTokensState] = useState<ZohoTokens | null>(null);
  const [credentials, setCredentialsState] = useState<ZohoCredentials | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist helpers
  const setTokens = useCallback((t: ZohoTokens | null) => {
    if (t) {
      localStorage.setItem("zoho_tokens", JSON.stringify(t));
    } else {
      localStorage.removeItem("zoho_tokens");
    }
    setTokensState(t);
  }, []);

  const setCredentials = useCallback((c: ZohoCredentials) => {
    localStorage.setItem("zoho_credentials", JSON.stringify(c));
    // Persist displayName separately so it survives credential resets / disconnect
    if (c.displayName) {
      localStorage.setItem("zoho_display_name", c.displayName);
    }
    setCredentialsState(c);
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem("zoho_tokens");
    localStorage.removeItem("zoho_credentials");
    setTokensState(null);
    setCredentialsState(null);
    setStatus("disconnected");
    setError(null);
  }, []);

  // Test the connection by making a lightweight API call
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const response = await zohoFetch("/api/zoho/projects");
      if (response.ok) return true;
      if (response.status === 401) return false;
      // Other errors (500, network) — treat as connected but errored
      // so we don't nag the user to re-auth for server issues
      return false;
    } catch {
      return false;
    }
  }, []);

  // Full recheck: read localStorage, test connection, update status
  const recheck = useCallback(async () => {
    setChecking(true);
    setError(null);

    const t = readTokens();
    const c = readCredentials();
    setTokensState(t);
    setCredentialsState(c);

    // No credentials at all → disconnected
    if (!credentialsComplete(c)) {
      setStatus("disconnected");
      setChecking(false);
      return;
    }

    // Credentials but no tokens → disconnected (need token exchange)
    if (!t) {
      setStatus("disconnected");
      setChecking(false);
      return;
    }

    // Both present → test connection
    const ok = await testConnection();
    if (ok) {
      setStatus("connected");
      // Re-read tokens in case zohoFetch auto-refreshed them
      setTokensState(readTokens());
    } else {
      setStatus("expired");
      setError("Connection failed. The refresh token may be invalid — try re-authenticating in Settings.");
      // Re-read tokens in case refresh partially succeeded
      setTokensState(readTokens());
    }

    setChecking(false);
  }, [testConnection]);

  // Listen for token-refreshed events from zohoFetch
  useEffect(() => {
    const handler = () => {
      setTokensState(readTokens());
      setStatus("connected");
      setError(null);
    };
    window.addEventListener("zoho-token-refreshed", handler);
    return () => window.removeEventListener("zoho-token-refreshed", handler);
  }, []);

  // Initial check on mount
  useEffect(() => {
    recheck();
  }, [recheck]);

  const hasCredentials = credentialsComplete(credentials);
  const hasTokens = !!(tokens?.access_token && tokens?.refresh_token);

  return (
    <AuthContext.Provider
      value={{
        status,
        tokens,
        credentials,
        checking,
        error,
        recheck,
        setTokens,
        setCredentials,
        disconnect,
        hasCredentials,
        hasTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

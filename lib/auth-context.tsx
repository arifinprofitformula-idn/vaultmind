"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type AuthUser = { id: string; email: string };

type AuthContextType = {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

type LoginResponse = {
  accessToken: string;
  user?: AuthUser;
};

const AuthContext = createContext<AuthContextType | null>(null);
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

function decodeTokenPayload(token: string): { sub: string; email: string } {
  const payload = token.split(".")[1];

  if (!payload) {
    throw new Error("Token tidak valid.");
  }

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64)) as { sub: string; email: string };
}

function userFromResponse(data: LoginResponse): AuthUser {
  if (data.user) {
    return data.user;
  }

  const payload = decodeTokenPayload(data.accessToken);
  return { id: payload.sub, email: payload.email };
}

function isLoginResponse(value: unknown): value is LoginResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "accessToken" in value &&
    typeof value.accessToken === "string" &&
    (!("user" in value) ||
      value.user === undefined ||
      (typeof value.user === "object" &&
        value.user !== null &&
        "id" in value.user &&
        "email" in value.user &&
        typeof value.user.id === "string" &&
        typeof value.user.email === "string"))
  );
}

function errorMessageFromResponse(value: unknown): string {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }

  return "Terjadi kesalahan server.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);

  const clearRefreshInterval = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  const clearAuthState = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  const applySession = useCallback((data: LoginResponse) => {
    setAccessToken(data.accessToken);
    setUser(userFromResponse(data));
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const refreshPromise = (async () => {
      const response = await fetch("/api/auth/refresh", { method: "POST" });

      if (!response.ok) {
        clearAuthState();
        return false;
      }

      const data: unknown = await response.json();

      if (!isLoginResponse(data)) {
        clearAuthState();
        return false;
      }

      applySession(data);
      return true;
    })()
      .catch(() => {
        clearAuthState();
        return false;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    refreshPromiseRef.current = refreshPromise;
    return refreshPromise;
  }, [applySession, clearAuthState]);

  const startRefreshInterval = useCallback(() => {
    clearRefreshInterval();
    refreshIntervalRef.current = setInterval(() => {
      void refreshSession();
    }, REFRESH_INTERVAL_MS);
  }, [clearRefreshInterval, refreshSession]);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const restored = await refreshSession();

      if (!active) {
        return;
      }

      if (restored) {
        startRefreshInterval();
      }

      setIsLoading(false);
    }

    restoreSession();

    return () => {
      active = false;
      clearRefreshInterval();
    };
  }, [clearRefreshInterval, refreshSession, startRefreshInterval]);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error(errorMessageFromResponse(data));
      }

      if (!isLoginResponse(data)) {
        throw new Error("Response login tidak valid.");
      }

      applySession(data);
      startRefreshInterval();
    },
    [applySession, startRefreshInterval],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      clearAuthState();
      clearRefreshInterval();
    }
  }, [clearAuthState, clearRefreshInterval]);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}

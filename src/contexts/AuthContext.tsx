import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const VALID_EMAIL = "test@lender.com";
const VALID_PASSWORD = "Password123";
const FAKE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("dg_token")
  );

  const isAuthenticated = !!token;
  const user = isAuthenticated ? { name: "Test User", email: VALID_EMAIL } : null;

  const login = useCallback((email: string, password: string) => {
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      localStorage.setItem("dg_token", FAKE_JWT);
      setToken(FAKE_JWT);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("dg_token");
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

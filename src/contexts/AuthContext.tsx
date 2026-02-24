import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type UserRole = "Super Admin" | "Admin" | "User";

interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const VALID_EMAIL = "test@lender.com";
const VALID_PASSWORD = "Password123";
const FAKE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("dg_token")
  );
  const [role, setRoleState] = useState<UserRole>(
    () => (localStorage.getItem("dg_role") as UserRole) || "Super Admin"
  );

  const isAuthenticated = !!token;
  const user: AuthUser | null = isAuthenticated
    ? { name: "Test User", email: VALID_EMAIL, role }
    : null;

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

  const setRole = useCallback((r: UserRole) => {
    localStorage.setItem("dg_role", r);
    setRoleState(r);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

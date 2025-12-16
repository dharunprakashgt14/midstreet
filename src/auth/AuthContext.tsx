import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode
} from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const AUTH_KEY = "midstreet_admin_session";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "midstreet123";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return window.sessionStorage.getItem(AUTH_KEY) === "true";
  });

  const login = (username: string, password: string) => {
    const ok = username === DEMO_USERNAME && password === DEMO_PASSWORD;
    if (ok) {
      window.sessionStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
    }
    return ok;
  };

  const logout = () => {
    window.sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      login,
      logout
    }),
    [isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

export const RequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};



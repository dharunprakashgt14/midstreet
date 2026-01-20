import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode
} from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { adminAPI } from "../utils/api";

const AUTH_KEY = "midstreet_admin_session";
const TOKEN_KEY = "midstreet_admin_token";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check if token exists in sessionStorage
    return !!window.sessionStorage.getItem(TOKEN_KEY);
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Call backend login API
      await adminAPI.login(username, password);
      
      // If successful, token is stored by adminAPI.login
      setIsAuthenticated(true);
      window.sessionStorage.setItem(AUTH_KEY, "true");
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setIsAuthenticated(false);
      return false;
    }
  };

  const logout = () => {
    window.sessionStorage.removeItem(AUTH_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);
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



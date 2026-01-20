import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AdminLayout } from "../components/AdminLayout";

/**
 * AdminLogin component for admin authentication.
 * 
 * TODO: Authentication will be integrated with backend API when available.
 */
export const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const ok = await login(username.trim(), password);
    if (!ok) {
      setError("Invalid credentials.");
      return;
    }
    const redirectTo =
      (location.state as { from?: { pathname?: string } })?.from?.pathname ??
      "/admin";
    navigate(redirectTo, { replace: true });
  };

  return (
    <AdminLayout>
      <div className="ms-admin-container">
        <section className="ms-panel">
          <header className="ms-panel-header">
            <h1 className="ms-panel-title">Admin login</h1>
            <p className="ms-panel-subtitle">Restricted area — MID STREET team only.</p>
          </header>
          <form className="ms-login-form" onSubmit={handleSubmit}>
            <label className="ms-login-field">
              <span>Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
            <label className="ms-login-field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error && <div className="ms-login-error">{error}</div>}
            <button type="submit" className="ms-primary-cta">
              Login
            </button>
          </form>
        </section>
      </div>
    </AdminLayout>
  );
};


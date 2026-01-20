import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="ms-root">
      {/* Sidebar */}
      <aside className="ms-sidebar">
        <div className="ms-sidebar-section">
          <h3 className="ms-sidebar-title">Admin Panel</h3>
          <p className="ms-sidebar-text">Restaurant control center</p>
        </div>

        <div className="ms-sidebar-section">
          <button
            className="ms-sidebar-link"
            onClick={() => navigate("/admin")}
          >
            Dashboard
          </button>

          <button
            className="ms-sidebar-link"
            onClick={() => navigate("/admin/stocks")}
          >
            Stocks
          </button>

          <button
            className="ms-sidebar-link"
            onClick={() => navigate("/admin/summary")}
          >
            Daily Summary
          </button>

          {isAuthenticated && (
            <button
              className="ms-sidebar-link"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="ms-main">
        <section className="ms-panel">
          {children}
        </section>
      </main>

      {/* Base layout styles */}
      <style>{`
        .ms-root {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: #FAF7F2;
        }

        /* Sidebar */
        .ms-sidebar {
          width: 240px;
          min-width: 240px;
          background: #FAF7F2;
          border-right: 1px solid #E8DDD0;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .ms-sidebar-section {
          padding: 16px;
        }

        .ms-sidebar-title {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 4px;
          color: #3B2F2F;
        }

        .ms-sidebar-text {
          font-size: 12px;
          opacity: 0.6;
          margin: 0;
        }

        .ms-sidebar-link {
          display: block;
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: #3B2F2F;
          transition: background 0.2s ease;
        }

        .ms-sidebar-link:hover {
          background: #EFE7DC;
        }

        /* Main area */
        .ms-main {
          flex: 1;
          padding: 24px;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .ms-panel {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        /* Tablet */
        @media (max-width: 1023px) {
          .ms-sidebar {
            width: 200px;
            min-width: 200px;
          }

          .ms-main {
            padding: 20px;
          }
        }

        /* Mobile */
        @media (max-width: 767px) {
          .ms-root {
            flex-direction: column;
          }

          .ms-sidebar {
            width: 100%;
            min-width: 0;
            flex-direction: row;
            border-right: none;
            border-bottom: 1px solid #E8DDD0;
            overflow-x: auto;
          }

          .ms-sidebar-section {
            display: flex;
            gap: 8px;
            align-items: center;
            padding: 12px;
          }

          .ms-sidebar-title,
          .ms-sidebar-text {
            display: none;
          }

          .ms-sidebar-link {
            white-space: nowrap;
            font-size: 12px;
            padding: 8px 12px;
          }

          .ms-main {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

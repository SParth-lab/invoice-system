import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="sidebar fade-in">
      {/* Top Logo */}
      <Link to="/" className="sidebar-logo">
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            color: "#fff",
            fontWeight: 800,
          }}
        >
          G
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.1 }}>
            GST Invoice
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Workspace Suite</div>
        </div>
      </Link>

      {/* Main Nav */}
      <nav className="sidebar-nav">
        <Link to="/dashboard" className={`sidebar-link ${pathname === "/dashboard" || pathname === "/" ? "active" : ""}`}>
          <span style={{ fontSize: 18 }}>📊</span> Dashboard
        </Link>
        <Link to="/companies" className={`sidebar-link ${pathname === "/companies" ? "active" : ""}`}>
          <span style={{ fontSize: 18 }}>🏢</span> Companies
        </Link>
        <Link to="/profile" className={`sidebar-link ${pathname === "/profile" ? "active" : ""}`}>
          <span style={{ fontSize: 18 }}>👤</span> My Profile
        </Link>
        <Link to="/invoice/new" className={`sidebar-link ${pathname.includes("/invoice") ? "active" : ""}`} style={{ marginTop: 16, background: pathname.includes("/invoice") ? "var(--accent)" : "var(--accent-pale)", color: "#fff", fontWeight: 700 }}>
          <span style={{ fontSize: 18 }}>➕</span> Create Invoice
        </Link>
      </nav>

      {/* Footer / User Profile */}
      {user && (
        <div className="sidebar-footer">
          <Link to="/profile" className="sidebar-profile">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, var(--accent), var(--accent-pale))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0
              }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {user.email}
              </div>
            </div>
            <button 
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                logout(); 
                navigate("/login");
              }} 
              title="Logout"
              style={{
                background: "var(--accent-red-bg)",
                border: "1px solid #fca5a5",
                borderRadius: 6,
                fontSize: 12,
                cursor: "pointer",
                padding: "6px 8px",
                color: "var(--accent-red)",
                fontWeight: 600
              }}
            >
              Exit
            </button>
          </Link>
        </div>
      )}
    </aside>
  );
}

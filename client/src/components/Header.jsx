import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        background: "var(--bg-header)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            color: "#fff",
            fontWeight: 800,
          }}
        >
          G
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
            GST Invoice
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: -2 }}>Manage invoices</div>
        </div>
      </Link>

      <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <Link
          to="/"
          className="btn btn-ghost"
          style={{
            color: pathname === "/" ? "var(--accent)" : undefined,
            background: pathname === "/" ? "var(--accent-bg)" : undefined,
            fontWeight: pathname === "/" ? 600 : 500,
          }}
        >
          📊 Dashboard
        </Link>
        <Link to="/invoice/new" className="btn btn-primary btn-sm">
          + New Invoice
        </Link>

        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginLeft: 12,
              paddingLeft: 16,
              borderLeft: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, var(--accent), var(--accent-pale))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{user.email}</div>
            </div>
            <button
              onClick={logout}
              className="btn btn-ghost btn-sm"
              style={{ color: "var(--accent-red)", marginLeft: 4, fontSize: 11 }}
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

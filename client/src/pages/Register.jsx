import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) return setError("All fields are required");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #ecfdf5 100%)",
        padding: 20,
      }}
    >
      <div
        className="slide-up"
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--bg-white)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: 40,
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              color: "#fff",
              fontWeight: 800,
              marginBottom: 16,
            }}
          >
            G
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Create account</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Start managing your GST invoices</p>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "var(--accent-red-bg)",
              border: "1px solid #fca5a5",
              borderRadius: "var(--radius-sm)",
              color: "var(--accent-red)",
              fontSize: 13,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label className="label-field">Full Name</label>
            <input className="input-field" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label-field">Email</label>
            <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label-field">Password</label>
            <input className="input-field" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="label-field">Confirm Password</label>
            <input className="input-field" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: 12, fontSize: 14, justifyContent: "center", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}

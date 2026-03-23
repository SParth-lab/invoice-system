import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put("/auth/profile", { name, email });
      showToast("Profile updated successfully! Refreshing to apply changes...");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return showToast("New passwords do not match", "error");
    }
    if (newPassword.length < 6) {
      return showToast("Password must be at least 6 characters", "error");
    }
    setSavingPassword(true);
    try {
      await api.put("/auth/password", { currentPassword, newPassword });
      showToast("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update password", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-body)", padding: "24px" }}>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.type === "success" ? "✓ " : "⚠ "}{toast.msg}</div>}
      
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 24px 0" }}>User Profile</h1>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Profile Details */}
          <div className="card fade-in">
            <div className="section-title"><span className="icon">👤</span> Profile Details</div>
            <form onSubmit={handleProfileSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label className="label-field">Full Name</label>
                <input 
                  className="input-field" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label className="label-field">Email Address</label>
                <input 
                  type="email"
                  className="input-field" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={savingProfile}
                style={{ opacity: savingProfile ? 0.6 : 1 }}
              >
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="card fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="section-title"><span className="icon">🔒</span> Change Password</div>
            <form onSubmit={handlePasswordSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label className="label-field">Current Password</label>
                <div style={{ position: "relative" }}>
                  <input 
                    type={showCurrent ? "text" : "password"}
                    className="input-field" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    required 
                    style={{ paddingRight: 50 }}
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{showCurrent ? "Hide" : "Show"}</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                <div>
                  <label className="label-field">New Password</label>
                  <div style={{ position: "relative" }}>
                    <input 
                      type={showNew ? "text" : "password"}
                      className="input-field" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      required 
                      minLength={6}
                      style={{ paddingRight: 50 }}
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{showNew ? "Hide" : "Show"}</button>
                  </div>
                </div>
                <div>
                  <label className="label-field">Confirm New Password</label>
                  <div style={{ position: "relative" }}>
                    <input 
                      type={showConfirm ? "text" : "password"}
                      className="input-field" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                      style={{ paddingRight: 50 }}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{showConfirm ? "Hide" : "Show"}</button>
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                className="btn btn-outline"
                disabled={savingPassword}
                style={{ opacity: savingPassword ? 0.6 : 1, color: "var(--accent)" }}
              >
                {savingPassword ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

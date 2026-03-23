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
    <div className="max-w-2xl mx-auto animate-fade-in relative pb-12">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border text-sm font-bold flex items-center gap-2 animate-fade-in ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          <span>{toast.type === "success" ? "✓" : "⚠"}</span>
          {toast.msg}
        </div>
      )}
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account settings and credentials.</p>
      </div>
      
      <div className="flex flex-col gap-6">
        {/* Profile Details */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <span className="text-xl">👤</span>
            <h2 className="text-[15px] font-bold text-slate-800">Profile Details</h2>
          </div>
          <div className="p-6 md:p-8">
            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-sm font-semibold text-slate-900 transition-all outline-none" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="mb-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-sm font-semibold text-slate-900 transition-all outline-none" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className={`px-7 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${savingProfile ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : "✓"}
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up" style={{animationDelay: "0.1s"}}>
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <span className="text-xl">🔒</span>
            <h2 className="text-[15px] font-bold text-slate-800">Change Password</h2>
          </div>
          <div className="p-6 md:p-8">
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-6">
              <div className="max-w-md">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
                <div className="relative">
                  <input 
                    type={showCurrent ? "text" : "password"}
                    className="w-full pl-5 pr-16 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-sm font-mono tracking-wider text-slate-900 transition-all outline-none placeholder:font-sans placeholder:tracking-normal" 
                    placeholder="••••••••"
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrent(!showCurrent)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold uppercase rounded-md transition-colors"
                  >
                    {showCurrent ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNew ? "text" : "password"}
                      className="w-full pl-5 pr-16 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-sm font-mono tracking-wider text-slate-900 transition-all outline-none placeholder:font-sans placeholder:tracking-normal" 
                      placeholder="••••••••"
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      required 
                      minLength={6}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNew(!showNew)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold uppercase rounded-md transition-colors"
                    >
                      {showNew ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirm ? "text" : "password"}
                      className="w-full pl-5 pr-16 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-sm font-mono tracking-wider text-slate-900 transition-all outline-none placeholder:font-sans placeholder:tracking-normal" 
                      placeholder="••••••••"
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirm(!showConfirm)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold uppercase rounded-md transition-colors"
                    >
                      {showConfirm ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button 
                  type="submit" 
                  className={`px-6 py-2.5 bg-white border-2 border-primary-100 text-primary-600 hover:bg-primary-50 hover:border-primary-200 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${savingPassword ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                  disabled={savingPassword}
                >
                  {savingPassword ? (
                    <div className="w-4 h-4 rounded-full border-2 border-primary-600/30 border-t-primary-600 animate-spin" />
                  ) : "🔒"}
                  {savingPassword ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

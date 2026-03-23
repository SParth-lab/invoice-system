import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Email and password are required");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-8 sm:p-10 relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 mx-auto flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary-500/30 mb-5">
            G
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Welcome back</h1>
          <p className="text-sm font-medium text-slate-500">Sign in to manage your invoices</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-700 flex items-center justify-center gap-2 animate-fade-in shadow-sm">
            <span className="text-lg">⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-sm font-medium text-slate-900 transition-all outline-none" 
              type="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              autoFocus 
            />
          </div>
          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
            </div>
            <div className="relative">
              <input 
                className="w-full pl-5 pr-16 py-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-sm font-mono tracking-wider text-slate-900 transition-all outline-none placeholder:font-sans placeholder:tracking-normal" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold uppercase rounded-lg transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className={`w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-[15px] font-bold transition-all shadow-md flex items-center justify-center gap-2 mt-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-95 hover:shadow-lg hover:shadow-primary-600/25'}`}
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : null}
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-slate-500 pb-2">
          Don't have an account?{" "}
          <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

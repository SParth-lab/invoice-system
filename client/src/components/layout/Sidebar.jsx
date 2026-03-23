import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-[280px] md:w-[260px] bg-white border-r border-slate-200 shadow-[2px_0_8px_rgba(0,0,0,0.02)] flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Logo Header */}
        <div className="flex items-center justify-between px-6 h-[64px] md:h-[72px] border-b border-slate-100 hover:bg-slate-50 transition-colors shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shadow-sm shadow-primary-500/20 text-white font-bold text-base">
              G
            </div>
            <div>
              <div className="font-bold text-slate-900 text-[15px] tracking-tight leading-tight">GST Invoice</div>
              <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">Workspace Suite</div>
            </div>
          </Link>
          <button 
            className="md:hidden p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            onClick={() => setIsMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5 flex flex-col overflow-y-auto scrollbar-thin">
          <Link 
            to="/dashboard" 
            className={`group flex items-center gap-3 px-4 py-3 md:py-2.5 rounded-xl text-[14px] md:text-[14px] font-semibold md:font-medium transition-all duration-200 ${pathname === "/dashboard" || pathname === "/" ? "bg-primary-50 text-primary-700 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            <span className={`text-[20px] md:text-[18px] transition-transform duration-200 ${pathname === "/dashboard" || pathname === "/" ? "scale-110" : "group-hover:scale-110 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100"}`}>📊</span> Dashboard
          </Link>
          <Link 
            to="/companies" 
            className={`group flex items-center gap-3 px-4 py-3 md:py-2.5 rounded-xl text-[14px] md:text-[14px] font-semibold md:font-medium transition-all duration-200 ${pathname === "/companies" ? "bg-primary-50 text-primary-700 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            <span className={`text-[20px] md:text-[18px] transition-transform duration-200 ${pathname === "/companies" ? "scale-110" : "group-hover:scale-110 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100"}`}>🏢</span> Companies
          </Link>
          <Link 
            to="/profile" 
            className={`group flex items-center gap-3 px-4 py-3 md:py-2.5 rounded-xl text-[14px] md:text-[14px] font-semibold md:font-medium transition-all duration-200 ${pathname === "/profile" ? "bg-primary-50 text-primary-700 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            <span className={`text-[20px] md:text-[18px] transition-transform duration-200 ${pathname === "/profile" ? "scale-110" : "group-hover:scale-110 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100"}`}>👤</span> My Profile
          </Link>
          
          <div className="pt-6 mt-4 border-t border-slate-100">
            <Link 
              to="/invoice/new" 
              className={`flex items-center justify-center gap-2 w-full px-4 py-3.5 md:py-3 rounded-xl text-[15px] md:text-[14px] font-bold md:font-semibold transition-all duration-200 shadow-sm active:scale-95 ${pathname.includes("/invoice/new") ? "bg-primary-700 text-white shadow-md shadow-primary-700/20" : "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md hover:shadow-primary-600/20"}`}
            >
              <span className="text-lg">➕</span> Create Invoice
            </Link>
          </div>
        </nav>

        {user && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
            <div className="flex items-center gap-4 md:gap-3 p-3 md:p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow transition-shadow">
              <div className="w-11 h-11 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold text-[16px] md:text-[15px] shrink-0 shadow-inner">
                {String(user.name?.charAt(0) || "U").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] md:text-[14px] font-bold md:font-semibold text-slate-900 truncate tracking-tight">{user.name}</div>
                <div className="text-[13px] md:text-[12px] text-slate-500 truncate font-medium">{user.email}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2.5 md:p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

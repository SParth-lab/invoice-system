import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const getPageTitle = () => {
    if (pathname === "/" || pathname === "/dashboard") return "Dashboard Overview";
    if (pathname === "/companies") return "Manage Companies";
    if (pathname === "/profile") return "My Profile";
    if (pathname.includes("/invoice/new")) return "Create New Invoice";
    if (pathname.includes("/invoice/") && pathname.includes("/edit")) return "Edit Invoice";
    return "Dashboard";
  };

  return (
    <header className="h-[64px] md:h-[72px] w-full flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-all">
      <div className="flex items-center gap-3 md:gap-4">
        <button 
          className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          onClick={onMenuClick}
          aria-label="Open Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <h1 className="text-xl md:text-[22px] font-bold text-slate-900 tracking-tight truncate max-w-[200px] sm:max-w-none">
          {getPageTitle()}
        </h1>
      </div>
      
      <div className="flex items-center gap-3 md:gap-5">
        <div className="relative hidden lg:block group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input 
            type="text" 
            placeholder="Search... (⌘K)" 
            className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-slate-100/70 border border-transparent focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-[14px] font-medium text-slate-900 placeholder-slate-400 transition-all outline-none hidden md:block"
          />
        </div>
        
        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
        
        <button className="relative p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
      </div>
    </header>
  );
}

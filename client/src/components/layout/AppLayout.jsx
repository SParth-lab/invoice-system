import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";

export default function AppLayout({ children }) {
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-slate-50 flex flex-col">{children}</div>;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <Sidebar isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen} />
      <div className="flex flex-col flex-1 w-full overflow-hidden relative">
        {/* <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} /> */}
        <main className="flex-1 w-full overflow-y-auto bg-slate-50/50 p-4 sm:p-6 md:p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto pb-12 md:pb-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

import { useState, useContext, useRef, useEffect } from 'react';
import { Search, Bell, History } from 'lucide-react';
import streamboatIcon from '../assets/streamboat.svg';
import { AuthContext } from './../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopBar({ showLinks = false }) {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-20 w-full flex items-center justify-between px-8 bg-transparent">
      <div className="flex items-center gap-8">
        {/* Mobile/Alternative Logo if needed, or always visible depending on layout */}
        <div className="flex items-center gap-2">
           <img src={streamboatIcon} alt="Logo" className="w-6 h-6 hidden md:block lg:hidden" />
           <span className="font-bold text-xl tracking-tight">Streamboat</span>
        </div>

        {showLinks ? (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#" className="text-sb-primary border-b-2 border-sb-primary pb-1">Browse</a>
            <a href="#" className="text-sb-text-muted hover:text-sb-text transition-colors pb-1 border-b-2 border-transparent">Featured</a>
            <a href="#" className="text-sb-text-muted hover:text-sb-text transition-colors pb-1 border-b-2 border-transparent">Security</a>
          </nav>
        ) : (
          <div className="relative w-64 md:w-96 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sb-text-muted" />
            <input 
              type="text" 
              placeholder="Search secure vault..." 
              className="w-full bg-sb-surface border border-sb-border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-sb-primary transition-colors text-sb-text placeholder:text-sb-text-muted"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        <button className="text-sb-text-muted hover:text-sb-text transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="text-sb-text-muted hover:text-sb-text transition-colors">
          <History className="w-5 h-5" />
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 rounded-full overflow-hidden border border-sb-border cursor-pointer hover:border-sb-primary transition-colors"
          >
            <img 
              src={user?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100"} 
              alt="Profile" 
              className="w-full h-full object-cover" 
            />
          </div>
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-48 bg-sb-surface border border-sb-border rounded-xl shadow-2xl overflow-hidden z-50 py-1"
              >
                <div className="px-4 py-3 border-b border-sb-border mb-1">
                   <div className="text-sm font-bold text-white truncate">{user?.firstName} {user?.lastName}</div>
                   <div className="text-xs text-sb-text-muted truncate">{user?.email}</div>
                </div>
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#0A0A0A] hover:text-red-400 transition-colors font-bold cursor-pointer"
                >
                  Log out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

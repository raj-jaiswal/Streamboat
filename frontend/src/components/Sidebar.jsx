import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Library, 
  UploadCloud, 
  ShieldCheck, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import streamboatIcon from '../assets/streamboat.svg';

const navItems = [
  { icon: Play, label: 'Stream', path: '/stream' },
  { icon: Library, label: 'Library', path: '/library' },
  { icon: UploadCloud, label: 'Upload', path: '/upload' },
  { icon: ShieldCheck, label: 'Secure Vault', path: '/claim' },
];

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn(
        "h-screen bg-sb-surface border-r border-sb-border flex flex-col transition-all duration-300 ease-in-out fixed top-0 left-0 z-50",
        isHovered ? "w-64" : "w-20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-transparent shrink-0 mt-4">
        <img src={streamboatIcon} alt="Logo" className="w-8 h-8 shrink-0" />
        <div
          className={cn(
            "ml-3 font-bold text-lg tracking-tight transition-opacity duration-300 overflow-hidden whitespace-nowrap",
            isHovered ? "opacity-100" : "opacity-0 w-0"
          )}
        >
          Streamboat
        </div>
      </div>

      <div className={cn("px-6 mt-1 mb-8 overflow-hidden whitespace-nowrap text-[10px] text-sb-text-muted uppercase tracking-wider font-semibold transition-opacity duration-300", isHovered ? "opacity-100" : "opacity-0 h-0")}>
        Premium Secure Access
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center px-2 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-sb-surface-hover text-sb-primary" 
                  : "text-sb-text-muted hover:bg-sb-surface-hover hover:text-sb-text"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sb-primary rounded-r-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn("w-5 h-5 shrink-0 ml-1", isActive ? "text-sb-primary" : "text-sb-text-muted group-hover:text-sb-text")} />
                <span
                  className={cn(
                    "ml-4 font-medium text-sm transition-all duration-300 whitespace-nowrap overflow-hidden",
                    isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0"
                  )}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Area */}
      <div className="p-4 mt-auto space-y-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center px-2 py-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-sb-surface-hover text-sb-primary" 
                : "text-sb-text-muted hover:bg-sb-surface-hover hover:text-sb-text"
            )
          }
        >
          <Settings className="w-5 h-5 shrink-0 ml-1" />
          <span
            className={cn(
              "ml-4 font-medium text-sm transition-all duration-300 whitespace-nowrap overflow-hidden",
              isHovered ? "opacity-100" : "opacity-0 w-0"
            )}
          >
            Settings
          </span>
        </NavLink>

        <div className={cn("transition-all duration-300 overflow-hidden", isHovered ? "opacity-100 h-10" : "opacity-0 h-0")}>
          <button className="w-full bg-gradient-to-r from-sb-primary to-[#00f2fe] text-black font-semibold text-sm py-2 rounded-xl hover:opacity-90 transition-opacity">
            Upgrade to Pro
          </button>
        </div>

        <div className="flex items-center p-2 rounded-xl bg-sb-surface-hover/50 border border-sb-border/50">
          <div className="w-8 h-8 rounded-full bg-sb-border shrink-0 flex items-center justify-center overflow-hidden">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div
            className={cn(
              "ml-3 flex flex-col transition-all duration-300 whitespace-nowrap overflow-hidden",
              isHovered ? "opacity-100" : "opacity-0 w-0"
            )}
          >
            <span className="text-xs font-semibold">Sentinel 01</span>
            <span className="text-[10px] text-sb-primary">Active Link</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

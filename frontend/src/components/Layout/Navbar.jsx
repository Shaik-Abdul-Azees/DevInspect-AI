// frontend/src/components/Layout/Navbar.jsx

import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useStore from '../../store/useStore';

export default function Navbar() {
  const { theme, toggleTheme, isAuthenticated, user, logout, sidebarOpen, toggleSidebar } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="glass-panel rounded-2xl z-40 border border-brand-border/15 py-3 px-6 flex justify-between items-center transition-all shadow-xl">
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar Icon (only visible on dashboard/history when authenticated) */}
        {isAuthenticated && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-brand-text-muted hover:text-brand-text hover:bg-brand-primary-glow border border-transparent hover:border-brand-primary/10 transition-all cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d={sidebarOpen ? "M4 6h16M4 12h10M4 18h16" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
        )}

        <Link to="/" className="flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white shadow-lg shadow-brand-primary/20">
            D
          </div>
          <span className="font-black text-lg tracking-tight bg-gradient-to-r from-brand-text via-brand-text to-brand-text-muted bg-clip-text text-transparent">
            DevInspect <span className="text-brand-secondary">AI</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-brand-text-muted hover:text-brand-primary hover:bg-brand-primary-glow border border-transparent hover:border-brand-primary/10 transition-all cursor-pointer relative"
          aria-label="Toggle Theme"
        >
          <motion.div
            key={theme}
            initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-center"
          >
            {theme === 'dark' ? (
              // Sun Icon
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.364 17.364l-.707.707m12.728 0l-.707-.707M6.364 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            ) : (
              // Moon Icon
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </svg>
            )}
          </motion.div>
        </button>

        {/* Auth Navigation */}
        <div className="flex items-center gap-3 border-l border-brand-border/10 pl-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline-block text-xs font-semibold text-brand-text-muted">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="glass-panel-interactive px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500 cursor-pointer"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/auth"
                className="text-xs font-bold text-brand-text hover:text-brand-secondary transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth?signup=true"
                className="glass-panel-interactive px-3.5 py-1.5 rounded-lg text-xs font-bold bg-brand-primary/20 hover:bg-brand-primary/30 border border-brand-primary/30 text-white"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

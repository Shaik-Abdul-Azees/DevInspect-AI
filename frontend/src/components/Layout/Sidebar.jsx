// frontend/src/components/Layout/Sidebar.jsx

import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import useStore from '../../store/useStore';

export default function Sidebar() {
  const { sidebarOpen } = useStore();

  const menuItems = [
    {
      name: 'Metrics Analytics',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      )
    },
    {
      name: 'Code Sandbox',
      path: '/workspace',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
        </svg>
      )
    },
    {
      name: 'Inspection Log',
      path: '/history',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
        </svg>
      )
    }
  ];

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="glass-panel rounded-2xl border border-brand-border/15 flex flex-col h-full transition-colors overflow-hidden select-none shrink-0 shadow-lg"
    >
      <div className="flex-1 py-6 px-3 flex flex-col gap-2">
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3.5 py-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-brand-primary-glow border-brand-primary/20 text-brand-primary font-bold shadow-md'
                  : 'bg-transparent border-transparent text-brand-text-muted hover:text-brand-text hover:bg-white/5'
              }`
            }
          >
            <div className="shrink-0 flex items-center justify-center">
              {item.icon}
            </div>
            
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="text-sm font-semibold truncate"
              >
                {item.name}
              </motion.span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Expanded Collapse Helper info */}
      {sidebarOpen && (
        <div className="p-4 border-t border-brand-border/5 bg-black/10 text-center">
          <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">DevInspect Shell v1.0</p>
        </div>
      )}
    </motion.aside>
  );
}

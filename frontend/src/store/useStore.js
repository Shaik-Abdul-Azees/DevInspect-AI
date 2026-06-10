// frontend/src/store/useStore.js
import { create } from 'zustand';
import axios from 'axios';

// Set up Axios default baseUrl to target backend
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Setup token in headers if present in localStorage initially
const initialToken = localStorage.getItem('token');
if (initialToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

const useStore = create((set, get) => ({
  // --- AUTH MODULE STATE ---
  token: initialToken,
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  isAuthenticated: !!initialToken,
  authError: null,

  // --- AUTH MODULE ACTIONS ---
  login: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Bind Axios global authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    set({
      token,
      user,
      isAuthenticated: true,
      authError: null
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Delete Axios global authorization header
    delete axios.defaults.headers.common['Authorization'];

    set({
      token: null,
      user: null,
      isAuthenticated: false,
      authError: null
    });
  },

  setAuthError: (err) => {
    set({ authError: err });
  },

  // --- UI MODULE STATE ---
  theme: localStorage.getItem('theme') || 'dark',
  sidebarOpen: true,
  activeReview: null,

  // --- UI MODULE ACTIONS ---
  toggleTheme: () => {
    const currentTheme = get().theme;
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    localStorage.setItem('theme', nextTheme);
    
    // Update HTML element classes dynamically
    const root = window.document.documentElement;
    if (nextTheme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }

    set({ theme: nextTheme });
  },

  // Initialize theme class based on state (useful on App mount)
  initTheme: () => {
    const theme = get().theme;
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (isOpen) => {
    set({ sidebarOpen: isOpen });
  },

  setActiveReview: (review) => {
    set({ activeReview: review });
  }
}));

export default useStore;

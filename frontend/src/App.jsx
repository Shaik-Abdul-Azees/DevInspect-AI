import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';

// Layout & Pages
import Layout from './components/Layout/Layout';
const Landing = lazy(() => import('./pages/Landing'));
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Workspace = lazy(() => import('./pages/Workspace'));
const History = lazy(() => import('./pages/History'));
const ReviewDetails = lazy(() => import('./pages/ReviewDetails'));

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
    <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
  </div>
);

// Protected Route Wrapper for Auth-required pages
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

export default function App() {
  const initTheme = useStore((state) => state.initTheme);

  // Initialize light/dark mode CSS selection on mount
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Marketing Landing Page */}
          <Route path="/" element={<Landing />} />
          
          {/* Authentication forms page (Login/Register) */}
          <Route path="/auth" element={<Auth />} />

          {/* Private/Protected Shell Layout Route Mapping */}
          <Route path="/" element={<Layout />}>
            {/* Dashboard Metrics Analytics is authenticated-only */}
            <Route 
              path="dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Workspace Code Sandbox is public (supports guests & logged-in devs) */}
            <Route path="workspace" element={<Workspace />} />
            
            {/* Inspection log history is authenticated-only */}
            <Route 
              path="history" 
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Public Shared Review details */}
          <Route path="/review/:id" element={<ReviewDetails />} />

          {/* Catch-all redirect back to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

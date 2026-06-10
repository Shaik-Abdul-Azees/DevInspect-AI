// frontend/src/pages/Auth.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import useStore from '../store/useStore';

// Regex utility for standard RFC email structures
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const loginAction = useStore((state) => state.login);
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Real-time input checking (Derived state)
  const emailValid = email === '' ? null : EMAIL_REGEX.test(email);
  const passwordValid = password === '' ? null : password.length >= 6;
  const confirmMatch = confirmPassword === '' ? null : password === confirmPassword;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Sync state with query changes
  useEffect(() => {
    // eslint-disable-next-line
    setIsSignUp(searchParams.get('signup') === 'true');
    setErrorMsg(null);
    // Reset validations
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      setErrorMsg('Please input a valid email address.');
      return;
    }

    // Validate password constraints
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setErrorMsg('Confirmation password does not match.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
      const response = await axios.post(endpoint, { email, password });
      
      const { user, token } = response.data;
      
      // Save credentials in Zustand and LocalStorage
      loginAction(user, token);
      
      // Target coding workspace sandbox
      navigate('/workspace');

    } catch (err) {
      console.error('Authentication error:', err);
      setErrorMsg(
        err.response?.data?.message || 
        'Authorization endpoint failed. Please verify that your backend server is online.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg bg-grid-pattern relative overflow-hidden flex flex-col justify-center items-center px-6 py-12 text-brand-text transition-colors duration-300">
      {/* Aurora Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] aurora-blur-1 rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] aurora-blur-2 rounded-full pointer-events-none z-0"></div>

      <div className="absolute top-6 left-6 z-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white shadow-md">
            D
          </div>
          <span className="font-extrabold text-sm tracking-tight">
            DevInspect <span className="text-brand-secondary">AI</span>
          </span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-panel rounded-2xl border border-brand-border/10 shadow-2xl p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black bg-gradient-to-r from-brand-text to-brand-text-muted bg-clip-text text-transparent">
            {isSignUp ? 'Create Workspace Account' : 'Welcome Back, Dev!'}
          </h2>
          <p className="text-xs text-brand-text-muted mt-1.5 leading-relaxed">
            {isSignUp 
              ? 'Register to unlock persistent inspection audits and detailed reports.' 
              : 'Sign in to access code playground workspace.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-brand-danger/10 border border-brand-danger/25 text-brand-danger rounded-xl p-3.5 text-xs font-semibold leading-relaxed flex gap-2"
              >
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Address */}
          <div className="flex flex-col gap-1.5 relative">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Email Address</label>
              {emailValid !== null && (
                <span className={`text-[9px] font-bold ${emailValid ? 'text-emerald-500' : 'text-brand-danger'}`}>
                  {emailValid ? '✓ Valid format' : '✗ Invalid email format'}
                </span>
              )}
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`bg-black/35 border rounded-xl px-4 py-3 text-sm text-brand-text outline-none transition-all placeholder:text-brand-text-muted/30 ${
                emailValid === null 
                  ? 'border-brand-border/10 focus:border-brand-primary' 
                  : emailValid 
                    ? 'border-emerald-500/40 focus:border-emerald-500' 
                    : 'border-brand-danger/40 focus:border-brand-danger'
              }`}
              placeholder="you@domain.com"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5 relative">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Password</label>
              {passwordValid !== null && (
                <span className={`text-[9px] font-bold ${passwordValid ? 'text-emerald-500' : 'text-brand-danger'}`}>
                  {passwordValid ? '✓ Let\'s go' : '✗ Minimum 6 characters'}
                </span>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`bg-black/35 border rounded-xl px-4 py-3 text-sm text-brand-text outline-none transition-all placeholder:text-brand-text-muted/30 ${
                passwordValid === null 
                  ? 'border-brand-border/10 focus:border-brand-primary' 
                  : passwordValid 
                    ? 'border-emerald-500/40 focus:border-emerald-500' 
                    : 'border-brand-danger/40 focus:border-brand-danger'
              }`}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Confirm Password (only on Sign Up) */}
          {isSignUp && (
            <div className="flex flex-col gap-1.5 relative">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Confirm Password</label>
                {confirmMatch !== null && (
                  <span className={`text-[9px] font-bold ${confirmMatch ? 'text-emerald-500' : 'text-brand-danger'}`}>
                    {confirmMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </span>
                )}
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`bg-black/35 border rounded-xl px-4 py-3 text-sm text-brand-text outline-none transition-all placeholder:text-brand-text-muted/30 ${
                  confirmMatch === null 
                    ? 'border-brand-border/10 focus:border-brand-primary' 
                    : confirmMatch 
                      ? 'border-emerald-500/40 focus:border-emerald-500' 
                      : 'border-brand-danger/40 focus:border-brand-danger'
                }`}
                placeholder="••••••••"
                required={isSignUp}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl text-sm font-bold bg-brand-primary hover:bg-brand-primary/95 text-white shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting Secure Tunnel...
              </>
            ) : (
              isSignUp ? 'Create My Account' : 'Authenticate Credentials'
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-brand-border/5">
          <p className="text-xs text-brand-text-muted">
            {isSignUp ? 'Already registered?' : 'New developer to DevInspect?'}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-brand-secondary font-bold hover:underline ml-1.5 cursor-pointer"
            >
              {isSignUp ? 'Sign In Here' : 'Create Free Account'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

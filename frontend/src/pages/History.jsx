// frontend/src/pages/History.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function History() {
  const [historyList, setHistoryList] = useState([]);
  const [favoritesList, setFavoritesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tabs: 'all' | 'favorites'
  const [activeTab, setActiveTab] = useState('all');

  const [selectedReview, setSelectedReview] = useState(null);
  const [shareSuccessId, setShareSuccessId] = useState(null);

  const fetchHistoryAndFavorites = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const historyResponse = await axios.get('/api/reviews');
      const reviewList = Array.isArray(historyResponse.data)
        ? historyResponse.data
        : (historyResponse.data?.reviews ?? []);
      setHistoryList(reviewList);

      const favoritesResponse = await axios.get('/api/favorites');
      const favoriteList = Array.isArray(favoritesResponse.data)
        ? favoritesResponse.data
        : (favoritesResponse.data?.reviews ?? []);
      setFavoritesList(favoriteList);
    } catch (err) {
      console.error('Failed to load history items:', err);
      setErrorMsg(
        err.response?.data?.message || 
        'Could not fetch inspection records. Please verify server connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchHistoryAndFavorites();
  }, []);

  const handleToggleFavorite = async (reviewId, e) => {
    e.stopPropagation(); // Avoid selecting review card
    try {
      const res = await axios.post(`/api/favorites/${reviewId}`);
      if (res.data.favorited) {
        // Find review in historyList and add to favoritesList
        const reviewObj = historyList.find(r => r._id === reviewId);
        if (reviewObj) setFavoritesList(prev => [reviewObj, ...prev]);
      } else {
        // Remove from favoritesList
        setFavoritesList(prev => prev.filter(r => r._id !== reviewId));
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleShareLink = (reviewId, e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/review/${reviewId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setShareSuccessId(reviewId);
        setTimeout(() => setShareSuccessId(null), 2500);
      })
      .catch(err => console.error('Failed to copy share link:', err));
  };

  const handleDeleteReview = async (reviewId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this audit from your history? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/reviews/${reviewId}`);
      setHistoryList((prev) => prev.filter((r) => r._id !== reviewId));
      setFavoritesList((prev) => prev.filter((r) => r._id !== reviewId));
      if (selectedReview?._id === reviewId) setSelectedReview(null);
    } catch (err) {
      console.error('Failed to delete review:', err);
      setErrorMsg(err.response?.data?.message || 'Could not delete this review.');
    }
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  // Determine active dataset to display
  const activeDataset = activeTab === 'all' ? historyList : favoritesList;

  // Filter listings by search search query
  const filteredList = activeDataset.filter(item => {
    const codeMatch = item.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const langMatch = item.language?.toLowerCase().includes(searchTerm.toLowerCase());
    const summaryMatch = item.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    return codeMatch || langMatch || summaryMatch;
  });

  const isItemFavorited = (reviewId) => {
    return favoritesList.some(r => r._id === reviewId);
  };

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* Title Header (hidden in print) */}
      <div className="flex justify-between items-center gap-4 flex-wrap print:hidden">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-brand-text to-brand-text-muted bg-clip-text text-transparent">
            Inspection History Log
          </h1>
          <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
            Review past quality metrics, toggle favorite audits, share links with team members, or export detailed PDF logs.
          </p>
        </div>
        
        <button
          onClick={fetchHistoryAndFavorites}
          disabled={loading}
          className="glass-panel-interactive px-3.5 py-1.5 rounded-lg text-xs font-bold text-brand-primary border border-brand-primary/20 hover:bg-brand-primary-glow flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 animate-spin-hover" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8.89M9 11l3 3L22 4"></path>
          </svg>
          Sync Records
        </button>
      </div>

      {/* Tabs selector bar & Search block (hidden in print) */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 print:hidden">
        <div className="flex gap-2 p-1 glass-panel border border-brand-border/10 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all' 
                ? 'bg-brand-primary text-white shadow-md' 
                : 'text-brand-text-muted hover:text-brand-text'
            }`}
          >
            All Audits ({historyList.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'favorites' 
                ? 'bg-brand-primary text-white shadow-md' 
                : 'text-brand-text-muted hover:text-brand-text'
            }`}
          >
            ⭐ Favorites ({favoritesList.length})
          </button>
        </div>

        {/* Search query block */}
        <div className="glass-panel rounded-xl px-3 py-2 flex items-center gap-3 border border-brand-border/10 max-w-sm w-full">
          <svg className="w-4 h-4 text-brand-text-muted/60 shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search filters..."
            className="bg-transparent text-xs text-brand-text outline-none w-full placeholder:text-brand-text-muted/40"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Logs Listing Panel (hidden in print) */}
        <div className="lg:col-span-6 flex flex-col gap-4 print:hidden">
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-20 flex flex-col items-center justify-center gap-3 text-center"
                >
                  <div className="w-8 h-8 rounded-full border-t-2 border-brand-primary animate-spin"></div>
                  <span className="text-xs text-brand-text-muted">Loading audit records...</span>
                </motion.div>
              )}

              {errorMsg && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger rounded-xl p-4 text-xs font-semibold leading-relaxed flex gap-2.5"
                >
                  <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {!loading && !errorMsg && filteredList.length === 0 && (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-16 text-center border border-dashed border-brand-border/10 rounded-2xl p-6 flex flex-col items-center gap-3 text-brand-text-muted"
                >
                  <svg className="w-10 h-10 text-brand-text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <div>
                    <p className="text-xs font-bold text-brand-text">No Audit Logs Found</p>
                    <p className="text-[10px] text-brand-text-muted mt-1 max-w-[200px] leading-relaxed mx-auto">
                      {searchTerm ? 'No results match your search filters.' : 'Your history filters are empty.'}
                    </p>
                  </div>
                </motion.div>
              )}

              {!loading && !errorMsg && filteredList.length > 0 && (
                <motion.div 
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-3"
                >
                  {filteredList.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => setSelectedReview(item)}
                      className={`glass-panel-interactive p-4 rounded-xl border flex flex-col gap-2.5 transition-all text-left cursor-pointer relative ${
                        selectedReview?._id === item._id 
                          ? 'border-brand-primary/50 bg-brand-primary-glow shadow-md shadow-brand-primary/5' 
                          : 'border-brand-border/10 hover:border-brand-border/20'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-brand-secondary-glow text-brand-secondary border border-brand-secondary/15">
                            {item.language}
                          </span>
                          <span className="text-[10px] text-brand-text-muted">
                            {new Date(item.createdAt).toLocaleString(undefined, { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Share Copier Link */}
                          <button
                            onClick={(e) => handleShareLink(item._id, e)}
                            className="p-1 rounded hover:bg-white/5 text-[10px] cursor-pointer"
                            title="Copy Share Link"
                          >
                            {shareSuccessId === item._id ? '✓ Copied' : '🔗 Share'}
                          </button>

                          {/* Star favorite toggle */}
                          <button
                            onClick={(e) => handleToggleFavorite(item._id, e)}
                            className="p-1 rounded hover:bg-white/5 text-xs cursor-pointer"
                            title="Toggle Favorite"
                          >
                            {isItemFavorited(item._id) ? '⭐' : '☆'}
                          </button>

                          <button
                            onClick={(e) => handleDeleteReview(item._id, e)}
                            className="p-1 rounded hover:bg-rose-500/10 text-[10px] text-rose-400 cursor-pointer"
                            title="Delete Review"
                          >
                            🗑️
                          </button>

                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            item.score >= 80 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : item.score >= 50
                                ? 'bg-amber-500/10 text-amber-500'
                                : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {item.score}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-brand-text leading-relaxed font-semibold truncate">
                        {item.summary || 'Code analysis completed.'}
                      </p>

                      <code className="text-[10px] text-brand-text-muted font-mono block truncate bg-black/15 p-2 rounded-lg border border-brand-border/5">
                        {item.code}
                      </code>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Detailed Drawer / Inspection Panel (expands to full screen in print) */}
        <div className="lg:col-span-6 sticky top-24 print:col-span-12 print:relative print:top-0 print:border-none print:shadow-none print:bg-transparent">
          <AnimatePresence mode="wait">
            {selectedReview ? (
              <motion.div
                key={selectedReview._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="glass-panel border border-brand-border/10 rounded-2xl overflow-hidden shadow-xl flex flex-col print:border-none print:bg-transparent print:shadow-none"
              >
                {/* Print Title (only visible in print) */}
                <div className="hidden print:block pb-6 border-b border-black mb-6 text-left">
                  <h1 className="text-3xl font-black uppercase tracking-tight text-black">DevInspect AI Audit Report</h1>
                  <p className="text-sm text-gray-700 mt-1">Code Quality & Vulnerability Analysis Documentation</p>
                  <p className="text-xs text-gray-500 mt-0.5">Generated: {new Date(selectedReview.createdAt).toLocaleString()}</p>
                </div>

                <div className="p-4 bg-black/25 border-b border-brand-border/10 flex justify-between items-center print:hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted">Audit Analysis Details</span>
                    
                    {/* Trigger PDF Print export button */}
                    <button
                      onClick={handleTriggerPrint}
                      className="ml-3 px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary border border-brand-primary/30 text-[9px] font-bold hover:bg-brand-primary/30 transition-all cursor-pointer"
                      title="Export PDF Report"
                    >
                      🖨️ Export PDF
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="p-1 rounded-md text-brand-text-muted hover:text-brand-text hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[500px] print:max-h-none print:overflow-visible print:p-0">
                  
                  {/* Synopsis Box */}
                  <div className="p-4 rounded-xl bg-brand-primary-glow border border-brand-primary/10 print:bg-gray-100 print:border-gray-300 print:text-black">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider print:text-gray-700">synopsis</span>
                      <span className="text-[10px] font-bold text-brand-text-muted print:text-gray-800">Safety Score: {selectedReview.score}/100</span>
                    </div>
                    <p className="text-xs text-brand-text leading-relaxed font-semibold print:text-black">
                      {selectedReview.summary}
                    </p>
                  </div>

                  {/* Code Snippet Box */}
                  <div className="flex flex-col gap-1.5 print:break-inside-avoid">
                    <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider print:text-gray-800">Analyzed Snippet ({selectedReview.language})</label>
                    <div className="bg-black/30 rounded-xl p-3.5 border border-brand-border/5 overflow-x-auto max-h-[140px] print:bg-white print:border-gray-400 print:max-h-none print:text-black">
                      <code className="text-xs text-brand-text font-mono block whitespace-pre leading-relaxed select-all print:text-black">
                        {selectedReview.code}
                      </code>
                    </div>
                  </div>

                  {/* Issues found list */}
                  <div className="flex flex-col gap-3.5 print:break-inside-avoid">
                    <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider print:text-gray-800">
                      Identified Findings ({selectedReview.issues?.length || 0})
                    </label>

                    {selectedReview.issues?.length === 0 ? (
                      <div className="text-center p-5 border border-dashed border-brand-border/10 rounded-xl print:border-gray-400">
                        <span className="text-[10px] text-emerald-500 font-bold print:text-green-700">✨ No security flaws or logic bugs found in this audit log!</span>
                      </div>
                    ) : (
                      selectedReview.issues.map((issue, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border flex flex-col gap-2 print:border-gray-400 print:bg-white print:break-inside-avoid ${
                            issue.severity === 'critical' || issue.severity === 'high'
                              ? 'bg-rose-500/5 border-rose-500/15 print:border-l-4 print:border-l-red-600'
                              : issue.severity === 'medium'
                                ? 'bg-amber-500/5 border-amber-500/15 print:border-l-4 print:border-l-yellow-600'
                                : 'bg-brand-primary-glow border-brand-primary/15 print:border-l-4 print:border-l-blue-600'
                          }`}
                        >
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-xs font-bold text-brand-text print:text-black">{issue.title}</span>
                            <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                              issue.severity === 'critical' || issue.severity === 'high'
                                ? 'bg-rose-500/15 text-rose-500 print:bg-red-100 print:text-red-700'
                                : issue.severity === 'medium'
                                  ? 'bg-amber-500/15 text-amber-500 print:bg-yellow-100 print:text-yellow-700'
                                  : 'bg-brand-primary/20 text-brand-primary print:bg-blue-100 print:text-blue-700'
                            }`}>
                              {issue.severity}
                            </span>
                          </div>
                          
                          <p className="text-[10.5px] text-brand-text-muted leading-relaxed print:text-gray-700">
                            {issue.description}
                          </p>

                          <div className="bg-black/45 rounded-lg p-2.5 border border-brand-border/5 print:bg-gray-50 print:border-gray-300">
                            <p className="text-[8.5px] font-bold text-brand-secondary uppercase tracking-wider mb-1 print:text-blue-700">Fix Recommendation</p>
                            <code className="text-xs text-brand-text font-mono block whitespace-pre-wrap leading-relaxed select-all print:text-black">
                              {issue.fix}
                            </code>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden lg:flex flex-col justify-center items-center py-24 border border-dashed border-brand-border/10 rounded-2xl text-center text-brand-text-muted gap-3 min-h-[360px] print:hidden"
              >
                <div className="w-11 h-11 rounded-full bg-brand-primary-glow border border-brand-primary/10 flex items-center justify-center text-brand-primary/75">
                  <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-text">Select Audit Record</p>
                  <p className="text-[10px] text-brand-text-muted mt-1 max-w-[200px] leading-relaxed mx-auto">
                    Click any code review audit record from the left listings log to display the full report analysis dashboard.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

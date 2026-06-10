// frontend/src/pages/ReviewDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function ReviewDetails() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchReview = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const response = await axios.get(`/api/reviews/${id}`);
        setReview(response.data);
      } catch (err) {
        console.error(err);
        setErrorMsg('Review details could not be found or connection failed.');
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [id]);

  return (
    <div className="min-h-screen bg-brand-bg bg-grid-pattern relative overflow-hidden flex flex-col justify-center items-center px-6 py-12 text-brand-text transition-colors duration-300">
      {/* Aurora Blurs */}
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

      <div className="w-full max-w-4xl mt-8 relative z-10 flex flex-col gap-6">
        
        {loading ? (
          <div className="glass-panel p-12 rounded-2xl border border-brand-border/10 text-center flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-t-2 border-brand-primary animate-spin"></div>
            <span className="text-xs text-brand-text-muted">Fetching shared inspection audit...</span>
          </div>
        ) : errorMsg ? (
          <div className="glass-panel p-12 rounded-2xl border border-brand-border/10 text-center">
            <span className="text-sm font-bold text-brand-danger block mb-4">{errorMsg}</span>
            <Link to="/" className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-primary text-white">
              Back to Home
            </Link>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 sm:p-8 rounded-2xl border border-brand-border/10 shadow-2xl flex flex-col gap-6"
          >
            {/* Header info */}
            <div className="flex justify-between items-center gap-4 flex-wrap pb-4 border-b border-brand-border/5">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-brand-secondary/25 border border-brand-secondary/15 text-brand-secondary">
                  {review.language} Audit
                </span>
                <span className="text-xs text-brand-text-muted ml-3">
                  Captured: {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                review.score >= 80 
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                  : review.score >= 50
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              }`}>
                Safety Index: {review.score}/100
              </span>
            </div>

            {/* Synopsis */}
            <div className="p-4 rounded-xl bg-brand-primary-glow border border-brand-primary/10">
              <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider mb-1">Synopsis</p>
              <p className="text-xs text-brand-text leading-relaxed font-semibold">
                {review.summary}
              </p>
            </div>

            {/* Source Code */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Source Snippet</label>
              <div className="bg-black/30 rounded-xl p-4 border border-brand-border/5 overflow-x-auto max-h-[220px]">
                <code className="text-xs text-brand-text font-mono block whitespace-pre leading-relaxed select-all">
                  {review.code}
                </code>
              </div>
            </div>

            {/* Findings list */}
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">
                Captured Findings ({review.issues?.length || 0})
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {review.issues?.map((issue, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border flex flex-col gap-2 ${
                      issue.severity === 'critical' || issue.severity === 'high'
                        ? 'bg-rose-500/5 border-rose-500/15'
                        : issue.severity === 'medium'
                          ? 'bg-amber-500/5 border-amber-500/15'
                          : 'bg-brand-primary-glow border-brand-primary/15'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs font-bold text-brand-text">{issue.title}</span>
                      <span className={`text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        issue.severity === 'critical' || issue.severity === 'high'
                          ? 'bg-rose-500/15 text-rose-500'
                          : issue.severity === 'medium'
                            ? 'bg-amber-500/15 text-amber-500'
                            : 'bg-brand-primary/20 text-brand-primary'
                      }`}>
                        {issue.severity}
                      </span>
                    </div>

                    <p className="text-[10.5px] text-brand-text-muted leading-relaxed">
                      {issue.description}
                    </p>

                    <div className="bg-black/45 rounded-lg p-2.5 border border-brand-border/5 mt-2">
                      <span className="text-[8px] font-extrabold uppercase text-brand-secondary tracking-wider block mb-1">Recommended Fix</span>
                      <code className="text-xs text-brand-text font-mono block whitespace-pre-wrap leading-relaxed">
                        {issue.fix}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Back action */}
            <div className="pt-4 border-t border-brand-border/5 text-center">
              <Link to="/" className="text-xs text-brand-secondary font-bold hover:underline">
                ← Analyze Your Own Repository with DevInspect AI
              </Link>
            </div>

          </motion.div>
        )}
        
      </div>
    </div>
  );
}

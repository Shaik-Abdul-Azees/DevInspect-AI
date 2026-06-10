// frontend/src/pages/Dashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LANG_COLORS = {
  javascript: 'bg-yellow-400',
  python: 'bg-emerald-400',
  java: 'bg-orange-400',
  cpp: 'bg-sky-400',
  c: 'bg-violet-400',
};

export default function Dashboard() {
  const [reviews, setReviews] = useState([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const [reviewsRes, favoritesRes] = await Promise.all([
          axios.get('/api/reviews'),
          axios.get('/api/favorites'),
        ]);
        const reviewList = Array.isArray(reviewsRes.data)
          ? reviewsRes.data
          : (reviewsRes.data?.reviews ?? []);
        const favoriteList = Array.isArray(favoritesRes.data)
          ? favoritesRes.data
          : (favoritesRes.data?.reviews ?? []);
        setReviews(reviewList);
        setFavoriteCount(favoriteList.length);
      } catch (err) {
        console.error('Failed to retrieve dashboard data:', err);
        setErrorMsg('Could not establish connection with inspection logs API.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const metrics = useMemo(() => {
    const totalScans = reviews.length;
    const avgScore =
      totalScans > 0
        ? Math.round(reviews.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalScans)
        : 0;

    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    const languageCounts = {};

    reviews.forEach((review) => {
      const lang = (review.language || 'unknown').toLowerCase();
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      review.issues?.forEach((issue) => {
        const sev = issue.severity?.toLowerCase();
        if (sev === 'critical') criticalCount++;
        else if (sev === 'high') highCount++;
        else if (sev === 'medium') mediumCount++;
        else lowCount++;
      });
    });

    const totalIssues = criticalCount + highCount + mediumCount + lowCount;
    const langEntries = Object.entries(languageCounts).sort((a, b) => b[1] - a[1]);
    const maxLangCount = langEntries.length > 0 ? langEntries[0][1] : 1;

    return {
      totalScans,
      avgScore,
      criticalCount: criticalCount + highCount,
      favoriteCount,
      totalIssues,
      criticalCountRaw: criticalCount,
      highCount,
      mediumCount,
      lowCount,
      langEntries,
      maxLangCount,
    };
  }, [reviews, favoriteCount]);

  const chartWidth = 500;
  const chartHeight = 150;
  const padding = 20;

  const trendData = [...reviews]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-8);

  const points =
    trendData.length > 0
      ? trendData.map((item, idx) => {
          const x =
            padding +
            (idx * (chartWidth - padding * 2)) / Math.max(1, trendData.length - 1);
          const y =
            chartHeight - padding - (item.score * (chartHeight - padding * 2)) / 100;
          return { x, y, score: item.score };
        })
      : [];

  const pathD = points.reduce(
    (acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`),
    ''
  );

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
      : '';

  const { totalIssues } = metrics;
  const severitySegments = useMemo(() => {
    const raw = [
      { key: 'critical', val: metrics.criticalCountRaw, color: 'var(--color-brand-danger)' },
      { key: 'high', val: metrics.highCount, color: '#f97316' },
      { key: 'medium', val: metrics.mediumCount, color: 'var(--color-brand-warning)' },
      { key: 'low', val: metrics.lowCount, color: 'var(--brand-primary)' },
    ].filter((s) => s.val > 0);
    let offset = 0;
    return raw.map((seg) => {
      const pct = totalIssues > 0 ? (seg.val / totalIssues) * 100 : 0;
      const segment = { ...seg, pct, offset };
      offset -= pct;
      return segment;
    });
  }, [metrics, totalIssues]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black bg-gradient-to-r from-brand-text to-brand-text-muted bg-clip-text text-transparent">
          Inspection Metrics Analytics
        </h1>
        <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
          Overview of your code audits, security findings, and language coverage.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-t-2 border-brand-primary animate-spin" />
          <span className="text-xs text-brand-text-muted">Analyzing workspace records...</span>
        </div>
      ) : errorMsg ? (
        <div className="bg-brand-danger/10 border border-brand-danger/25 text-brand-danger rounded-xl p-4 text-xs font-semibold">
          {errorMsg}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Primary KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: 'Total Reviews',
                val: metrics.totalScans,
                desc: 'Completed code inspections',
                icon: '📋',
                color: 'text-brand-primary',
              },
              {
                title: 'Average Score',
                val: `${metrics.avgScore}/100`,
                desc: 'Mean quality across all scans',
                icon: '📊',
                color:
                  metrics.avgScore >= 80
                    ? 'text-emerald-500'
                    : metrics.avgScore >= 50
                      ? 'text-amber-500'
                      : 'text-rose-500',
              },
              {
                title: 'Critical Issues',
                val: metrics.criticalCount,
                desc: 'Critical + high severity findings',
                icon: '⚠️',
                color: metrics.criticalCount > 0 ? 'text-rose-500' : 'text-emerald-500',
              },
              {
                title: 'Favorite Reviews',
                val: metrics.favoriteCount,
                desc: 'Starred audits in your collection',
                icon: '⭐',
                color: 'text-amber-400',
              },
            ].map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-panel p-5 rounded-2xl border border-brand-border/10 shadow-sm text-left"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">
                    {card.title}
                  </span>
                  <span className="text-lg opacity-80">{card.icon}</span>
                </div>
                <span className={`text-3xl font-black block mt-2 ${card.color}`}>{card.val}</span>
                <span className="text-[9.5px] text-brand-text-muted mt-1.5 block">{card.desc}</span>
              </motion.div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Review trend */}
            <div className="lg:col-span-5 glass-panel rounded-2xl border border-brand-border/10 p-5 shadow-lg flex flex-col min-h-[300px]">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">
                Review Trend
              </span>
              <span className="text-xs text-brand-text-muted mt-1 block mb-4">
                Safety scores over your last {Math.min(8, trendData.length)} inspections
              </span>
              {trendData.length > 1 ? (
                <div className="flex-1 flex items-center justify-center">
                  <svg className="w-full max-w-[420px]" viewBox={`0 0 ${chartWidth} ${chartHeight}`} fill="none">
                    <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    <path d={areaD} fill="url(#chartGrad)" opacity="0.12" />
                    <motion.path
                      d={pathD}
                      stroke="url(#strokeGrad)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                    {points.map((pt, idx) => (
                      <circle key={idx} cx={pt.x} cy={pt.y} r="4" fill="var(--brand-primary)" stroke="var(--brand-bg)" strokeWidth="1.5" />
                    ))}
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--brand-primary)" />
                        <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--brand-primary)" />
                        <stop offset="100%" stopColor="var(--brand-secondary)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-brand-text-muted text-center px-4">
                  Run at least two inspections to plot your review trend.
                </div>
              )}
            </div>

            {/* Language usage */}
            <div className="lg:col-span-3 glass-panel rounded-2xl border border-brand-border/10 p-5 shadow-lg flex flex-col min-h-[300px]">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">
                Language Usage
              </span>
              <span className="text-xs text-brand-text-muted mt-1 block mb-4">
                Audits grouped by programming language
              </span>
              {metrics.langEntries.length > 0 ? (
                <div className="flex flex-col gap-3 flex-1 justify-center">
                  {metrics.langEntries.map(([lang, count]) => (
                    <div key={lang} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] font-bold text-brand-text-muted uppercase">
                        <span>{lang}</span>
                        <span className="font-mono text-brand-text">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-black/20 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / metrics.maxLangCount) * 100}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className={`h-full rounded-full ${LANG_COLORS[lang] || 'bg-brand-secondary'}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-brand-text-muted text-center">
                  No language data yet.
                </div>
              )}
            </div>

            {/* Issue severity */}
            <div className="lg:col-span-4 glass-panel rounded-2xl border border-brand-border/10 p-5 shadow-lg flex flex-col min-h-[300px]">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">
                Issue Severity
              </span>
              <span className="text-xs text-brand-text-muted mt-1 block mb-4">
                Distribution of findings by severity level
              </span>
              {totalIssues > 0 ? (
                <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6">
                  <div className="relative w-28 h-28 shrink-0">
                    <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                      {severitySegments.map((seg) => (
                          <circle
                            key={seg.key}
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="none"
                            stroke={seg.color}
                            strokeWidth="3.2"
                            strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                            strokeDashoffset={seg.offset}
                          />
                      ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col justify-center items-center">
                      <span className="text-lg font-black text-brand-text">{totalIssues}</span>
                      <span className="text-[7.5px] uppercase tracking-wider font-bold text-brand-text-muted">
                        Issues
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full text-left">
                    {[
                      { name: 'Critical', val: metrics.criticalCountRaw, color: 'bg-rose-500' },
                      { name: 'High', val: metrics.highCount, color: 'bg-orange-500' },
                      { name: 'Medium', val: metrics.mediumCount, color: 'bg-amber-500' },
                      { name: 'Low', val: metrics.lowCount, color: 'bg-brand-primary' },
                    ].map((item) => (
                      <div key={item.name} className="flex justify-between items-center text-xs font-semibold text-brand-text-muted">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-mono text-brand-text font-bold">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-brand-text-muted text-center">
                  No issues detected across your reviews.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center bg-black/10 rounded-2xl p-4 border border-brand-border/5">
            <span className="text-xs text-brand-text-muted">Ready to audit another snippet?</span>
            <Link
              to="/workspace"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-primary hover:bg-brand-primary/95 text-white shadow-md cursor-pointer"
            >
              Open Sandbox Workspace →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

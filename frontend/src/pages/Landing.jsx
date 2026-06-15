// frontend/src/pages/Landing.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

export default function Landing() {
  const { isAuthenticated } = useStore();
  const [activeFaq, setActiveFaq] = useState(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoCode, setDemoCode] = useState(`function uploadData(buffer) {
  var size = buffer.length;
  // TODO: Fix buffer sizing issue
  var data = eval(buffer.toString());
  return data;
}`);
  const [demoResult, setDemoResult] = useState(null);

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const runDemoSimulate = () => {
    setDemoRunning(true);
    setDemoResult(null);
    setTimeout(() => {
      setDemoResult({
        score: 42,
        summary: "Static analysis detected dangerous runtime practices including arbitrary execution vulnerabilities and buffer sizing bugs.",
        issues: [
          {
            title: "Critical Vulnerability: eval() Usage",
            severity: "critical",
            description: "Executing raw inputs using eval() bypasses engine sandbox security, posing significant risk of script injection.",
            fix: "JSON.parse(buffer.toString())"
          },
          {
            title: "Legacy Declaration Check",
            severity: "low",
            description: "Uses var declarations instead of let/const block scoping, which can lead to variable hoisting bugs.",
            fix: "const size = buffer.length;"
          }
        ]
      });
      setDemoRunning(false);
    }, 1800);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const workflowSteps = [
    {
      step: "01",
      title: "Connect Repository",
      description: "Import a GitHub repository in one click. Developer-friendly OAuth integration ensures zero-friction setup.",
      icon: (
        <svg className="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
    {
      step: "02",
      title: "Fetch Source Code",
      description: "Securely retrieve project files and structures. Built with enterprise-grade privacy to keep your code safe.",
      icon: (
        <svg className="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3" />
        </svg>
      )
    },
    {
      step: "03",
      title: "Run AI Analysis",
      description: "Generate intelligent code review insights. Design reviews with context-aware, developer-focused Gemini intelligence.",
      icon: (
        <svg className="w-6 h-6 text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.187.904zM18 5.25L17 8l-1-2.75L13.25 5 16 4l1-2.75L18 4l2.75 1L18 5.25zM20 12.25L19 15l-1-2.75L15.25 12 18 11l1-2.75L20 11l2.75 1L20 12.25z" />
        </svg>
      )
    },
    {
      step: "04",
      title: "Detect Vulnerabilities",
      description: "Perform AST-based security scanning. Catch buffer issues, variable hoisting bugs, and arbitrary execution flaws in real-time.",
      icon: (
        <svg className="w-6 h-6 text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      step: "05",
      title: "Review Recommendations",
      description: "Get actionable recommendations for code quality, security, and maintainability. Apply instant fixes directly to the workspace.",
      icon: (
        <svg className="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      step: "06",
      title: "Save Analysis History",
      description: "Access previous reports and repository reviews anytime. Audit and trace code quality improvements over time.",
      icon: (
        <svg className="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const pricingPlans = [
    {
      name: "Sandbox",
      price: "$0",
      period: "forever",
      desc: "Perfect for testing scripts and basic vulnerability reviews.",
      features: [
        "30 code inspections per hour",
        "AST static analysis scans",
        "Recommended fix suggestions",
        "Standard community forum"
      ],
      cta: "Try Playground",
      link: "/dashboard",
      popular: false
    },
    {
      name: "Developer Pro",
      price: "$29",
      period: "monthly",
      desc: "Ideal for professional creators demanding fast developer cycles.",
      features: [
        "Unlimited code inspections",
        "Advanced Gemini 1.5 Pro AI audits",
        "Persistent audit log history",
        "Side-by-side split Diff Viewer",
        "Priority developer support"
      ],
      cta: "Upgrade to Pro",
      link: "/auth?signup=true",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "monthly",
      desc: "Built for scaling development pipelines with SLA security guarantees.",
      features: [
        "Unlimited inspections",
        "Dedicated isolated API containers",
        "Automated CI/CD GitHub action integrations",
        "Vulnerability severity classifications",
        "24/7 SLA enterprise engineers"
      ],
      cta: "Contact Enterprise",
      link: "mailto:enterprise@devinspect.ai",
      popular: false
    }
  ];

  const faqs = [
    {
      q: "How does DevInspect AI review my code?",
      a: "Our system combines high-fidelity AST parsing algorithms with the Gemini Pro API. When code is submitted, we inspect syntax structures, identify safety risks, block smells, and supply direct optimization recommendations."
    },
    {
      q: "Are my code submissions stored securely?",
      a: "Absolutely. Submissions are processed through TLS encrypted pipes. For authenticated users, data is saved in your private MongoDB cluster. Anonymous user reviews are never cached persistently."
    },
    {
      q: "Which coding languages are supported?",
      a: "We support JavaScript/TypeScript, Python, and C++ out of the box, with Monaco editor bindings configured for all templates."
    },
    {
      q: "Can I use it for commercial projects?",
      a: "Yes. All code analysis results, metrics, and generated optimization fixes belong entirely to you and are ready for commercial production deployment."
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg bg-grid-pattern relative overflow-hidden flex flex-col text-brand-text transition-colors duration-300">
      {/* Aurora Blurs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] aurora-blur-1 rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] aurora-blur-2 rounded-full pointer-events-none z-0"></div>

      {/* Navigation Header */}
      <header className="glass-panel sticky top-0 z-50 border-b border-brand-border/10 py-4 px-6 md:px-12 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white shadow-lg shadow-brand-primary/20">
            D
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-text via-brand-text to-brand-text-muted bg-clip-text text-transparent">
            DevInspect <span className="text-brand-secondary">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="glass-panel-interactive px-4 py-2 rounded-lg text-sm font-semibold bg-brand-primary/20 hover:bg-brand-primary/30 border border-brand-primary/30 text-white"
            >
              Go to Workspace
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-sm font-medium text-brand-text-muted hover:text-brand-text transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth?signup=true"
                className="glass-panel-interactive px-4 py-2 rounded-lg text-sm font-semibold bg-brand-primary/20 hover:bg-brand-primary/30 border border-brand-primary/30 text-white"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 relative z-10 flex flex-col gap-24">
        
        {/* Hero Section */}
        <section className="text-center flex flex-col items-center max-w-4xl mx-auto gap-6 mt-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-brand-border/10 text-xs text-brand-secondary font-medium tracking-wide shadow-md"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-secondary"></span>
            </span>
            Next-Gen Code Inspection Engine v1.0
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight text-brand-text leading-tight"
          >
            Smarter Code Inspections <br/>
            <span className="bg-gradient-to-r from-brand-primary via-fuchsia-400 to-brand-secondary bg-clip-text text-transparent">
              Powered by Advanced AI
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-brand-text-muted max-w-2xl"
          >
            Deploy high-fidelity, highly optimized code instantly. Upload code, analyze runtime safety hazards, buffer errors, and capture logical flaws in real-time.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-4 mt-2"
          >
            <Link
              to="/auth?signup=true"
              className="glass-panel-interactive px-6 py-3 rounded-xl text-sm font-bold bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20 transition-all active:scale-[0.98]"
            >
              Analyze Your Code Now
            </Link>
            <a
              href="#demo"
              className="glass-panel-interactive px-6 py-3 rounded-xl text-sm font-bold bg-white/5 border border-brand-border/15 hover:bg-white/10 text-brand-text transition-all"
            >
              Watch Sandbox Demo
            </a>
          </motion.div>
        </section>

        {/* Inline Interactive Demo Section */}
        <section id="demo" className="scroll-mt-24 flex flex-col gap-8">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
            <h2 className="text-3xl font-extrabold text-brand-text">Test It Live</h2>
            <p className="text-xs text-brand-text-muted">Click the button below to see a real-time vulnerability scan simulation.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch max-w-5xl mx-auto w-full">
            {/* Editor Box */}
            <div className="lg:col-span-6 glass-panel rounded-2xl border border-brand-border/10 p-5 flex flex-col min-h-[300px] shadow-lg relative bg-black/10">
              <div className="flex justify-between items-center pb-3 border-b border-brand-border/5 mb-3">
                <span className="text-[10px] font-mono text-brand-text-muted">vulnerable_snippet.js</span>
                <span className="text-[10px] font-bold text-brand-secondary">JavaScript</span>
              </div>
              <textarea
                value={demoCode}
                onChange={(e) => setDemoCode(e.target.value)}
                className="flex-1 bg-transparent font-mono text-xs text-brand-text outline-none resize-none leading-relaxed select-all"
                disabled={demoRunning}
              />
              <div className="pt-3 border-t border-brand-border/5 flex justify-end">
                <button
                  onClick={runDemoSimulate}
                  disabled={demoRunning}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-primary hover:bg-brand-primary/95 text-white flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {demoRunning ? "Analyzing AST..." : "Run Simulated Review"}
                </button>
              </div>
            </div>

            {/* Results Screen */}
            <div className="lg:col-span-6 glass-panel rounded-2xl border border-brand-border/10 p-5 flex flex-col shadow-lg bg-black/10 min-h-[300px]">
              <div className="pb-3 border-b border-brand-border/5 mb-3">
                <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Simulated Analysis</span>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center">
                <AnimatePresence mode="wait">
                  {demoRunning && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-3 text-center"
                    >
                      <div className="w-8 h-8 rounded-full border-t-2 border-brand-primary animate-spin"></div>
                      <span className="text-xs text-brand-text-muted">Evaluating execution patterns...</span>
                    </motion.div>
                  )}

                  {!demoRunning && !demoResult && (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-brand-text-muted text-xs max-w-xs flex flex-col gap-2"
                    >
                      <span className="font-bold text-brand-text">Awaiting Execution</span>
                      <span>Click the left action button to scan the buffer script demo.</span>
                    </motion.div>
                  )}

                  {!demoRunning && demoResult && (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full flex flex-col gap-4 text-left"
                    >
                      <div className="p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-xl flex justify-between items-center gap-2">
                        <span className="text-xs font-bold text-brand-text">Vulnerability Score</span>
                        <span className="text-xs font-extrabold text-brand-danger bg-brand-danger/20 px-2 py-0.5 rounded">
                          {demoResult.score}/100
                        </span>
                      </div>

                      <p className="text-xs text-brand-text-muted leading-relaxed font-medium">
                        {demoResult.summary}
                      </p>

                      <div className="flex flex-col gap-2.5">
                        {demoResult.issues.map((issue, idx) => (
                          <div key={idx} className="p-3 rounded-xl border border-brand-border/10 bg-black/15">
                            <div className="flex justify-between items-center gap-2 mb-1">
                              <span className="text-xs font-extrabold text-brand-text">{issue.title}</span>
                              <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                issue.severity === 'critical' ? 'bg-rose-500/10 text-rose-500' : 'bg-brand-primary/10 text-brand-primary'
                              }`}>
                                {issue.severity}
                              </span>
                            </div>
                            <p className="text-[10px] text-brand-text-muted mb-2">{issue.description}</p>
                            <code className="text-xs text-brand-secondary font-mono block">Fix: {issue.fix}</code>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Matrix */}
        <section id="pricing" className="flex flex-col gap-12 mt-4">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
            <h2 className="text-3xl font-extrabold text-brand-text">Transparent Pricing Plans</h2>
            <p className="text-xs text-brand-text-muted">Choose the perfect tier to support your code testing and quality audits.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full items-stretch">
            {pricingPlans.map((plan, idx) => (
              <div 
                key={idx} 
                className={`glass-panel rounded-2xl p-6 flex flex-col gap-6 relative transition-all border ${
                  plan.popular 
                    ? 'border-brand-primary bg-brand-primary-glow/10 shadow-2xl scale-[1.02]' 
                    : 'border-brand-border/10 shadow-lg'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="font-extrabold text-lg text-brand-text">{plan.name}</h3>
                  <p className="text-xs text-brand-text-muted mt-1.5 leading-relaxed">{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-brand-text">{plan.price}</span>
                  <span className="text-xs text-brand-text-muted">/{plan.period}</span>
                </div>

                <ul className="flex-1 flex flex-col gap-3 pt-4 border-t border-brand-border/5">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2.5 text-xs text-brand-text-muted">
                      <svg className="w-4 h-4 text-brand-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div>
                  {plan.link.startsWith('mailto:') ? (
                    <a
                      href={plan.link}
                      className="w-full text-center block py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-brand-border/15 hover:bg-white/10 text-brand-text transition-all"
                    >
                      {plan.cta}
                    </a>
                  ) : (
                    <Link
                      to={plan.link}
                      className={`w-full text-center block py-2.5 rounded-xl text-xs font-bold transition-all ${
                        plan.popular 
                          ? 'bg-brand-primary hover:bg-brand-primary/95 text-white shadow-md' 
                          : 'bg-white/5 border border-brand-border/15 hover:bg-white/10 text-brand-text'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How DevInspect AI Works */}
        <section id="how-it-works" className="flex flex-col gap-10 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-text">
              How DevInspect <span className="bg-gradient-to-r from-brand-primary via-fuchsia-400 to-brand-secondary bg-clip-text text-transparent">AI Works</span>
            </h2>
            <p className="text-xs md:text-sm text-brand-text-muted">
              Analyze repositories, detect vulnerabilities, and receive AI-powered code insights in a few simple steps.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto w-full"
          >
            {workflowSteps.map((step, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="glass-panel-interactive rounded-2xl p-6 border border-brand-border/10 flex flex-col gap-4 shadow-md relative group hover:border-brand-primary/30"
              >
                {idx < 5 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-[2px] bg-gradient-to-r from-brand-primary/20 to-transparent z-0 pointer-events-none group-hover:from-brand-primary/40" />
                )}
                
                <div className="flex justify-between items-center z-10">
                  <span className="text-4xl font-black bg-gradient-to-br from-brand-text/10 to-brand-text/20 bg-clip-text text-transparent group-hover:from-brand-primary/20 group-hover:to-brand-secondary/20 transition-all duration-300">
                    {step.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-brand-border/10 flex items-center justify-center shadow-inner group-hover:bg-brand-primary/10 group-hover:border-brand-primary/20 transition-all duration-300">
                    {step.icon}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 z-10">
                  <h3 className="text-sm font-extrabold text-brand-text group-hover:text-brand-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Coder-Friendly Features Highlights */}
          <div className="mt-8 border-t border-brand-border/5 pt-12 max-w-5xl mx-auto w-full">
            <h3 className="text-center text-xs font-extrabold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent uppercase tracking-widest mb-8">
              Why developers love DevInspect AI
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="flex gap-4 items-start p-4 rounded-xl hover:bg-white/[0.02] transition-colors group">
                <span className="text-2xl mt-0.5 group-hover:scale-110 transition-transform duration-300">💻</span>
                <div>
                  <h4 className="text-xs font-extrabold text-brand-text group-hover:text-brand-primary transition-colors">Intuitive Monaco Workspace</h4>
                  <p className="text-[11px] text-brand-text-muted mt-1 leading-relaxed">
                    Feels identical to VS Code with full syntax highlighting and instant side-by-side split Diff Viewer to apply fixes immediately.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-xl hover:bg-white/[0.02] transition-colors group">
                <span className="text-2xl mt-0.5 group-hover:scale-110 transition-transform duration-300">⚡</span>
                <div>
                  <h4 className="text-xs font-extrabold text-brand-text group-hover:text-brand-primary transition-colors">Built for Speed</h4>
                  <p className="text-[11px] text-brand-text-muted mt-1 leading-relaxed">
                    Lightning-fast AST parsing combined with immediate Gemini Pro audit execution. Get feedback in seconds, not hours.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-xl hover:bg-white/[0.02] transition-colors group">
                <span className="text-2xl mt-0.5 group-hover:scale-110 transition-transform duration-300">🔒</span>
                <div>
                  <h4 className="text-xs font-extrabold text-brand-text group-hover:text-brand-primary transition-colors">Privacy by Design</h4>
                  <p className="text-[11px] text-brand-text-muted mt-1 leading-relaxed">
                    Zero persistent caching of anonymous scans and TLS encrypted pipes. Your source code and IP always remain 100% yours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs accordion */}
        <section id="faq" className="flex flex-col gap-10 max-w-3xl mx-auto w-full">
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-3xl font-extrabold text-brand-text">Frequently Asked Questions</h2>
            <p className="text-xs text-brand-text-muted">Answers to common structural and integration queries.</p>
          </div>

          <div className="flex flex-col gap-3.5">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="glass-panel rounded-xl border border-brand-border/10 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left py-4 px-5 flex justify-between items-center gap-4 text-xs font-bold text-brand-text hover:bg-white/5 transition-all outline-none cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <svg 
                    className={`w-4 h-4 text-brand-text-muted transition-transform duration-300 shrink-0 ${activeFaq === idx ? 'rotate-180' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <AnimatePresence initial={false}>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden bg-black/10"
                    >
                      <p className="p-5 text-xs text-brand-text-muted leading-relaxed border-t border-brand-border/5">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="glass-panel py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-brand-text-muted border-t border-brand-border/10 mt-16">
        <span>© 2026 DevInspect AI. All rights reserved. Built for professional developers.</span>
        <div className="flex gap-6">
          <a href="#privacy" className="hover:text-brand-text transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-brand-text transition-colors">Terms of Use</a>
          <a href="#docs" className="hover:text-brand-text transition-colors">API Documentation</a>
        </div>
      </footer>
    </div>
  );
}

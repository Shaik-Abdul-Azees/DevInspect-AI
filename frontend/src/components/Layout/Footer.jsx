// frontend/src/components/Layout/Footer.jsx


export default function Footer() {
  return (
    <footer className="glass-panel py-5 px-6 border-t border-brand-border/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-brand-text-muted transition-colors shrink-0">
      <span>© 2026 DevInspect AI. All rights reserved. Professional code review ecosystem.</span>
      <div className="flex gap-5">
        <a href="#privacy" className="hover:text-brand-secondary transition-colors">Privacy Policy</a>
        <a href="#terms" className="hover:text-brand-secondary transition-colors">Terms of Service</a>
        <a href="#docs" className="hover:text-brand-secondary transition-colors">API References</a>
      </div>
    </footer>
  );
}

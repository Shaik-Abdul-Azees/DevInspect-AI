import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="min-h-screen bg-brand-bg bg-grid-pattern relative overflow-hidden flex flex-col text-brand-text transition-colors duration-400">
      {/* Dynamic Aurora Glow Blurs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] aurora-blur-1 rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] aurora-blur-2 rounded-full pointer-events-none z-0"></div>

      {/* Floating Navbar Shell */}
      <div className="pt-4 px-4 md:px-6 relative z-40">
        <Navbar />
      </div>

      {/* Core shell body */}
      <div className="flex-1 flex relative z-10 overflow-hidden p-4 md:p-6 pt-4 gap-4 md:gap-6">
        {/* Navigation Sidebar (Floating Dock) */}
        <Sidebar />

        {/* Scrollable Sub-Pages Content Panel */}
        <main className="flex-1 flex flex-col overflow-y-auto rounded-2xl h-full pb-4">
          <div className="flex-1 w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
          
          {/* Section Footer */}
          <div className="mt-8">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';

const AppLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      setIsDesktopSidebarOpen((prev) => !prev);
    }
  };

  const closeSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar />

      <div className="flex-1 flex w-full relative">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          isDesktopOpen={isDesktopSidebarOpen}
          closeSidebar={closeSidebar}
        />

        {/* Desktop Spacer keeping content aligned beside fixed sidebar */}
        <div
          className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out ${
            isDesktopSidebarOpen ? 'w-64' : 'w-0'
          }`}
          aria-hidden="true"
        />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 pb-24 lg:pb-10 overflow-x-hidden min-w-0 transition-all duration-300">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Thumb-friendly app bar) */}
      <MobileBottomNav />

      {/* Global Clean Professional Footer */}
      <footer
        className={`bg-white border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-500 hidden lg:block transition-all duration-300 ${
          isDesktopSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <p className="font-medium">
            © {new Date().getFullYear()} Lost & Found Platform — Every Lost Item Deserves a Way Home.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
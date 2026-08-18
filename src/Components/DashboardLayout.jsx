import React, { useState } from 'react';
import SideNavbar from './SideNavbar';
import { Outlet } from 'react-router-dom';
import { Menu, Receipt } from 'lucide-react';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-white text-slate-800 min-h-screen font-sans">
      {/* Persistent Sidebar Navigation */}
      <SideNavbar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Dynamic Content Panel */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto bg-slate-50">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition cursor-pointer"
              title="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-slate-900 text-sm tracking-wide">Lakshara Fashions</span>
          </div>
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
            <Receipt className="w-4 h-4" />
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;

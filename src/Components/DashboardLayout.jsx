import React from 'react';
import SideNavbar from './SideNavbar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="flex bg-white text-slate-800 min-h-screen font-sans">
      {/* Persistent Sidebar Navigation */}
      <SideNavbar />

      {/* Dynamic Content Panel */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto bg-slate-50">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;

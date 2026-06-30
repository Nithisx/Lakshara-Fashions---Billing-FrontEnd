import React from 'react';
import { useAuth } from '../context/authContext';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings, LogOut, Receipt } from 'lucide-react';

const SideNavbar = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', end: true },
    { name: 'Invoices', icon: FileText, path: '/dashboard/invoices', end: false },
    { name: 'Clients', icon: Users, path: '/dashboard/clients', end: false }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between text-slate-300 font-sans h-screen sticky top-0 shrink-0">
      <div>
        {/* Brand / Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg text-white">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide leading-none">Lakshara Fashions</h1>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5 block">Enterprise</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5 mt-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                end={item.end}
                className={({ isActive }) => 
                  `w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 cursor-pointer group border ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/10 to-indigo-600/10 text-violet-400 border-violet-500/20'
                      : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 transition duration-200 ${
                      isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 px-2 py-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm">
            {user?.username?.substring(0, 2) || 'US'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-slate-200 truncate capitalize leading-tight">
              {user?.username || 'Guest User'}
            </h4>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {user?.email || 'guest@example.com'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-semibold border border-transparent hover:border-rose-500/20 transition duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default SideNavbar;

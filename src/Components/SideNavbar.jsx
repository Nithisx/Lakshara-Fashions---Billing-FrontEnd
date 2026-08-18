import React from 'react';
import { useAuth } from '../context/authContext';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings, LogOut, Receipt, ShoppingBag, X } from 'lucide-react';

const SideNavbar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', end: true },
    { name: 'Orders', icon: ShoppingBag, path: '/dashboard/orders', end: false },
    { name: 'Customers', icon: Users, path: '/dashboard/customers', end: false },
    { name: 'Invoices', icon: FileText, path: '/dashboard/invoices', end: false }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col justify-between text-slate-700 font-sans h-screen z-50 transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 shrink-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Brand / Logo */}
          <div className="p-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-950 tracking-wide leading-none">Lakshara Fashions</h1>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5 block">Enterprise</span>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-55 rounded-lg transition"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
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
                  onClick={onClose} // Auto-close drawer on link click on mobile
                  className={({ isActive }) => 
                    `w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 cursor-pointer group border ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-100/50'
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900 border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 transition duration-200 ${
                        isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
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
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 py-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm">
              {user?.username?.substring(0, 2) || 'US'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-slate-800 truncate capitalize leading-tight">
                {user?.username || 'Guest User'}
              </h4>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {user?.email || 'guest@example.com'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-semibold border border-slate-200 hover:border-rose-200 transition duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideNavbar;

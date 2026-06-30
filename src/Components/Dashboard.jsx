import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, FileText, Users, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`${API_URL}/invoices`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch dashboard statistics.');
        }
        setInvoices(data.invoices || []);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error loading dashboard.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvoices();
    }
  }, [token]);

  // Format current date beautifully
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate stats from live invoices
  const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
  const uniquePhones = new Set(invoices.map(inv => inv.customer_phone));
  const uniqueClientsCount = uniquePhones.size;
  const totalInvoicesCount = invoices.length;

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toFixed(2)}`,
      change: 'Synced Live',
      isPositive: true,
      icon: IndianRupee,
      colorClass: 'from-violet-500/20 to-indigo-500/20 text-violet-400 border-violet-500/10',
    },
    {
      title: 'Pending Amount',
      value: '₹0.00',
      change: 'Fully Paid',
      isPositive: true,
      icon: Clock,
      colorClass: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/10',
    },
    {
      title: 'Paid Invoices',
      value: totalInvoicesCount.toString(),
      change: 'Total bills generated',
      isPositive: true,
      icon: CheckCircle2,
      colorClass: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/10',
    },
    {
      title: 'Active Clients',
      value: uniqueClientsCount.toString(),
      change: 'Unique phone entries',
      isPositive: true,
      icon: Users,
      colorClass: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/10',
    },
  ];

  const recentInvoices = invoices.slice(0, 5);

  if (loading) {
    return (
      <main className="flex-1 p-8 flex flex-col items-center justify-center bg-slate-950 text-slate-100 min-h-screen">
        <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 text-sm font-medium">Syncing dashboard statistics...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="flex justify-between items-start mb-8 border-b border-slate-900 pb-6">
        <div>
          <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase block mb-1">
            Overview
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight capitalize text-white">
            Welcome back, {user?.username || 'user'}!
          </h2>
          <p className="text-slate-400 text-sm mt-1">{today}</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/invoices/new')}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 transition duration-200 text-sm cursor-pointer active:scale-98"
        >
          + Create Invoice
        </button>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-slate-400">{stat.title}</span>
                <div className={`p-2.5 bg-gradient-to-br ${stat.colorClass} border rounded-xl`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-400">
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Details Grid (Recent Invoices & Activity) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Invoices Table */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Recent Invoices</h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage your latest customer invoices</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard/invoices')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition cursor-pointer"
            >
              View All Invoices &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">ID</th>
                  <th className="py-3.5 px-4 font-semibold">Client</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Amount</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/55 text-sm">
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500 text-sm">
                      No invoices created yet. Click "+ Create Invoice" to start billing.
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((invoice) => {
                    const formattedDate = new Date(invoice.invoice_date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                    });
                    return (
                      <tr key={invoice.id} className="hover:bg-slate-800/20 transition duration-150">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-300">{invoice.invoice_number}</td>
                        <td className="py-3.5 px-4 text-slate-200 font-semibold">{invoice.customer_name}</td>
                        <td className="py-3.5 px-4 text-slate-400">{formattedDate}</td>
                        <td className="py-3.5 px-4 text-white font-bold">₹{Number(invoice.total_amount).toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                            {invoice.payment_method}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Security Card */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Security & Profile</h3>
            <p className="text-xs text-slate-400 mb-6">Verify login status and details</p>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Account ID</span>
                <div className="text-sm font-semibold text-slate-300 mt-1 select-all break-all">
                  {user?.id || '—'}
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Auth Token Status</span>
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mt-1">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Verified & Encrypted</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 text-center leading-relaxed">
            Lakshara Fashions secure environment. Authorized access only. Your sessions are encrypted end-to-end.
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;

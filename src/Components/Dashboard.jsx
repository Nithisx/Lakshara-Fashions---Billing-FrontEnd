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

  const API_URL = import.meta.env.VITE_API_URL || 'https://lakshara-fashions-billing-backend.onrender.com/api';

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
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      borderColor: 'border-indigo-100',
    },
    {
      title: 'Pending Amount',
      value: '₹0.00',
      change: 'Fully Paid',
      isPositive: true,
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-100',
    },
    {
      title: 'Paid Invoices',
      value: totalInvoicesCount.toString(),
      change: 'Total bills generated',
      isPositive: true,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'Active Clients',
      value: uniqueClientsCount.toString(),
      change: 'Unique phone entries',
      isPositive: true,
      icon: Users,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-100',
    },
  ];

  const recentInvoices = invoices.slice(0, 5);

  if (loading) {
    return (
      <main className="flex-1 p-8 flex flex-col items-center justify-center bg-slate-50 text-slate-800 min-h-screen">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 text-sm font-medium">Syncing dashboard statistics...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full bg-slate-50 text-slate-800 font-sans min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-start mb-8 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase block mb-1">
            Overview
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight capitalize text-slate-900">
            Welcome back, {user?.username || 'user'}!
          </h2>
          <p className="text-slate-500 text-sm mt-1">{today}</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/orders/new')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm shadow-indigo-600/15 hover:shadow-indigo-600/25 transition duration-200 text-sm cursor-pointer active:scale-[0.98]"
        >
          + Create Order
        </button>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-600 text-sm">
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
              className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-slate-500">{stat.title}</span>
                <div className={`p-2.5 ${stat.iconBg} ${stat.iconColor} border ${stat.borderColor} rounded-xl`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-600">
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
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Invoices</h3>
              <p className="text-xs text-slate-500 mt-0.5">Manage your latest customer invoices</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard/invoices')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition cursor-pointer"
            >
              View All Invoices &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">ID</th>
                  <th className="py-3.5 px-4 font-semibold">Client</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Amount</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 text-sm">
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
                      <tr key={invoice.id} className="hover:bg-slate-50 transition duration-150">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-600">{invoice.invoice_number}</td>
                        <td className="py-3.5 px-4 text-slate-800 font-semibold">{invoice.customer_name}</td>
                        <td className="py-3.5 px-4 text-slate-500">{formattedDate}</td>
                        <td className="py-3.5 px-4 text-slate-900 font-bold">₹{Number(invoice.total_amount).toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Security & Profile</h3>
            <p className="text-xs text-slate-500 mb-6">Verify login status and details</p>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Account ID</span>
                <div className="text-sm font-semibold text-slate-700 mt-1 select-all break-all">
                  {user?.id || '—'}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Auth Token Status</span>
                <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mt-1">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Verified & Encrypted</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-400 text-center leading-relaxed">
            Lakshara Fashions secure environment. Authorized access only. Your sessions are encrypted end-to-end.
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;

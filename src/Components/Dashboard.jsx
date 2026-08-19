import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import { DollarSign, FileText, Users, ArrowUpRight, Clock, CheckCircle2, AlertCircle, PlayCircle, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'https://lakshara-fashions-billing-backend.onrender.com/api';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [invoicesRes, ordersRes] = await Promise.all([
          fetch(`${API_URL}/invoices`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`${API_URL}/orders`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        if (!invoicesRes.ok || !ordersRes.ok) {
          throw new Error('Failed to fetch dashboard statistics.');
        }

        const invoicesData = await invoicesRes.json();
        const ordersData = await ordersRes.json();

        setInvoices(invoicesData.invoices || []);
        setOrders(ordersData.orders || []);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error loading dashboard.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Format current date beautifully
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate stats from live data
  const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
  const uniquePhones = new Set(invoices.map(inv => inv.customer_phone));
  const uniqueClientsCount = uniquePhones.size;
  const totalInvoicesCount = invoices.length;

  // Calculate order statuses
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const inProgressOrders = orders.filter(o => o.status === 'In Progress').length;
  const completedOrders = orders.filter(o => o.status === 'Completed').length;
  const totalOrdersCount = orders.length;

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      change: 'Synced Live',
      isPositive: true,
      icon: DollarSign,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      borderColor: 'border-indigo-100',
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
    {
      title: 'Total Orders',
      value: totalOrdersCount.toString(),
      change: 'Stitching track book',
      isPositive: true,
      icon: FileText,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-100',
    },
  ];

  const orderSummary = [
    {
      label: 'Pending Orders',
      count: pendingOrders,
      icon: Clock,
      colorClass: 'text-amber-600 bg-amber-50 border-amber-100',
      barColor: 'bg-amber-500'
    },
    {
      label: 'In Progress',
      count: inProgressOrders,
      icon: Loader2,
      colorClass: 'text-blue-600 bg-blue-50 border-blue-100',
      barColor: 'bg-blue-500'
    },
    {
      label: 'Completed',
      count: completedOrders,
      icon: CheckCircle2,
      colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      barColor: 'bg-emerald-500'
    }
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

      {/* Orders Status Summary Section */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">Orders Status Summary</h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time status tracking of custom orders in production</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {orderSummary.map((item, index) => {
            const Icon = item.icon;
            const percentage = totalOrdersCount > 0 ? (item.count / totalOrdersCount) * 100 : 0;
            return (
              <div key={index} className="border border-slate-100 rounded-xl p-5 hover:border-slate-200 transition duration-150 bg-slate-50/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-slate-650">{item.label}</span>
                  <div className={`p-2 rounded-lg border ${item.colorClass}`}>
                    <Icon className={`w-4 h-4 ${item.label === 'In Progress' && item.count > 0 ? 'animate-spin' : ''}`} />
                  </div>
                </div>
                <div>
                  <h4 className="text-3xl font-extrabold text-slate-900">{item.count}</h4>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className={`${item.barColor} h-1.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-2">
                    {percentage.toFixed(0)}% of total orders
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Details Grid (Recent Invoices & Activity) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Invoices Table */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6">
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
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Invoice Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4 text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                      No invoices created yet.
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((invoice) => {
                    const formattedDate = new Date(invoice.invoice_date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    });
                    return (
                      <tr key={invoice.id} className="hover:bg-slate-50 transition duration-150">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-600">{invoice.invoice_number}</td>
                        <td className="py-3.5 px-4 text-slate-800 font-semibold">{invoice.customer_name}</td>
                        <td className="py-3.5 px-4 text-slate-500">{formattedDate}</td>
                        <td className="py-3.5 px-4 text-slate-900 font-bold">${Number(invoice.total_amount).toFixed(2)}</td>
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
      </section>
    </main>
  );
};

export default Dashboard;

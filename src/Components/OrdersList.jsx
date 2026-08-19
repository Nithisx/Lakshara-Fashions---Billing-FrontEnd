import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, RefreshCw, AlertCircle, Calendar, Clock, PlayCircle, CheckCircle2, Wallet, PiggyBank, CreditCard } from 'lucide-react';

const OrdersList = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load orders.');
      }
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch orders archive.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  // Filter based on search query and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone?.includes(searchQuery);

    const matchesStatus =
      statusFilter === 'All' ? true : order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Summary counts by status
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const inProgressCount = orders.filter(o => o.status === 'In Progress').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;

  // Financial summary
  const totalOrderAmount = orders.reduce((sum, o) => sum + (parseFloat(o.stitching_price) || 0) * (o.quantity || 1), 0);
  const totalAdvancePaid = orders.reduce((sum, o) => sum + (parseFloat(o.advance_paid) || 0), 0);
  const totalBalanceDue = orders.reduce((sum, o) => sum + (parseFloat(o.balance_due) || 0), 0);

  const paymentCards = [
    {
      title: 'Total Amount',
      value: `$${totalOrderAmount.toFixed(2)}`,
      icon: Wallet,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      borderColor: 'border-indigo-100',
      textColor: 'text-indigo-700',
    },
    {
      title: 'Advance Paid',
      value: `$${totalAdvancePaid.toFixed(2)}`,
      icon: PiggyBank,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-100',
      textColor: 'text-emerald-700',
    },
    {
      title: 'Balance Due',
      value: `$${totalBalanceDue.toFixed(2)}`,
      icon: CreditCard,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      borderColor: 'border-rose-100',
      textColor: 'text-rose-700',
    },
  ];

  const summaryCards = [
    {
      title: 'Pending Orders',
      count: pendingCount,
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-100',
      textColor: 'text-amber-700',
      onClick: () => setStatusFilter('Pending'),
    },
    {
      title: 'In Progress',
      count: inProgressCount,
      icon: PlayCircle,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-100',
      textColor: 'text-blue-700',
      onClick: () => setStatusFilter('In Progress'),
    },
    {
      title: 'Completed Orders',
      count: completedCount,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-100',
      textColor: 'text-emerald-700',
      onClick: () => setStatusFilter('Completed'),
    },
  ];

  return (
    <main className="flex-1 p-4 md:p-8 w-full bg-slate-50 text-slate-800 font-sans min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase block mb-1">
            Production Track
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            Stitching & Custom Orders
          </h2>
          <p className="text-slate-500 text-sm mt-1">Track customization statuses, measurements profiles, and invoice links</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/orders/new')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm shadow-indigo-600/15 hover:shadow-indigo-600/25 transition duration-200 text-sm cursor-pointer active:scale-[0.98]"
        >
          + Create Order
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const filterStatus = card.title === 'Pending Orders' ? 'Pending' : card.title === 'In Progress' ? 'In Progress' : 'Completed';
          const isActive = statusFilter === filterStatus;
          return (
            <button
              key={card.title}
              onClick={card.onClick}
              className={`flex items-center justify-between bg-white border rounded-2xl p-5 text-left shadow-sm transition duration-200 cursor-pointer active:scale-[0.98] ${
                isActive ? `${card.borderColor} ring-2 ring-indigo-100` : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div>
                <p className={`text-xs font-bold tracking-wider uppercase ${card.textColor}`}>{card.title}</p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900">{card.count}</p>
              </div>
              <div className={`p-3 ${card.iconBg} ${card.iconColor} rounded-xl`}>
                <Icon className="w-6 h-6" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {paymentCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`flex items-center justify-between bg-white border ${card.borderColor} rounded-2xl p-5 shadow-sm`}
            >
              <div>
                <p className={`text-xs font-bold tracking-wider uppercase ${card.textColor}`}>{card.title}</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">{card.value}</p>
              </div>
              <div className={`p-3 ${card.iconBg} ${card.iconColor} rounded-xl`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar / Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders by customer name, phone, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 placeholder-slate-400 outline-none transition duration-200 text-sm"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          {/* Status selector buttons */}
          {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 transition cursor-pointer disabled:opacity-50"
            title="Reload Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error alert box */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-600 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders Table list */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 text-sm font-medium">Fetching orders records...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-4 text-slate-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-700">No Orders Found</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-sm">
              {searchQuery ? "No matches found for your filter. Try adjusting your search query." : "There are no orders in your boutique log yet. Click '+ Create Order' to start production."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50">
                  <th className="py-4 px-6 font-semibold">Order Number</th>
                  <th className="py-4 px-6 font-semibold">Client Name</th>
                  <th className="py-4 px-6 font-semibold">Service</th>
                  <th className="py-4 px-6 font-semibold">Delivery Date</th>
                  <th className="py-4 px-6 font-semibold text-center">Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Total</th>
                  <th className="py-4 px-6 font-semibold text-right">Advance</th>
                  <th className="py-4 px-6 font-semibold text-right">Balance Due</th>
                  <th className="py-4 px-6 font-semibold text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredOrders.map((order) => {
                  const formattedDate = new Date(order.delivery_date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                  return (
                    <tr 
                      key={order.id} 
                      onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                      className="hover:bg-slate-50/70 transition duration-150 group cursor-pointer"
                    >
                      {/* Order Number */}
                      <td className="py-4 px-6 font-mono font-medium text-slate-600 group-hover:text-indigo-600 transition">
                        {order.order_number}
                      </td>

                      {/* Customer Details */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800">{order.customer_name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{order.customer_phone}</div>
                      </td>

                      {/* Service Type */}
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          order.service_type === 'Stitching'
                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                            : 'bg-orange-50 text-orange-700 border-orange-100'
                        }`}>
                          {order.service_type}
                        </span>
                      </td>

                      {/* Delivery Date */}
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 text-slate-900 font-bold text-right">
                        ${(parseFloat(order.stitching_price) * order.quantity).toFixed(2)}
                      </td>

                      {/* Advance Paid */}
                      <td className="py-4 px-6 text-emerald-700 font-bold text-right">
                        ${(parseFloat(order.advance_paid) || 0).toFixed(2)}
                      </td>

                      {/* Balance Due */}
                      <td className="py-4 px-6 text-right">
                        <span className={`font-bold ${(parseFloat(order.balance_due) || 0) > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          ${(parseFloat(order.balance_due) || 0).toFixed(2)}
                        </span>
                      </td>

                      {/* Linked Invoice status */}
                      <td className="py-4 px-6 text-right">
                        {order.invoice_id ? (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                            Linked
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            No Bill
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default OrdersList;

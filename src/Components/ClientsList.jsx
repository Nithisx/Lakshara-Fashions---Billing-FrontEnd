import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { Users, Search, RefreshCw, AlertCircle, Phone, FileText, IndianRupee, TrendingUp, Sparkles } from 'lucide-react';

const ClientsList = () => {
  const { token } = useAuth();
  
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'https://lakshara-fashions-billing-backend.onrender.com/api';

  const fetchClients = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/invoices/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load clients.');
      }
      setClients(data.clients || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch customer records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [token]);

  // Filter clients based on search
  const filteredClients = clients.filter(c => {
    const term = searchQuery.toLowerCase();
    return (
      c.customer_name?.toLowerCase().includes(term) ||
      c.customer_phone?.toLowerCase().includes(term)
    );
  });

  // Calculate stats
  const totalUniqueClients = clients.length;
  const totalRevenue = clients.reduce((sum, c) => sum + parseFloat(c.total_spent), 0);
  const averageSpent = totalUniqueClients > 0 ? totalRevenue / totalUniqueClients : 0;
  
  // Find top spender client
  const topSpender = clients.length > 0 
    ? [...clients].sort((a, b) => parseFloat(b.total_spent) - parseFloat(a.total_spent))[0]
    : null;

  return (
    <main className="flex-1 p-4 md:p-8 w-full font-sans text-slate-800 bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase block mb-1">
            Customer Directory
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Client Base
          </h2>
          <p className="text-slate-500 text-sm mt-1">Unique shoppers and aggregated billing histories for Lakshara Fashions</p>
        </div>
      </header>

      {/* KPI Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Unique Clients */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition duration-200">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-slate-500">Unique Clients</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalUniqueClients}</h3>
            <p className="text-xs text-slate-400 mt-2">Shoppers identified by unique phone numbers</p>
          </div>
        </div>

        {/* Combined Value / Revenue */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition duration-200">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-slate-500">Total Customer Value</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">₹{totalRevenue.toFixed(2)}</h3>
            <p className="text-xs text-slate-400 mt-2">Combined orders value contribution</p>
          </div>
        </div>

        {/* Top Spender */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition duration-200">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-slate-500">Top Shopping Contributor</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight truncate capitalize">
              {topSpender ? topSpender.customer_name : 'No sales yet'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {topSpender ? `Spent ₹${parseFloat(topSpender.total_spent).toFixed(2)} across ${topSpender.total_orders} orders` : 'Aggregate top spender'}
            </p>
          </div>
        </div>
      </section>

      {/* Toolbar / Search */}
      <div className="flex gap-4 justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 placeholder-slate-400 outline-none transition duration-200 text-sm"
          />
        </div>
        
        <button
          onClick={fetchClients}
          disabled={loading}
          className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 transition cursor-pointer disabled:opacity-50"
          title="Reload Client Base"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error alert box */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-600 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Clients Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 text-sm font-medium">Loading unique customer records...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-4 text-slate-400">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-700">No Customers Found</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-sm">
              {searchQuery ? "No customer phone numbers match your search." : "No orders have been placed yet. Customers will automatically register here once their first order is saved."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50">
                  <th className="py-4 px-6 font-semibold">Client Name</th>
                  <th className="py-4 px-6 font-semibold">Phone Number</th>
                  <th className="py-4 px-6 font-semibold text-center">Total Invoices</th>
                  <th className="py-4 px-6 font-semibold text-right">Aggregate Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredClients.map((client, index) => {
                  const avatarInitial = client.customer_name?.substring(0, 2) || 'CS';
                  return (
                    <tr key={index} className="hover:bg-slate-50/70 transition duration-150">
                      {/* Name with Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                            {avatarInitial}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 capitalize">{client.customer_name}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Phone */}
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{client.customer_phone}</span>
                        </div>
                      </td>
                      
                      {/* Orders Count badge */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-full text-xs font-bold">
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span>{client.total_orders} {parseInt(client.total_orders, 10) === 1 ? 'Bill' : 'Bills'}</span>
                        </span>
                      </td>
                      
                      {/* Total Billing */}
                      <td className="py-4 px-6 text-right text-emerald-600 font-extrabold text-base">
                        ₹{parseFloat(client.total_spent).toFixed(2)}
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

export default ClientsList;

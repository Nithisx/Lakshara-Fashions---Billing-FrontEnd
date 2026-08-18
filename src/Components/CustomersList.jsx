import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import { Users, Search, RefreshCw, AlertCircle, Phone, Mail, MapPin, Plus } from 'lucide-react';

const CustomersList = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load customers.');
      }
      setCustomers(data.customers || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch customer directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [token]);

  // Filter based on search query
  const filteredCustomers = customers.filter((c) => {
    const term = searchQuery.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(term) ||
      c.phone_number?.includes(term) ||
      c.email?.toLowerCase().includes(term)
    );
  });

  return (
    <main className="flex-1 p-4 md:p-8 w-full bg-slate-50 text-slate-800 font-sans min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase block mb-1">
            Registry Index
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            Customer Directory
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage shopping profiles, phone records, and measurements links for boutique billing</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/customers/new')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm shadow-indigo-600/15 hover:shadow-indigo-600/25 transition duration-200 text-sm cursor-pointer active:scale-[0.98]"
        >
          + Add Customer
        </button>
      </header>

      {/* Toolbar */}
      <div className="flex gap-4 justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 placeholder-slate-400 outline-none transition duration-200 text-sm"
          />
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 transition cursor-pointer disabled:opacity-50"
          title="Reload Database"
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

      {/* Grid List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 text-sm font-medium">Loading customer profiles...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-4 text-slate-400">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-700">No Customers Registered</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-sm">
              {searchQuery ? "No search results match your criteria." : "Create customer entries so you can build orders and assign bills."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/dashboard/customers/new')}
                className="mt-4 inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border border-indigo-100"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Customer</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50">
                  <th className="py-4 px-6 font-semibold">Customer Name</th>
                  <th className="py-4 px-6 font-semibold">Contact Info</th>
                  <th className="py-4 px-6 font-semibold">Demographics</th>
                  <th className="py-4 px-6 font-semibold">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredCustomers.map((client) => {
                  const avatarInitial = client.full_name?.substring(0, 2) || 'CS';
                  return (
                    <tr key={client.id} className="hover:bg-slate-50/70 transition duration-150">
                      {/* Avatar & Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                            {avatarInitial}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 capitalize">{client.full_name}</div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest block mt-0.5">ID: {client.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Phone & Email */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{client.phone_number}</span>
                          </div>
                          {client.email && (
                            <div className="flex items-center gap-2 text-slate-500 text-xs">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{client.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Gender / Registered Date */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 text-slate-600">
                          <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {client.gender || 'Female'}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1">
                            Joined {new Date(client.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-4 px-6 text-slate-600 text-xs">
                        <div className="flex items-start gap-2 max-w-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <div>{client.address || '—'}</div>
                            {(client.city || client.state || client.postal_code) && (
                              <div className="text-slate-400 font-medium mt-0.5">
                                {[client.city, client.state, client.postal_code].filter(Boolean).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
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

export default CustomersList;

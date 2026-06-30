import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { printInvoice } from '../utils/printInvoice';
import { FileText, Search, Printer, AlertCircle, RefreshCw, Calendar, CreditCard, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InvoicesList = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchingInvoiceId, setFetchingInvoiceId] = useState(null); // tracking button load state

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/invoices`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load invoices.');
      }
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [token]);

  // Handle fetching details and printing
  const handlePrint = async (invoice) => {
    setFetchingInvoiceId(invoice.id);
    try {
      const response = await fetch(`${API_URL}/invoices/${invoice.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to retrieve invoice items.');
      }
      printInvoice(data.invoice, data.items);
    } catch (err) {
      alert(err.message || 'Error printing invoice.');
    } finally {
      setFetchingInvoiceId(null);
    }
  };

  // Filter invoices based on search
  const filteredInvoices = invoices.filter(inv => {
    const term = searchQuery.toLowerCase();
    return (
      inv.customer_name?.toLowerCase().includes(term) ||
      inv.invoice_number?.toLowerCase().includes(term) ||
      inv.customer_phone?.toLowerCase().includes(term)
    );
  });

  return (
    <main className="flex-1 p-8 max-w-7xl mx-auto w-full font-sans text-slate-100 bg-slate-950">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-900 pb-6">
        <div>
          <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase block mb-1">
            Billing Records
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Invoices History
          </h2>
          <p className="text-slate-400 text-sm mt-1">Review and download previous bills for Lakshara Fashions</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/invoices/new')}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 transition duration-200 text-sm cursor-pointer active:scale-98"
        >
          + Create Invoice
        </button>
      </header>

      {/* Toolbar / Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by customer, invoice ID, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 outline-none transition duration-200 text-sm"
          />
        </div>
        
        <button
          onClick={fetchInvoices}
          disabled={loading}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition cursor-pointer disabled:opacity-50"
          title="Reload Invoices"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error alert box */}
      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table list */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 text-sm font-medium">Fetching invoice archives...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl mb-4 text-slate-500">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-300">No Invoices Found</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm">
              {searchQuery ? "No matches found for your filter. Try adjusting your search query." : "There are no invoices in your system yet. Click '+ Create Invoice' to begin billing."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-900/60">
                  <th className="py-4 px-6 font-semibold">Invoice Number</th>
                  <th className="py-4 px-6 font-semibold">Customer Details</th>
                  <th className="py-4 px-6 font-semibold">Date</th>
                  <th className="py-4 px-6 font-semibold">Payment</th>
                  <th className="py-4 px-6 font-semibold">Total Bill</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-sm">
                {filteredInvoices.map((inv) => {
                  const formattedDate = new Date(inv.invoice_date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                  return (
                    <tr key={inv.id} className="hover:bg-slate-900/35 transition duration-150 group">
                      <td className="py-4 px-6 font-mono font-medium text-slate-200">
                        {inv.invoice_number}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-200">{inv.customer_name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{inv.customer_phone}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                          <span className="capitalize text-slate-300 font-medium">{inv.payment_method}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-white font-extrabold text-base">
                        ₹{Number(inv.total_amount).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handlePrint(inv)}
                          disabled={fetchingInvoiceId !== null}
                          className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-violet-600 hover:text-white text-slate-300 border border-slate-750 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition duration-200 disabled:opacity-50"
                        >
                          {fetchingInvoiceId === inv.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-indigo-500 rounded-full animate-spin"></div>
                          ) : (
                            <Printer className="w-3.5 h-3.5" />
                          )}
                          <span>Download / Print</span>
                        </button>
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

export default InvoicesList;

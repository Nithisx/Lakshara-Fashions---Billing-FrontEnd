import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { printInvoice } from '../utils/printInvoice';
import { FileText, Search, Printer, AlertCircle, RefreshCw, Calendar, CreditCard, ChevronRight, Copy, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WhatsAppIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
  </svg>
);

const InvoicesList = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchingInvoiceId, setFetchingInvoiceId] = useState(null); // tracking button load state
  const [copiedInvoiceId, setCopiedInvoiceId] = useState(null);

  const handleCopyLink = (invId, shareToken) => {
    if (!shareToken) {
      alert("No share link available for this invoice.");
      return;
    }
    const shareUrl = `${window.location.origin}/share/invoice/${shareToken}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopiedInvoiceId(invId);
        setTimeout(() => setCopiedInvoiceId(null), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy link: ', err);
      });
  };

  const getWhatsAppLink = (inv) => {
    const rawPhone = inv.customer_phone.trim();
    let phone = rawPhone.replace(/\D/g, ''); // strip all non-digits
    
    // If the user explicitly provided a "+" prefix, assume they provided the correct country code
    if (rawPhone.startsWith('+')) {
      // Use the stripped digits as-is (e.g. "+65 8322 9496" -> "6583229496")
    } else {
      // If it doesn't start with '+', apply heuristic rules
      if (phone.length === 10) {
        // Standard 10-digit number without country code, assume India (+91)
        phone = '91' + phone;
      } else if (phone.length === 11 && phone.startsWith('0')) {
        // 11-digit starting with 0, like "09876543210" -> strip 0 and prepend 91
        phone = '91' + phone.substring(1);
      }
    }
    
    const shareUrl = `${window.location.origin}/share/invoice/${inv.share_token}`;
    const message = `Hi ${inv.customer_name},\n\nThank you for shopping at Lakshara Fashions! 🙏\n\nYour invoice #${inv.invoice_number} is ready. You can view and download it here:\n${shareUrl}\n\nHave a great day! ✨`;
    
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const API_URL = import.meta.env.VITE_API_URL || 'https://lakshara-fashions-billing-backend.onrender.com/api';

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
    <main className="flex-1 p-4 md:p-8 w-full font-sans text-slate-800 bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase block mb-1">
            Billing Records
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Invoices History
          </h2>
          <p className="text-slate-500 text-sm mt-1">Review and download previous bills for Lakshara Fashions</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/invoices/new')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm shadow-indigo-600/15 hover:shadow-indigo-600/25 transition duration-200 text-sm cursor-pointer active:scale-[0.98]"
        >
          + Create Invoice
        </button>
      </header>

      {/* Toolbar / Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, invoice ID, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 placeholder-slate-400 outline-none transition duration-200 text-sm"
          />
        </div>
        
        <button
          onClick={fetchInvoices}
          disabled={loading}
          className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 transition cursor-pointer disabled:opacity-50"
          title="Reload Invoices"
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

      {/* Table list */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 text-sm font-medium">Fetching invoice archives...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-4 text-slate-400">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-700">No Invoices Found</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-sm">
              {searchQuery ? "No matches found for your filter. Try adjusting your search query." : "There are no invoices in your system yet. Click '+ Create Invoice' to begin billing."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50">
                  <th className="py-4 px-6 font-semibold">Invoice Number</th>
                  <th className="py-4 px-6 font-semibold">Customer Details</th>
                  <th className="py-4 px-6 font-semibold">Date</th>
                  <th className="py-4 px-6 font-semibold">Payment</th>
                  <th className="py-4 px-6 font-semibold">Total Bill</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredInvoices.map((inv) => {
                  const formattedDate = new Date(inv.invoice_date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition duration-150 group">
                      <td className="py-4 px-6 font-mono font-medium text-slate-600">
                        {inv.invoice_number}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800">{inv.customer_name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{inv.customer_phone}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          <span className="capitalize text-slate-600 font-medium">{inv.payment_method}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-900 font-extrabold text-base">
                        ${Number(inv.total_amount).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handlePrint(inv)}
                            disabled={fetchingInvoiceId !== null}
                            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 hover:border-indigo-200 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition duration-200 disabled:opacity-50"
                            title="Print or Save PDF"
                          >
                            {fetchingInvoiceId === inv.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                            ) : (
                              <Printer className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden sm:inline">Print</span>
                          </button>

                          <button
                            onClick={() => handleCopyLink(inv.id, inv.share_token)}
                            className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition duration-200 border ${
                              copiedInvoiceId === inv.id
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border-slate-200 hover:border-indigo-200'
                            }`}
                            title="Copy Share Link"
                          >
                            {copiedInvoiceId === inv.id ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedInvoiceId === inv.id ? 'Copied' : 'Share'}</span>
                          </button>

                          <a
                            href={getWhatsAppLink(inv)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition duration-200"
                            title="Share on WhatsApp"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                            <span>WhatsApp</span>
                          </a>

                          <a
                            href={`/share/invoice/${inv.share_token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition duration-200"
                            title="View Share Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
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

export default InvoicesList;

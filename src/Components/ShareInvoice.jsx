import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { printInvoice } from '../utils/printInvoice';
import { FileText, Printer, AlertCircle, Calendar, CreditCard, Copy, Check, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

const ShareInvoice = () => {
  const { shareToken } = useParams();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'https://lakshara-fashions-billing-backend.onrender.com/api';

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_URL}/invoices/share/${shareToken}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to retrieve invoice details.');
        }
        setInvoiceData(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error fetching invoice data. The link may have expired or is incorrect.');
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      fetchInvoice();
    }
  }, [shareToken]);

  const handleDownload = () => {
    if (invoiceData) {
      printInvoice(invoiceData.invoice, invoiceData.items);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 font-sans">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-600/15 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-500 font-medium text-sm tracking-wide">Loading Invoice Details...</p>
      </div>
    );
  }

  if (error || !invoiceData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="inline-flex p-3.5 bg-rose-50 border border-rose-100 rounded-2xl mb-4 text-rose-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Invoice Not Found</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            {error || "We couldn't retrieve the invoice details. Please double-check the URL or contact store support."}
          </p>
          <a
            href="/"
            className="inline-flex bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            Go to Portal
          </a>
        </div>
      </div>
    );
  }

  const { invoice, items } = invoiceData;
  const formattedDate = new Date(invoice.invoice_date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 md:px-8 font-sans antialiased">
      <div className="max-w-3xl mx-auto">
        
        {/* Action Header Panel */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Verified Invoice</p>
              <h3 className="text-sm font-semibold text-slate-800">Lakshara Fashions Secure Receipt</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyLink}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition duration-150 ${
                copied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Link' : 'Copy Link'}</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-sm shadow-indigo-600/10 transition duration-150"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Download Receipt</span>
            </button>
          </div>
        </div>

        {/* Invoice Main Visual Card */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          
          {/* Top Banner Accent */}
          <div className="h-1.5 bg-indigo-600"></div>

          {/* Header Section */}
          <div className="p-8 md:p-12 border-b border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                  Lakshara Fashions
                </h1>
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mt-1">
                  Premium Boutique & Apparel
                </p>
                
                {/* Store Metadata */}
                <div className="flex flex-col gap-1.5 mt-5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Cross Cut Road, Gandhipuram, Coimbatore</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>billing@laksharafashions.com</span>
                  </div>
                </div>
              </div>

              <div className="text-left md:text-right w-full md:w-auto mt-4 md:mt-0">
                <span className="inline-flex px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full mb-3">
                  PAID
                </span>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Invoice Number</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">#{invoice.invoice_number}</div>
              </div>
            </div>
          </div>

          {/* Details Overview Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</h3>
              <p className="text-base font-bold text-slate-900">{invoice.customer_name}</p>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{invoice.customer_phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Invoice Date</h3>
                <div className="flex items-center gap-2 text-sm text-slate-800 font-semibold">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{formattedDate}</span>
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Payment Method</h3>
                <div className="flex items-center gap-2 text-sm text-slate-800 font-semibold">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span className="uppercase">{invoice.payment_method}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="p-8 md:p-12">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Receipt Summary</h3>
            
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="pb-3 text-left w-12">#</th>
                    <th className="pb-3 text-left">Item Description</th>
                    <th className="pb-3 text-right w-20">Qty</th>
                    <th className="pb-3 text-right w-28">Price</th>
                    <th className="pb-3 text-right w-28">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {items.map((item, index) => (
                    <tr key={item.id} className="text-slate-700">
                      <td className="py-4 text-slate-400 font-mono">{index + 1}</td>
                      <td className="py-4 text-slate-900 font-semibold">{item.item_name}</td>
                      <td className="py-4 text-right font-mono">{item.quantity}</td>
                      <td className="py-4 text-right font-mono">₹{Number(item.unit_price).toFixed(2)}</td>
                      <td className="py-4 text-right font-bold text-slate-900 font-mono">₹{Number(item.total_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block sm:hidden space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col gap-1.5">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-slate-900 text-sm">{item.item_name}</div>
                    <span className="text-[10px] font-mono text-slate-400">#{index + 1}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <div>
                      <span className="font-mono">{item.quantity}</span> x ₹<span className="font-mono">{Number(item.unit_price).toFixed(2)}</span>
                    </div>
                    <div className="font-bold text-slate-900 font-mono">
                      ₹{Number(item.total_price).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Box */}
            <div className="flex justify-end mt-6 pt-6 border-t border-slate-100">
              <div className="w-full sm:w-64 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="font-mono text-slate-600">₹{Number(invoice.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <span className="text-base font-bold text-slate-900">Grand Total</span>
                  <span className="text-xl font-extrabold text-indigo-600 font-mono">₹{Number(invoice.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="p-8 bg-slate-50 border-t border-slate-100 text-center text-slate-400 text-[11px] leading-relaxed">
            <p className="font-bold text-slate-600 text-xs mb-1">Thank you for shopping at Lakshara Fashions!</p>
            <p>This is a digital system generated invoice. For any inquiries, please contact our retail outlet.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShareInvoice;

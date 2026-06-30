import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import { printInvoice } from '../utils/printInvoice';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Plus, Trash2, ArrowLeft, Download, ShoppingBag, CreditCard } from 'lucide-react';

const CreateInvoice = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Helper to generate a unique Invoice ID
  const generateInvoiceId = () => {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random
    return `LAK-${dateStr}-${randomNum}`;
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Form States
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoiceNumber] = useState(generateInvoiceId());
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Items State
  const [items, setItems] = useState([]);
  
  // Single Item Input States
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add Item to list
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemName) {
      alert('Please enter an item name.');
      return;
    }
    const qty = parseInt(quantity, 10);
    const price = parseFloat(unitPrice);
    if (isNaN(qty) || qty <= 0) {
      alert('Quantity must be greater than zero.');
      return;
    }
    if (isNaN(price) || price <= 0) {
      alert('Price must be greater than zero.');
      return;
    }

    const newItem = {
      id: Date.now(),
      item_name: itemName,
      quantity: qty,
      unit_price: price,
      total_price: qty * price
    };

    setItems([...items, newItem]);
    
    // Reset Inputs
    setItemName('');
    setQuantity(1);
    setUnitPrice('');
  };

  // Remove Item from list
  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Calculate Total Bill
  const totalBill = items.reduce((sum, item) => sum + item.total_price, 0);

  // Submit Invoice to backend and open download/print window
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerName) {
      setError('Customer name is required.');
      return;
    }
    if (!customerPhone) {
      setError('Customer phone number is required.');
      return;
    }
    if (items.length === 0) {
      setError('At least one item must be added to the invoice.');
      return;
    }

    setLoading(true);

    const payload = {
      invoice_number: invoiceNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      invoice_date: invoiceDate,
      payment_method: paymentMethod,
      total_amount: totalBill,
      items: items.map(({ item_name, quantity, unit_price }) => ({
        item_name,
        quantity,
        unit_price
      }))
    };

    try {
      const response = await fetch(`${API_URL}/invoices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save invoice.');
      }

      // Successful DB save. Open printing window for Lakshara Fashions
      printInvoice(data.invoice, items);

      // Navigate back to history
      navigate('/dashboard/invoices');

    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while saving the invoice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 p-8 max-w-5xl mx-auto w-full font-sans text-slate-100 bg-slate-950">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/invoices')}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition text-sm mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Invoices</span>
      </button>

      {/* Header */}
      <header className="mb-8 border-b border-slate-900 pb-6">
        <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase block mb-1">
          POS Billing Terminal
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Create New Invoice
        </h2>
        <p className="text-slate-400 text-sm mt-1">Generate receipts for Lakshara Fashions boutique store</p>
      </header>

      {/* Error alert box */}
      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Core Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Customer & Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white mb-3">Customer Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-white placeholder-slate-600 outline-none transition text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Customer Phone / Mobile
                </label>
                <input
                  type="tel"
                  placeholder="Enter number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-white placeholder-slate-600 outline-none transition text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Add Item Panel */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl">
            <h3 className="text-base font-bold text-white mb-4">Add Clothes / Apparel Items</h3>
            
            <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Item Description / Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Silk Saree, Designer Kurti"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-white placeholder-slate-600 outline-none transition text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-white outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Unit Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-indigo-500 rounded-xl py-2.5 pl-8 pr-4 text-white placeholder-slate-600 outline-none transition text-sm"
                  />
                </div>
              </div>

              <div className="md:col-span-4 flex justify-end mt-2">
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 font-semibold px-5 py-2.5 rounded-xl border border-slate-750 flex items-center gap-2 cursor-pointer text-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item to List</span>
                </button>
              </div>
            </form>
          </div>

          {/* Items Summary Table */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-850">
              <h3 className="text-base font-bold text-white">Itemized Inventory</h3>
            </div>
            
            {items.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No items added. Fill out description, quantity, price and click Add Item above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-400 text-xs font-bold uppercase bg-slate-950/20">
                      <th className="py-3 px-6">Description</th>
                      <th className="py-3 px-6 text-center">Qty</th>
                      <th className="py-3 px-6 text-right">Price</th>
                      <th className="py-3 px-6 text-right">Total</th>
                      <th className="py-3 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-sm">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/20">
                        <td className="py-3.5 px-6 font-medium text-slate-200">{item.item_name}</td>
                        <td className="py-3.5 px-6 text-center text-slate-400">{item.quantity}</td>
                        <td className="py-3.5 px-6 text-right text-slate-400">₹{item.unit_price.toFixed(2)}</td>
                        <td className="py-3.5 px-6 text-right text-white font-semibold">₹{item.total_price.toFixed(2)}</td>
                        <td className="py-3.5 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-rose-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Metadata & Action Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl space-y-5">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Invoice Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Invoice Number
                </label>
                <div className="bg-slate-950 border border-slate-850 text-slate-300 rounded-xl py-2 px-3 text-sm font-mono select-all">
                  {invoiceNumber}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Billing Date
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl py-2 px-3 text-slate-300 outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 text-slate-300 outline-none transition text-sm appearance-none cursor-pointer"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI / GPay</option>
                    <option value="NetBanking">Net Banking</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Calculations */}
            <div className="border-t border-slate-800 pt-5 space-y-3.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Items</span>
                <span className="font-semibold text-slate-200">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tax / GST</span>
                <span className="font-semibold text-emerald-500">₹0.00 (Incl.)</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-3.5">
                <span className="text-base font-bold text-white">Grand Total</span>
                <span className="text-xl font-black text-violet-400">₹{totalBill.toFixed(2)}</span>
              </div>
            </div>

            {/* Save & Print Trigger */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-98 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Save & Print Invoice</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </main>
  );
};

export default CreateInvoice;

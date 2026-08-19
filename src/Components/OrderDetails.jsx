import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useParams, useNavigate } from "react-router-dom";
import { printInvoice } from "../utils/printInvoice";
import {
  ArrowLeft,
  Calendar,
  User,
  Ruler,
  FileText,
  Printer,
  Check,
  Copy,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  ExternalLink,
  RefreshCw,
  Eye,
} from "lucide-react";

const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
  </svg>
);

const OrderDetails = () => {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Invoice creation state
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  // Advance payment state
  const [advanceInput, setAdvanceInput] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentSavedMsg, setPaymentSavedMsg] = useState("");

  // List of expanded item index keys for measurements viewer
  const [expandedItemIndices, setExpandedItemIndices] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load order details.");
      }
      setOrder(data.order);
      setAdvanceInput(
        data.order.advance_paid != null ? String(data.order.advance_paid) : "",
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Error fetching order details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    setSavingPayment(true);
    setPaymentSavedMsg("");
    const advance = parseFloat(advanceInput);
    if (isNaN(advance) || advance < 0) {
      alert("Please enter a valid advance paid amount.");
      setSavingPayment(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/orders/${id}/payment`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ advance_paid: advance }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update payment.");
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err.message || "Error updating payment.");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update status.");
      }
      setOrder((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error(err);
      alert(err.message || "Error updating order status.");
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id, token]);

  const toggleExpandItem = (idx) => {
    setExpandedItemIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const generateInvoiceId = () => {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random
    return `LAK-${dateStr}-${randomNum}`;
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    setGeneratingInvoice(true);
    setError("");

    const invoiceNum = generateInvoiceId();
    const orderItems =
      typeof order.items === "string"
        ? JSON.parse(order.items)
        : order.items || [];

    const invoicePayload = {
      invoice_number: invoiceNum,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      invoice_date: new Date().toISOString().split("T")[0],
      payment_method: paymentMethod,
      total_amount: parseFloat(order.stitching_price) * order.quantity,
      advance_paid: parseFloat(order.advance_paid) || 0,
      balance_due: parseFloat(order.balance_due) || 0,
      items: orderItems.map((item) => ({
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: parseFloat(item.price),
        measurements: item.measurements || {},
      })),
    };

    try {
      // 1. Create Invoice record in DB
      const invoiceResponse = await fetch(`${API_URL}/invoices`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoicePayload),
      });

      const invoiceData = await invoiceResponse.json();

      if (!invoiceResponse.ok) {
        throw new Error(invoiceData.error || "Failed to generate invoice.");
      }

      const createdInvoice = invoiceData.invoice;

      // 2. Link Invoice to Order
      const linkResponse = await fetch(`${API_URL}/orders/${id}/invoice`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoice_id: createdInvoice.id }),
      });

      if (!linkResponse.ok) {
        const linkData = await linkResponse.json();
        throw new Error(linkData.error || "Failed to link invoice to order.");
      }

      // 3. Print Invoice using custom utility
      const invoiceItems = orderItems.map((item) => ({
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: parseFloat(item.price),
        total_price: item.price * item.quantity,
        service_type: item.service_type,
        measurements: item.measurements,
      }));

      printInvoice(createdInvoice, invoiceItems, {
        orderNumber: order.order_number,
        collectionDate: order.delivery_date,
        garmentType: orderItems[0]?.service_type,
        notes: order.special_instructions,
      });

      // Refresh order details page to show linked invoice status
      await fetchOrderDetails();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error generating invoice.");
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handlePrintExistingInvoice = async () => {
    if (!order.invoice_id) return;
    try {
      const response = await fetch(`${API_URL}/invoices/${order.invoice_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load invoice items.");
      }
      printInvoice(data.invoice, data.items);
    } catch (err) {
      alert(err.message || "Error printing invoice.");
    }
  };

  const handleCopyLink = () => {
    if (!order.linked_invoice_share_token) return;
    const shareUrl = `${window.location.origin}/share/invoice/${order.linked_invoice_share_token}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopiedInvoice(true);
        setTimeout(() => setCopiedInvoice(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const getWhatsAppLink = () => {
    if (!order.linked_invoice_share_token) return "";
    const rawPhone = order.customer_phone.trim();
    let phone = rawPhone.replace(/\D/g, "");
    if (rawPhone.startsWith("+")) {
      // Use as-is
    } else {
      if (phone.length === 10) phone = "91" + phone;
      else if (phone.length === 11 && phone.startsWith("0"))
        phone = "91" + phone.substring(1);
    }
    const shareUrl = `${window.location.origin}/share/invoice/${order.linked_invoice_share_token}`;
    const message = `Hi ${order.customer_name},\n\nThank you for choosing Lakshara Fashions! 🙏\n\nYour invoice #${order.linked_invoice_number} is ready. You can view and download it here:\n${shareUrl}\n\nHave a great day! ✨`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <main className="flex-1 p-8 flex flex-col items-center justify-center bg-slate-50 text-slate-800 min-h-screen">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 text-sm font-medium">
          Loading order details...
        </p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex-1 p-8 max-w-md mx-auto flex flex-col items-center justify-center bg-slate-50 text-slate-800 min-h-screen text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Order Not Found</h3>
        <p className="text-slate-500 text-sm mt-2">
          {error || "This order does not exist or has been removed."}
        </p>
        <button
          onClick={() => navigate("/dashboard/orders")}
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-xl text-sm transition"
        >
          Return to Orders List
        </button>
      </main>
    );
  }

  // Parse items from JSON
  const orderItemsList =
    typeof order.items === "string"
      ? JSON.parse(order.items)
      : order.items || [];
  const deliveryFormatted = new Date(order.delivery_date).toLocaleDateString(
    "en-IN",
    { day: "2-digit", month: "long", year: "numeric" },
  );
  const trialFormatted = order.trial_date
    ? new Date(order.trial_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";
  const clothImagesList = order.cloth_images
    ? order.cloth_images.split("||")
    : [];

  return (
    <main className="flex-1 p-4 md:p-8 w-full bg-slate-50 text-slate-800 font-sans min-h-screen">
      {/* Back Button */}
      <div className="w-full mb-6">
        <button
          onClick={() => navigate("/dashboard/orders")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders List</span>
        </button>
      </div>

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-200 pb-6 w-full">
        <div>
          <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase block mb-1">
            Order ID: {order.order_number}
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {order.customer_name}'s Order Details
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Stitching configurations, specifications, reference images, and
            billing status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Status:
            </span>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none transition cursor-pointer hover:border-slate-350"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-extrabold border uppercase ${
              order.status === "Pending"
                ? "bg-amber-50 text-amber-705 border-amber-200"
                : order.status === "In Progress"
                  ? "bg-blue-50 text-blue-705 border-blue-200"
                  : "bg-emerald-50 text-emerald-705 border-emerald-200"
            }`}
          >
            {order.status}
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Detail Panel */}
        <div className="lg:col-span-8 space-y-6">
          {/* Customer Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Client Profile
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                  Full Name
                </span>
                <span className="font-semibold text-slate-850 block mt-0.5 capitalize">
                  {order.customer_name}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                  Phone Number
                </span>
                <span className="font-semibold text-slate-850 block mt-0.5">
                  {order.customer_phone}
                </span>
              </div>

              {order.customer_email && (
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Email Address
                  </span>
                  <span className="font-semibold text-slate-850 block mt-0.5">
                    {order.customer_email}
                  </span>
                </div>
              )}

              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                  Gender Profile
                </span>
                <span className="font-semibold text-slate-850 block mt-0.5">
                  {order.customer_gender || "Female"}
                </span>
              </div>

              {order.customer_address && (
                <div className="md:col-span-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Address
                  </span>
                  <span className="font-medium text-slate-650 block mt-1 leading-relaxed">
                    {order.customer_address}
                    {(order.customer_city ||
                      order.customer_state ||
                      order.customer_postal_code) && (
                      <span className="block text-slate-400 text-xs mt-0.5">
                        {[
                          order.customer_city,
                          order.customer_state,
                          order.customer_postal_code,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Items & Measurements List */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <span>Stitching Order Items ({orderItemsList.length})</span>
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50">
                    <th className="py-2.5 px-4">Item Description</th>
                    <th className="py-2.5 px-4 text-center">Service</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                    <th className="py-2.5 px-4 text-right">Measurements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {orderItemsList.map((item, idx) => (
                    <React.Fragment key={item.id || idx}>
                      <tr className="hover:bg-slate-50/50 text-xs">
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {item.item_name}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              item.service_type === "Stitching"
                                ? "bg-purple-50 text-purple-700 border-purple-100"
                                : "bg-orange-50 text-orange-700 border-orange-100"
                            }`}
                          >
                            {item.service_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-600">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">
                          ${parseFloat(item.price).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => toggleExpandItem(idx)}
                            className="text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>
                              {expandedItemIndices[idx]
                                ? "Hide"
                                : "Show Measurements"}
                            </span>
                          </button>
                        </td>
                      </tr>
                      {/* Measurements viewer row */}
                      {expandedItemIndices[idx] && (
                        <tr>
                          <td
                            colSpan="6"
                            className="bg-slate-50/50 p-4 border-t border-slate-100"
                          >
                            <div className="text-xs space-y-2">
                              <span className="font-bold text-slate-650 uppercase tracking-wider block">
                                Measurements Parameters:
                              </span>
                              {!item.measurements ||
                              Object.keys(item.measurements).length === 0 ? (
                                <p className="text-slate-400 italic text-[11px]">
                                  No measurements configured for this item.
                                </p>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {Object.entries(item.measurements).map(
                                    ([key, val]) => (
                                      <div
                                        key={key}
                                        className="bg-white border border-slate-200 p-2.5 rounded-lg"
                                      >
                                        <span className="text-[9px] text-slate-400 uppercase font-bold block">
                                          {key}
                                        </span>
                                        <span className="font-extrabold text-slate-800">
                                          {val}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reference Images */}
          {clothImagesList.length > 0 && (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Uploaded Reference Cloth Images
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {clothImagesList.map((img, index) => (
                  <a
                    href={img}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={index}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 block"
                  >
                    <img
                      src={img}
                      alt="cloth preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold">
                      View Full Size
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {(order.special_instructions || order.inspiration_link) && (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Order Specifications
              </h3>

              <div className="space-y-4 text-sm">
                {order.inspiration_link && (
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                      Inspiration Link
                    </span>
                    <a
                      href={order.inspiration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline mt-1 inline-flex items-center gap-1 text-sm"
                    >
                      <span>ilink</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {order.special_instructions && (
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                      Special Instructions
                    </span>
                    <p className="text-slate-650 mt-1.5 leading-relaxed bg-slate-50 border border-slate-200 p-3 rounded-xl whitespace-pre-wrap">
                      {order.special_instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar actions / Invoice details (4 columns wide on desktop) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Timeline & Price summary card */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Scheduling timelines
            </h3>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Date</span>
                <span className="font-semibold text-slate-800">
                  {deliveryFormatted}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trial Date</span>
                <span className="font-semibold text-slate-800">
                  {trialFormatted}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3">
                <span className="text-slate-500">Total Pieces</span>
                <span className="font-semibold text-slate-800">
                  {order.quantity}
                </span>
              </div>
              {order.price_breakup && (
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Pricing Breakdown Details
                  </span>
                  <p className="text-xs text-slate-500 bg-slate-50 p-2 border border-slate-100 rounded-lg whitespace-pre-wrap">
                    {order.price_breakup}
                  </p>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-3.5">
                <span className="font-bold text-slate-900 text-base">
                  Grand Total
                </span>
                <span className="text-xl font-black text-indigo-600">
                  $
                  {(parseFloat(order.stitching_price) * order.quantity).toFixed(
                    2,
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Advance Paid</span>
                <span className="font-bold text-emerald-600">
                  ${(parseFloat(order.advance_paid) || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Balance Due</span>
                <span
                  className={`font-bold ${(parseFloat(order.balance_due) || 0) > 0 ? "text-rose-600" : "text-slate-400"}`}
                >
                  ${(parseFloat(order.balance_due) || 0).toFixed(2)}
                </span>
              </div>

              {/* Advance payment editor */}
              <form
                onSubmit={handleSavePayment}
                className="border-t border-slate-100 pt-3.5 space-y-2"
              >
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Update Advance Paid
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={advanceInput}
                    onChange={(e) => setAdvanceInput(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-800 outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={savingPayment}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {savingPayment ? "Saving..." : "Save"}
                  </button>
                </div>
                {paymentSavedMsg && (
                  <p className="text-[11px] font-semibold text-emerald-600">
                    {paymentSavedMsg}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Invoice generation OR linked invoice details card */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Boutique Invoice
            </h3>

            {order.invoice_id ? (
              // Display details of linked invoice
              <div className="space-y-4">
                <div className="bg-emerald-50 text-emerald-850 border border-emerald-200 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider block">
                    Linked Invoice
                  </span>
                  <span className="text-sm font-mono font-bold block mt-1">
                    {order.linked_invoice_number}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handlePrintExistingInvoice}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print/PDF Receipt</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className={`w-full flex items-center justify-center gap-2 border py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                      copiedInvoice
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-750"
                    }`}
                  >
                    {copiedInvoice ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span>
                      {copiedInvoice ? "Link Copied" : "Copy Invoice URL"}
                    </span>
                  </button>

                  {order.linked_invoice_share_token && (
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition"
                    >
                      <WhatsAppIcon className="w-4 h-4 text-emerald-650 fill-emerald-655" />
                      <span>WhatsApp Share</span>
                    </a>
                  )}

                  {order.linked_invoice_share_token && (
                    <a
                      href={`/share/invoice/${order.linked_invoice_share_token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 py-2 rounded-xl text-[11px] font-medium transition"
                    >
                      <span>View Invoice Share Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              // Display creator form to generate invoice
              <form onSubmit={handleGenerateInvoice} className="space-y-4">
                <span className="text-xs text-slate-500 leading-relaxed block">
                  This order has {orderItemsList.length} item(s) ready for
                  invoicing. Select a payment method below to build and print
                  the receipt:
                </span>

                {/* Payment mode selector */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1.5">
                    Payment Mode
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 text-slate-700 outline-none transition text-xs appearance-none cursor-pointer"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI / GPay</option>
                      <option value="NetBanking">Net Banking</option>
                    </select>
                  </div>
                </div>

                {/* Generate trigger */}
                <button
                  type="submit"
                  disabled={generatingInvoice}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
                >
                  {generatingInvoice ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span>
                    {generatingInvoice
                      ? "Generating Invoice..."
                      : "Generate Invoice & Print"}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderDetails;

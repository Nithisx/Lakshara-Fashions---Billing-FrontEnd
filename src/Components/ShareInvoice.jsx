import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  SHEET_CSS,
  buildSheetContent,
  printInvoice,
} from "../utils/printInvoice";
import { Printer, AlertCircle, Copy, Check } from "lucide-react";

const ShareInvoice = () => {
  const { shareToken } = useParams();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const API_URL =
      import.meta.env.VITE_API_URL ||
      "https://lakshara-fashions-billing-backend.onrender.com/api";

    const fetchInvoice = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_URL}/invoices/share/${shareToken}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to retrieve invoice details.");
        }
        setInvoiceData(data);
      } catch (err) {
        console.error(err);
        setError(
          err.message ||
            "Error fetching invoice data. The link may have expired or is incorrect.",
        );
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
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E9E2D3] flex flex-col items-center justify-center text-slate-800 font-sans">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#7A1E2C]/15 border-t-[#7A1E2C] rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-500 font-medium text-sm tracking-wide">
          Loading Invoice Details...
        </p>
      </div>
    );
  }

  if (error || !invoiceData) {
    return (
      <div className="min-h-screen bg-[#E9E2D3] flex items-center justify-center p-6 text-slate-800 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="inline-flex p-3.5 bg-rose-50 border border-rose-100 rounded-2xl mb-4 text-rose-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Invoice Not Found
          </h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            {error ||
              "We couldn't retrieve the invoice details. Please double-check the URL or contact store support."}
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

  return (
    <div className="min-h-screen bg-[#E9E2D3] py-8 px-4 md:px-8 font-sans antialiased flex justify-center">
      <style>{SHEET_CSS}</style>

      <div className="w-full max-w-[900px]">
        {/* Action Toolbar */}
        <div className="sticky top-3 z-20 mb-6 rounded-[20px] border border-[#E4D9C4] bg-[#FAF6EF]/95 px-4 py-3 shadow-[0_12px_30px_rgba(33,24,18,0.08)] backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E4D9C4] bg-[#F8F0EA] shadow-inner shadow-[#7A1E2C]/5">
                <img
                  src="/logo.png"
                  alt="Lakshara Fashion Logo"
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[9px] font-semibold uppercase tracking-[2px] text-[#A9812F]">
                  Bespoke Tailoring &amp; Sarees
                </p>
                <p className="truncate text-sm font-semibold text-[#211812] sm:text-[15px]">
                  Lakshara Fashion (S) Pte Ltd
                  <span className="ml-2 text-[#7A1E2C]">
                    {invoice.invoice_number}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex w-full items-center gap-2.5 sm:w-auto">
              <button
                onClick={handleCopyLink}
                className={`group flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-[11px] font-semibold tracking-[0.08em] uppercase cursor-pointer transition-all duration-150 active:scale-[0.97] ${
                  copied
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-[#E4D9C4] bg-white text-[#55483D] hover:border-[#A9812F] hover:text-[#211812] hover:shadow-sm"
                }`}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F4E7E3] text-[#7A1E2C] transition-colors duration-150 group-hover:bg-[#7A1E2C] group-hover:text-white">
                    <Copy className="h-3.5 w-3.5" />
                  </span>
                )}
                <span>{copied ? "Link Copied!" : "Copy Link"}</span>
              </button>

              <button
                onClick={handleDownload}
                className="group flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#7A1E2C] px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_10px_20px_rgba(122,30,44,0.22)] transition-all duration-150 hover:bg-[#611725] hover:shadow-[0_12px_22px_rgba(122,30,44,0.28)] active:scale-[0.97]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15 transition-colors duration-150 group-hover:bg-white/25">
                  <Printer className="h-3.5 w-3.5" />
                </span>
                <span>Download Receipt</span>
              </button>
            </div>
          </div>
        </div>

        {/* The invoice sheet — centered on the page; identical markup & styles to the print version */}
        <div className="overflow-x-auto pb-6 flex justify-center">
          <div className="min-w-[210mm] flex justify-center">
            <div
              style={{ width: "210mm" }}
              className="shadow-xl shadow-[#211812]/15"
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: buildSheetContent(invoice, items),
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareInvoice;

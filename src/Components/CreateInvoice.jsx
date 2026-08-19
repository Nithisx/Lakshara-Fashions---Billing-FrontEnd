import React, { useState } from "react";
import { useAuth } from "../context/authContext";
import { printInvoice } from "../utils/printInvoice";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";

const measurementFields = {
  left: [
    "Length",
    "Shoulder",
    "Sleeve Length",
    "Sleeve Round",
    "Chest / Bust",
    "Waist",
    "Hip",
  ],
  right: [
    "Neck",
    "Armhole",
    "Front Neck",
    "Back Neck",
    "Petticoat Length",
    "Petticoat Waist",
    "Blouse Back Length",
  ],
};

const createMeasurementState = () => ({
  ...Object.fromEntries(measurementFields.left.map((key) => [key, ""])),
  ...Object.fromEntries(measurementFields.right.map((key) => [key, ""])),
});

const createBlankRow = (id) => ({
  id,
  item_name: "",
  quantity: "",
  unit_price: "",
  total_price: 0,
  measurements: createMeasurementState(),
});

const CreateInvoice = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const generateInvoiceId = () => {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `LAK-${dateStr}-${randomNum}`;
  };

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://lakshara-fashions-billing-backend.onrender.com/api";

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [invoiceNumber] = useState(generateInvoiceId());
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [advancePaid, setAdvancePaid] = useState("");
  const [items, setItems] = useState(
    [1, 2, 3, 4, 5].map((id) => createBlankRow(id)),
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateItem = (id, field, value) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;

        const nextItem = { ...item, [field]: value };
        const qty = Number(nextItem.quantity) || 0;
        const price = Number(nextItem.unit_price) || 0;
        nextItem.total_price = qty * price;

        return nextItem;
      }),
    );
  };

  const updateItemMeasurement = (id, field, value) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          measurements: {
            ...item.measurements,
            [field]: value,
          },
        };
      }),
    );
  };

  const addRow = () => {
    setItems((current) => [...current, createBlankRow(Date.now())]);
  };

  const removeLastRow = () => {
    setItems((current) =>
      current.length > 1 ? current.slice(0, -1) : current,
    );
  };

  const totalBill = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    return sum + qty * price;
  }, 0);

  const parsedAdvancePaid = Number(advancePaid || 0);
  const balanceDue = Math.max(totalBill - parsedAdvancePaid, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (!customerPhone.trim()) {
      setError("Customer phone number is required.");
      return;
    }

    const validItems = [];
    for (const item of items) {
      const itemName = item.item_name?.trim();
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price) || 0;

      if (!itemName && !quantity && !unitPrice) {
        continue;
      }

      if (!itemName) {
        setError("Each invoice line must include a description.");
        return;
      }

      if (quantity <= 0 || unitPrice <= 0) {
        setError(
          "Quantity and price must be greater than zero for each line item.",
        );
        return;
      }

      validItems.push({
        item_name: itemName,
        quantity,
        unit_price: unitPrice,
        total_price: quantity * unitPrice,
        measurements: item.measurements || createMeasurementState(),
      });
    }

    if (validItems.length === 0) {
      setError("At least one valid item must be added to the invoice.");
      return;
    }

    setLoading(true);

    const payload = {
      invoice_number: invoiceNumber,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      invoice_date: invoiceDate,
      payment_method: "Cash",
      total_amount: totalBill,
      advance_paid: parsedAdvancePaid,
      balance_due: balanceDue,
      items: validItems.map(
        ({ item_name, quantity, unit_price, measurements }) => ({
          item_name,
          quantity,
          unit_price,
          measurements,
        }),
      ),
    };

    try {
      const response = await fetch(`${API_URL}/invoices`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save invoice.");
      }

      printInvoice(data.invoice, validItems);

      navigate("/dashboard/invoices");
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while saving the invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#ebebeb] p-4 md:p-8">
      <div className="mx-auto max-w-[1280px]">
        <button
          type="button"
          onClick={() => navigate("/dashboard/invoices")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </button>

        <div className="mx-auto max-w-[1120px] rounded-[8px] border-[3px] border-black bg-white shadow-[0_0_0_3px_rgba(0,0,0,0.08)]">
          <div className="flex items-start gap-5 border-b border-black px-6 py-4">
            <div className="flex h-[118px] w-[118px] items-center justify-center rounded-full border-[4px] border-black bg-white shadow-[0_0_0_4px_#1ca15d]">
              <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-[3px] border-black bg-[#f3f3f3] text-[52px] font-black italic text-black">
                L
              </div>
            </div>

            <div className="flex-1 text-center">
              <h1 className="font-serif text-[clamp(2rem,2.8vw,3.3rem)] font-black leading-none tracking-tight text-black">
                Lakshara Fashion (S) Pte Ltd
              </h1>
              <p className="mt-3 font-serif text-[13px] italic text-black md:text-[15px]">
                Little India Arcade, 48 Serangoon Rd,
                <br /># 01 - 63, Singapore 217959 @ 8225 1605
              </p>
            </div>
          </div>

          <div className="grid border-b border-black md:grid-cols-[1.7fr_1fr]">
            <div className="space-y-4 border-r border-black p-4 md:p-5">
              <div className="flex items-center gap-3 text-[17px] font-bold text-black md:text-[18px]">
                <span className="min-w-[170px]">Customer Name :</span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="..............................."
                  className="w-full border-0 border-b border-black bg-transparent px-1 py-1 text-black placeholder:text-black/70 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 text-[17px] font-bold text-black md:text-[18px]">
                <span className="min-w-[170px]">Mobile No. :</span>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="..............................."
                  className="w-full border-0 border-b border-black bg-transparent px-1 py-1 text-black placeholder:text-black/70 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 md:p-5">
              <div className="flex items-center justify-between gap-3 text-[17px] font-bold text-black md:text-[18px]">
                <span>Invoice ID :</span>
                <span className="w-32 border-0 border-b border-black bg-transparent text-right text-red-600">
                  {invoiceNumber}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3 text-[17px] font-bold text-black md:text-[18px]">
                <span>Date :</span>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full border-0 border-b border-black bg-transparent px-1 py-1 text-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-black px-4 py-2 text-center text-[14px] font-extrabold uppercase tracking-[0.16em] text-white">
            Sales Details
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black bg-white text-[12px] font-extrabold uppercase tracking-[0.08em] text-black md:text-[13px]">
                <th className="w-[8%] border-r border-black py-2 text-center">
                  S.No
                </th>
                <th className="w-[44%] border-r border-black py-2 text-center">
                  Description (Sare / Blouse / Alteration / Item)
                </th>
                <th className="w-[12%] border-r border-black py-2 text-center">
                  Qty
                </th>
                <th className="w-[18%] border-r border-black py-2 text-center">
                  Rate
                </th>
                <th className="w-[18%] py-2 text-center">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="h-[45px] border-b border-black">
                  <td className="border-r border-black text-center text-[14px] font-bold text-black">
                    {index + 1}
                  </td>
                  <td className="border-r border-black px-2">
                    <input
                      type="text"
                      value={item.item_name}
                      onChange={(e) =>
                        updateItem(item.id, "item_name", e.target.value)
                      }
                      className="w-full bg-transparent text-[14px] text-black focus:outline-none"
                    />
                  </td>
                  <td className="border-r border-black px-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, "quantity", e.target.value)
                      }
                      className="w-full bg-transparent text-center text-[14px] text-black focus:outline-none"
                    />
                  </td>
                  <td className="border-r border-black px-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateItem(item.id, "unit_price", e.target.value)
                      }
                      className="w-full bg-transparent text-right text-[14px] text-black focus:outline-none"
                    />
                  </td>
                  <td className="px-2 text-right text-[14px] font-medium text-black">
                    <input
                      readOnly
                      value={
                        Number(item.quantity || 0) *
                          Number(item.unit_price || 0) >
                        0
                          ? (
                              Number(item.quantity || 0) *
                              Number(item.unit_price || 0)
                            ).toFixed(2)
                          : ""
                      }
                      className="w-full bg-transparent text-right text-[14px] text-black focus:outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end px-4 py-2">
            <div className="w-full max-w-[440px] border border-black bg-white">
              <div className="flex items-center justify-between border-b border-black px-4 py-2 text-[17px] font-bold text-black">
                <span>Total Amount :</span>
                <span className="font-extrabold">$ {totalBill.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between border-b border-black px-4 py-2 text-[17px] font-bold text-black">
                <span>Advance Paid :</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(e.target.value)}
                  className="w-28 bg-transparent text-right font-extrabold text-black focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between px-4 py-2 text-[17px] font-bold text-black">
                <span>Balance Due :</span>
                <span className="font-extrabold">
                  $ {balanceDue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2 border-t border-black">
            <div className="bg-black px-4 py-2 text-[15px] font-extrabold uppercase tracking-[0.14em] text-white">
              Measurement Chart (inches)
            </div>

            {items
              .filter(
                (item) =>
                  item.item_name ||
                  Number(item.quantity) > 0 ||
                  Number(item.unit_price) > 0,
              )
              .map((item, index) => (
                <div key={item.id} className="border-b border-black bg-white">
                  <div className="bg-[#f5f5f5] px-4 py-2 text-[15px] font-black text-black">
                    Item {index + 1}
                    {item.item_name ? ` - ${item.item_name}` : ""}
                  </div>

                  <div className="grid gap-4 p-4 md:grid-cols-2">
                    <div className="space-y-3">
                      {measurementFields.left.map((field) => (
                        <div
                          key={field}
                          className="flex items-center justify-between gap-4 text-[16px] font-bold text-black"
                        >
                          <span className="min-w-[140px]">{field}</span>
                          <input
                            type="text"
                            value={item.measurements[field]}
                            onChange={(e) =>
                              updateItemMeasurement(
                                item.id,
                                field,
                                e.target.value,
                              )
                            }
                            className="h-8 w-16 border border-black bg-transparent text-center focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {measurementFields.right.map((field) => (
                        <div
                          key={field}
                          className="flex items-center justify-between gap-4 text-[16px] font-bold text-black"
                        >
                          <span className="min-w-[150px]">{field}</span>
                          <input
                            type="text"
                            value={item.measurements[field]}
                            onChange={(e) =>
                              updateItemMeasurement(
                                item.id,
                                field,
                                e.target.value,
                              )
                            }
                            className="h-8 w-16 border border-black bg-transparent text-center focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="flex items-center justify-center gap-2 py-4 text-center font-serif text-[16px] font-bold italic text-black md:text-[18px]">
            Thank you for choosing Lakshara Fashion
          </div>

          <div className="pb-3 text-center font-serif text-[14px] italic text-black">
            @lakshara_fashion
          </div>

          <div className="border-t border-black px-4 py-2 text-center text-[11px] italic text-black">
            Goods once sold / altered will not be taken back or exchanged
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-black px-4 py-3">
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-2 rounded border border-black bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-black transition hover:bg-slate-100"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </button>

            <button
              type="button"
              onClick={removeLastRow}
              className="rounded border border-black bg-black px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-slate-800"
            >
              Remove Row
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="rounded bg-red-600 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Invoice"}
            </button>
          </div>

          {error && (
            <div className="border-t border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default CreateInvoice;

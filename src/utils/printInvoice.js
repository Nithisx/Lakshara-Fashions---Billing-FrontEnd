// Renders the invoice in the official Lakshara Fashion sales invoice /
// measurement sheet style (see public/invoice/index.html).
// Usage: printInvoice(invoice, items, extra)
//   invoice - created invoice object (has total_amount, advance_paid, balance_due, ...)
//   items   - array of { item_name, quantity, unit_price, total_price, measurements?, service_type? }
//   extra   - optional { orderNumber, collectionDate, garmentType, notes }

const CHART_LEFT_KEYS = [
  "Length",
  "Shoulder",
  "Sleeve Length",
  "Sleeve Round",
  "Chest / Bust",
  "Waist",
  "Hip",
];
const CHART_RIGHT_KEYS = [
  "Neck",
  "Armhole",
  "Front Neck",
  "Back Neck",
  "Petticoat Length",
  "Petticoat Waist",
  "Blouse Back Length",
];

const escapeHtml = (str = "") =>
  String(str).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );

const fmt = (n) => Number(n || 0).toFixed(2);

const normalizeMeasurements = (value) => {
  if (!value) return {};

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return normalizeMeasurements(parsed);
    } catch {
      return {};
    }
  }

  if (Array.isArray(value)) {
    return value.reduce((acc, entry) => {
      if (!entry || typeof entry !== "object") return acc;
      const key = String(entry.key ?? entry.name ?? entry.label ?? "").trim();
      const val = entry.value ?? entry.measurement ?? "";
      if (key) acc[key] = val;
      return acc;
    }, {});
  }

  if (typeof value === "object") {
    return Object.entries(value).reduce((acc, [key, val]) => {
      const cleanKey = String(key).trim();
      if (cleanKey) acc[cleanKey] = val ?? "";
      return acc;
    }, {});
  }

  return {};
};

// ---------------------------------------------------------------------------
// Design tokens
//   Paper   #FAF6EF   Ink   #211812   Maroon (saree red) #7A1E2C
//   Gold (thread) #A9812F   Rule (hairline) #E4D9C4   Rose wash #F4E7E3
//   Display face: 'Cormorant Garamond'  Body/data face: 'Jost'
// ---------------------------------------------------------------------------
export const SHEET_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Jost:wght@400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Jost', Arial, Helvetica, sans-serif;
    background: #E9E2D3;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  #invoice-container {
    position: relative;
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    background: #FAF6EF;
    color: #211812;
    font-size: 12.5px;
    padding: 14mm 13mm 12mm;
  }
  /* saree-border style frame: a fine gold rule inset within a maroon rule */
  #invoice-container::before {
    content: "";
    position: absolute;
    inset: 6mm;
    border: 1px solid #7A1E2C;
    pointer-events: none;
  }
  #invoice-container::after {
    content: "";
    position: absolute;
    inset: 7.5mm;
    border: 1px solid #A9812F;
    pointer-events: none;
  }
  .sheet-inner { position: relative; z-index: 1; padding: 5mm 4mm 2mm; }

  .corner-motif {
    position: absolute; width: 15mm; height: 15mm; z-index: 1;
    opacity: 0.85;
  }
  .corner-motif.tl { top: 6mm; left: 6mm; }
  .corner-motif.tr { top: 6mm; right: 6mm; transform: scaleX(-1); }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    margin-bottom: 4px;
  }
  .logo-wrap {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }
  .logo-img { width: 78px; height: 78px; object-fit: contain; display: block; }
  .header-right { text-align: right; }
  .brand-eyebrow {
    font-family: 'Jost', sans-serif;
    font-size: 9.5px; font-weight: 500; letter-spacing: 3px;
    text-transform: uppercase; color: #A9812F;
    margin-bottom: 2px;
  }
  .company-name {
    font-family: 'Cormorant Garamond', 'Times New Roman', serif;
    font-size: 30px; font-weight: 600; color: #211812;
    letter-spacing: 0.3px; line-height: 1.1;
  }
  .company-address {
    font-family: 'Jost', sans-serif;
    font-size: 10.5px; color: #55483D; margin-top: 5px;
    letter-spacing: 0.2px;
  }
  .company-phone {
    font-family: 'Jost', sans-serif;
    font-size: 11.5px; font-weight: 600; color: #7A1E2C; margin-top: 4px;
    letter-spacing: 0.5px;
  }
  .diamond { font-size: 8px; vertical-align: middle; margin-right: 5px; color: #A9812F; }

  .header-hr {
    height: 1px; background: #E4D9C4; margin: 6px 0 14px;
  }

  /* Top details — editorial info strip instead of boxed grid */
  .top-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 24px;
    row-gap: 10px;
    padding: 10px 0 14px;
    border-bottom: 1px solid #E4D9C4;
    margin-bottom: 4px;
  }
  .field-block { display: flex; flex-direction: column; }
  .field-label {
    font-family: 'Jost', sans-serif;
    font-size: 9px; font-weight: 600; letter-spacing: 1.6px;
    text-transform: uppercase; color: #A9812F;
    margin-bottom: 3px;
  }
  .field-label.accent { color: #7A1E2C; }
  .field-value {
    width: 100%;
    border: none; border-bottom: 1px dotted #C9BBA5;
    background: transparent;
    font-family: 'Jost', sans-serif;
    font-size: 13.5px; font-weight: 500; color: #211812;
    padding: 2px 1px 4px; outline: none;
  }
  .field-value.serial {
    color: #7A1E2C; font-weight: 600;
  }

  /* Section bars — quiet stationery rule instead of a solid block */
  .section-bar {
    display: flex; align-items: center; gap: 10px;
    margin: 18px 0 8px;
  }
  .section-bar::before, .section-bar::after {
    content: ""; flex: 1; height: 1px; background: #D8C79E;
  }
  .section-title {
    font-family: 'Jost', sans-serif;
    font-weight: 600; font-size: 11px; letter-spacing: 3px;
    text-transform: uppercase; color: #7A1E2C;
    white-space: nowrap;
  }

  /* Sales details */
  .sales-details {
    width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 10px;
  }
  .sales-details thead tr { border-bottom: 1px solid #7A1E2C; }
  .sales-details th {
    background: transparent;
    font-family: 'Jost', sans-serif;
    font-size: 9.5px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 1.2px; color: #55483D; padding: 6px 6px; text-align: left;
  }
  .col-sno { width: 8%; text-align: center !important; }
  .col-desc { width: 44%; }
  .col-qty { width: 12%; text-align: right !important; }
  .col-rate { width: 18%; text-align: right !important; }
  .col-amount { width: 18%; text-align: right !important; }
  .sales-details td {
    padding: 0; height: 27px;
    border-bottom: 1px solid #EEE6D6;
  }
  .sales-details td input {
    width: 100%; height: 100%; min-height: 26px;
    border: none; background: transparent;
    font-family: 'Jost', sans-serif;
    font-size: 12.5px; color: #211812; padding: 2px 6px; outline: none;
  }
  .c-sno input { text-align: center; font-weight: 600; color: #A9812F; }
  .c-qty input, .c-rate input, .c-amount input {
    text-align: right; font-variant-numeric: tabular-nums;
  }
  .c-amount input { font-weight: 600; }

  /* Totals */
  .totals-section { display: flex; justify-content: flex-end; margin-bottom: 4px; }
  .totals-table {
    width: 58%; border-collapse: collapse; table-layout: fixed;
    background: #F4E7E3; border: 1px solid #E7D2CC;
  }
  .totals-table td { padding: 6px 12px; }
  .totals-table tr + tr td { border-top: 1px dotted #DABDB6; }
  .total-label {
    width: 60%;
    font-family: 'Jost', sans-serif;
    font-weight: 500; font-size: 11.5px; letter-spacing: 0.4px; color: #55483D;
  }
  .total-value { width: 40%; text-align: right; white-space: nowrap; }
  .totals-input {
    width: calc(100% - 14px); max-width: 130px;
    border: none;
    background: transparent;
    font-family: 'Jost', sans-serif;
    font-size: 13px; font-weight: 600; text-align: right;
    padding: 1px 2px; outline: none; color: #211812;
    font-variant-numeric: tabular-nums;
  }
  .totals-table tr.balance-row .total-label,
  .totals-table tr.balance-row .totals-input,
  .totals-table tr.balance-row .currency { color: #7A1E2C; }
  .totals-table tr.balance-row .total-label { font-weight: 600; }
  .totals-table tr.balance-row .totals-input { font-size: 15px; }
  .currency { font-family: 'Jost', sans-serif; font-size: 12.5px; font-weight: 600; }

  .payment-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin: 12px 0 2px;
    gap: 14px;
  }
  .payment-qr-box {
    width: 96px;
    border: 1px solid #A9812F;
    padding: 5px;
    background: #ffffff;
  }
  .payment-qr-box img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: contain;
  }
  .payment-caption {
    font-family: 'Jost', sans-serif;
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: #A9812F;
    text-align: right;
  }

  /* Measurement chart — styled as a tailor's spec card */
  .measurement-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    column-gap: 36px; padding: 10px 6px 6px;
  }
  .m-row {
    display: flex; justify-content: space-between; align-items: baseline;
    padding: 5px 0;
    border-bottom: 1px dotted #D8C79E;
  }
  .m-label {
    font-family: 'Jost', sans-serif;
    font-weight: 500; font-size: 11.5px; color: #55483D;
  }
  .m-input {
    width: 44px; border: none; border-bottom: 1px solid #7A1E2C;
    background: transparent; text-align: center;
    font-family: 'Jost', sans-serif;
    font-size: 12.5px; font-weight: 600; color: #211812; outline: none; padding: 0 0 1px;
    font-variant-numeric: tabular-nums;
  }
  .chart-item-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 14px; font-weight: 600; font-style: italic; color: #7A1E2C;
    padding: 4px 2px 0;
    border-top: 1px solid #E4D9C4;
    margin-top: 6px;
  }

  /* Footer */
  .footer { text-align: center; margin-top: 20px; padding-top: 12px; border-top: 1px solid #E4D9C4; }
  .footer-thanks {
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px; font-weight: 600; font-style: italic; color: #7A1E2C;
  }
  .social-row {
    display: flex; justify-content: center; align-items: center; gap: 7px;
    margin: 7px 0;
    font-family: 'Jost', sans-serif; font-size: 11px; letter-spacing: 0.5px; color: #55483D;
  }
  .social-row .fa-instagram { font-size: 14px; color: #A9812F; }
  .footer-terms {
    font-family: 'Jost', sans-serif;
    font-size: 9.5px; font-style: italic; color: #8A7C6C;
    letter-spacing: 0.2px;
  }

  @media print {
    @page { size: A4; margin: 0; }
    body { background: #ffffff; }
    #invoice-container {
      width: 210mm; min-height: 297mm;
      margin: 0; padding: 14mm 13mm 12mm;
    }
  }
`;

// Small paisley/mango motif used once, top corners only — the page's single
// ornamental signature, echoing a saree pallu border. Purely decorative.
const CORNER_MOTIF_SVG = `
  <svg class="corner-motif tl" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 50 C10 30 20 10 40 10 C52 10 55 22 46 28 C38 33 30 28 32 20"
      fill="none" stroke="#A9812F" stroke-width="1.4"/>
    <circle cx="32" cy="20" r="2" fill="#7A1E2C"/>
  </svg>
  <svg class="corner-motif tr" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 50 C10 30 20 10 40 10 C52 10 55 22 46 28 C38 33 30 28 32 20"
      fill="none" stroke="#A9812F" stroke-width="1.4"/>
    <circle cx="32" cy="20" r="2" fill="#7A1E2C"/>
  </svg>`;

const buildMeasurementChart = (measurements = {}) => {
  const safeMeasurements = normalizeMeasurements(measurements);
  const keys = Object.keys(safeMeasurements);

  // Full chart with values filled in; custom/extra fields appended to right column
  const leftKeys = CHART_LEFT_KEYS;
  const rightKeys = [
    ...CHART_RIGHT_KEYS,
    ...keys.filter(
      (k) => !CHART_LEFT_KEYS.includes(k) && !CHART_RIGHT_KEYS.includes(k),
    ),
  ];

  const buildColumn = (colKeys) =>
    colKeys
      .map(
        (k) => `
      <div class="m-row">
        <span class="m-label">${escapeHtml(k)}</span>
        <input type="text" class="m-input" value="${escapeHtml(safeMeasurements[k] || "")}" readonly>
      </div>`,
      )
      .join("");

  return `
    <div class="section-bar"><h2 class="section-title">Measurement Chart (inches)</h2></div>
    <div class="measurement-grid">
      <div>${buildColumn(leftKeys)}</div>
      <div>${buildColumn(rightKeys)}</div>
    </div>`;
};

// Builds the full sheet markup (the #invoice-container block). Shared by the
// print window and the public share page so both render identically.
export const buildSheetContent = (invoice, items, extra = {}) => {
  const logoUrl = `${window.location.origin}/logo.png`;

  const formattedDate = new Date(invoice.invoice_date).toLocaleDateString(
    "en-IN",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const advancePaid = Number(invoice.advance_paid) || 0;
  const balanceDue = Number(invoice.balance_due) || 0;

  const itemsRows = items
    .map(
      (item, index) => `
    <tr>
      <td class="c-sno"><input value="${index + 1}" readonly></td>
      <td class="c-desc"><input value="${escapeHtml(item.item_name)}" readonly></td>
      <td class="c-qty"><input value="${item.quantity}" readonly></td>
      <td class="c-rate"><input value="${fmt(item.unit_price)}" readonly></td>
      <td class="c-amount"><input value="${fmt(item.total_price)}" readonly></td>
    </tr>`,
    )
    .join("");

  const measurementCharts = items
    .map((item, index) => {
      const measurementData = normalizeMeasurements(item.measurements);
      if (Object.keys(measurementData).length === 0) return "";

      return `
        <div class="chart-item-name">Item ${index + 1}${item.item_name ? ` — ${escapeHtml(item.item_name)}` : ""}</div>
        ${buildMeasurementChart(measurementData)}`;
    })
    .filter(Boolean)
    .join("");

  return `
    <div id="invoice-container">
      ${CORNER_MOTIF_SVG}
      <div class="sheet-inner">

        <header class="header">
          <div class="logo-wrap">
            <img src="${logoUrl}" alt="Lakshara Fashion Logo" class="logo-img">
          </div>
          <div class="header-right">
            <p class="brand-eyebrow">Bespoke Tailoring &amp; Sarees</p>
            <h1 class="company-name">Lakshara Fashion (S) Pte Ltd</h1>
            <p class="company-address">Little India Arcade, 48 Serangoon Rd, # 01 - 63, Singapore 217959</p>
            <p class="company-phone"><span class="diamond">&#9670;</span>8225 1605</p>
          </div>
        </header>
        <div class="header-hr"></div>

        <div class="top-details">
          <div class="field-block">
            <span class="field-label">Customer Name</span>
            <input type="text" class="field-value" value="${escapeHtml(invoice.customer_name)}" readonly>
          </div>
          <div class="field-block">
            <span class="field-label accent">Invoice ID</span>
            <input type="text" class="field-value serial" value="${escapeHtml(invoice.invoice_number)}" readonly>
          </div>
          <div class="field-block">
            <span class="field-label">Mobile No.</span>
            <input type="text" class="field-value" value="${escapeHtml(invoice.customer_phone)}" readonly>
          </div>
          <div class="field-block">
            <span class="field-label">Date</span>
            <input type="text" class="field-value" value="${escapeHtml(formattedDate)}" readonly>
          </div>
        </div>

        <section class="sales-section">
          <div class="section-bar"><h2 class="section-title">Sales Details</h2></div>
          <table class="sales-details">
            <thead>
              <tr>
                <th class="col-sno">S.No</th>
                <th class="col-desc">Description (Saree / Blouse / Alteration / Item)</th>
                <th class="col-qty">Qty</th>
                <th class="col-rate">Rate</th>
                <th class="col-amount">Amount</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>
        </section>

        <section class="totals-section">
          <table class="totals-table">
            <tbody>
              <tr>
                <td class="total-label">Total Amount</td>
                <td class="total-value"><span class="currency">$</span><input type="text" class="totals-input" value="${fmt(invoice.total_amount)}" readonly></td>
              </tr>
              <tr>
                <td class="total-label">Advance Paid</td>
                <td class="total-value"><span class="currency">$</span><input type="text" class="totals-input" value="${fmt(advancePaid)}" readonly></td>
              </tr>
              <tr class="balance-row">
                <td class="total-label">Balance Due</td>
                <td class="total-value"><span class="currency">$</span><input type="text" class="totals-input" value="${fmt(balanceDue)}" readonly></td>
              </tr>
            </tbody>
          </table>
        </section>

        ${measurementCharts}

        <div class="payment-row">
          <div class="payment-caption">Scan QR<br/>to Pay</div>
          <div class="payment-qr-box">
            <img src="${window.location.origin}/qrcode.jpg" alt="QR Code for payment" />
          </div>
        </div>

        <footer class="footer">
          <p class="footer-thanks">Thank you for choosing Lakshara Fashion</p>
          <div class="social-row">
            <i class="fab fa-instagram" aria-hidden="true"></i>
            <span>@lakshara_fashion</span>
          </div>
          <p class="footer-terms">Goods once sold / altered will not be taken back or exchanged</p>
        </footer>

      </div>
    </div>`;
};

const buildInvoiceHtml = (invoice, items, extra = {}) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Lakshara Fashion - Invoice ${invoice.invoice_number}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>${SHEET_CSS}</style>
  </head>
  <body>
    ${buildSheetContent(invoice, items, extra)}
    <script>
      window.onload = function() {
        setTimeout(function() { window.print(); }, 300);
      }
    </script>
  </body>
  </html>
`;

export const printInvoice = (invoice, items, extra = {}) => {
  const printWindow = window.open("", "_blank", "width=900,height=1000");
  if (!printWindow) {
    alert("Please allow popups to download/print invoices.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(buildInvoiceHtml(invoice, items, extra));
  printWindow.document.close();
};

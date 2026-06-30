export const printInvoice = (invoice, items) => {
  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    alert('Please allow popups to download/print invoices.');
    return;
  }
  
  const itemsRows = items.map((item, index) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px 8px; text-align: left; color: #4b5563;">${index + 1}</td>
      <td style="padding: 12px 8px; text-align: left; font-weight: 600; color: #1f2937;">${item.item_name}</td>
      <td style="padding: 12px 8px; text-align: right; color: #1f2937;">${item.quantity}</td>
      <td style="padding: 12px 8px; text-align: right; color: #1f2937;">₹${Number(item.unit_price).toFixed(2)}</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: 700; color: #4f46e5;">₹${Number(item.total_price).toFixed(2)}</td>
    </tr>
  `).join('');

  const formattedDate = new Date(invoice.invoice_date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Lakshara Fashions - Invoice ${invoice.invoice_number}</title>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #334155;
          margin: 0;
          padding: 40px;
          background-color: #fff;
          -webkit-print-color-adjust: exact;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #e2e8f0;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 24px;
          margin-bottom: 32px;
        }
        .logo-section h1 {
          font-size: 26px;
          margin: 0;
          color: #4f46e5;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .logo-section p {
          margin: 4px 0 0 0;
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 700;
        }
        .invoice-title {
          text-align: right;
        }
        .invoice-title h2 {
          font-size: 24px;
          margin: 0;
          color: #0f172a;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .invoice-title p {
          margin: 4px 0 0 0;
          font-size: 13px;
          color: #6366f1;
          font-weight: 700;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 32px;
        }
        .bill-to h3, .invoice-info h3 {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #94a3b8;
          margin-top: 0;
          margin-bottom: 10px;
          font-weight: 700;
        }
        .bill-to p, .invoice-info p {
          margin: 4px 0;
          font-size: 14px;
          line-height: 1.5;
        }
        .invoice-info table {
          width: 100%;
          border-collapse: collapse;
        }
        .invoice-info td {
          padding: 4px 0;
          font-size: 14px;
        }
        .invoice-info td.label {
          color: #64748b;
          font-weight: 500;
        }
        .invoice-info td.value {
          text-align: right;
          font-weight: 600;
          color: #0f172a;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 32px;
        }
        .items-table th {
          background-color: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
          color: #475569;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 12px 8px;
          font-weight: 700;
        }
        .summary-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 48px;
        }
        .summary-box {
          width: 280px;
        }
        .summary-table {
          width: 100%;
          border-collapse: collapse;
        }
        .summary-table td {
          padding: 8px 0;
          font-size: 14px;
        }
        .summary-table tr.total-row td {
          border-top: 2px solid #e2e8f0;
          font-size: 18px;
          font-weight: 850;
          color: #4f46e5;
          padding-top: 12px;
        }
        .footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
          text-align: center;
          color: #64748b;
          font-size: 12px;
        }
        @media print {
          body {
            padding: 0;
            background-color: transparent;
          }
          .invoice-container {
            border: none;
            box-shadow: none;
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="logo-section">
            <h1>Lakshara Fashions</h1>
            <p>Premium Boutique & Apparel</p>
          </div>
          <div class="invoice-title">
            <h2>INVOICE</h2>
            <p># ${invoice.invoice_number}</p>
          </div>
        </div>

        <div class="details-grid">
          <div class="bill-to">
            <h3>Bill To</h3>
            <p style="font-weight: 700; font-size: 15px; color: #0f172a; margin-bottom: 6px;">${invoice.customer_name}</p>
            <p style="color: #475569; margin: 2px 0;">Phone: ${invoice.customer_phone}</p>
          </div>
          <div class="invoice-info">
            <h3>Invoice Details</h3>
            <table>
              <tr>
                <td class="label">Date:</td>
                <td class="value">${formattedDate}</td>
              </tr>
              <tr>
                <td class="label">Payment Method:</td>
                <td class="value" style="text-transform: uppercase;">${invoice.payment_method}</td>
              </tr>
              <tr>
                <td class="label">Status:</td>
                <td class="value" style="color: #10b981;">PAID</td>
              </tr>
            </table>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 8%; text-align: left;">S.No</th>
              <th style="width: 50%; text-align: left;">Item Description</th>
              <th style="width: 12%; text-align: right;">Qty</th>
              <th style="width: 15%; text-align: right;">Price</th>
              <th style="width: 15%; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="summary-section">
          <div class="summary-box">
            <table class="summary-table">
              <tr>
                <td style="color: #64748b;">Subtotal</td>
                <td style="text-align: right; font-weight: 600; color: #0f172a;">₹${Number(invoice.total_amount).toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td>Total Bill</td>
                <td style="text-align: right;">₹${Number(invoice.total_amount).toFixed(2)}</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="footer">
          <p style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">Thank you for shopping at Lakshara Fashions!</p>
          <p style="font-size: 11px; color: #94a3b8; margin: 0;">This is a system generated invoice. For exchange policy details, visit our store.</p>
        </div>
      </div>
      <script>
        // Automatically open printer dialogue
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

document.addEventListener('DOMContentLoaded', () => {
  const qtyInputs = document.querySelectorAll('.qty-input');
  const rateInputs = document.querySelectorAll('.rate-input');
  const amountInputs = document.querySelectorAll('.amount-input');
  const totalAmountField = document.getElementById('total-amount');
  const advancePaidField = document.getElementById('advance-paid');
  const balanceDueField = document.getElementById('balance-due');

  // Calculate individual line totals and the grand total
  const calculateGrandTotal = () => {
    let grandTotal = 0;

    amountInputs.forEach((amountField, index) => {
      const qty = parseFloat(qtyInputs[index]?.value) || 0;
      const rate = parseFloat(rateInputs[index]?.value) || 0;
      const lineTotal = qty * rate;

      amountField.value = lineTotal > 0 ? lineTotal.toFixed(2) : '';
      grandTotal += lineTotal;
    });

    totalAmountField.value = grandTotal.toFixed(2);
    updateBalanceDue();
  };

  // Balance Due = Total Amount - Advance Paid
  const updateBalanceDue = () => {
    const total = parseFloat(totalAmountField.value) || 0;
    const advance = parseFloat(advancePaidField.value) || 0;
    const balance = Math.max(total - advance, 0);
    balanceDueField.value = balance.toFixed(2);
  };

  // Listen for edits on all Qty and Rate fields
  qtyInputs.forEach((input) => {
    input.addEventListener('input', calculateGrandTotal);
  });
  rateInputs.forEach((input) => {
    input.addEventListener('input', calculateGrandTotal);
  });

  // Recalculate balance whenever advance paid changes
  advancePaidField.addEventListener('input', updateBalanceDue);

  // Prefill today's date into the Date field (optional convenience)
  const invoiceDateField = document.getElementById('invoice-date');
  if (invoiceDateField && !invoiceDateField.value) {
    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
    invoiceDateField.value = localDate.toISOString().split('T')[0];
  }

  // Recalculate on initial load
  calculateGrandTotal();
});
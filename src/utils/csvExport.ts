export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Convert data to CSV format
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data: any, filename: string) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const preparePaymentsForExport = (payments: any[]) => {
  return payments.map(payment => ({
    'Date': new Date(payment.created_at).toLocaleDateString(),
    'Project': payment.project_id,
    'Amount': payment.amount,
    'Status': payment.status,
    'Payment Method': payment.payment_method,
    'Transaction ID': payment.stripe_payment_intent_id || payment.transaction_id || '',
  }));
};

export const prepareEarningsForExport = (earnings: any[]) => {
  return earnings.map(earning => ({
    'Date': new Date(earning.created_at).toLocaleDateString(),
    'Project': earning.project_id,
    'Base Amount': earning.base_amount,
    'Bonus': earning.bonus_amount || 0,
    'Total': earning.total_amount,
    'Status': earning.status,
  }));
};

/**
 * Prepare tax-ready export from reconciliation tax_line_items.
 * Groups by month with subtotal rows.
 */
export const prepareTaxExport = (lineItems: any[]) => {
  if (!lineItems || lineItems.length === 0) return [];

  // Sort by date
  const sorted = [...lineItems].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const rows: any[] = [];
  let currentMonth = '';
  let monthGross = 0;
  let monthRefunds = 0;

  for (const item of sorted) {
    const d = new Date(item.date);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    // Insert subtotal row when month changes
    if (currentMonth && month !== currentMonth) {
      rows.push({
        'Date': `--- ${currentMonth} SUBTOTAL ---`,
        'Transaction ID': '',
        'Service Type': '',
        'Gross Amount': monthGross,
        'Refund Amount': monthRefunds,
        'Net Amount': monthGross - monthRefunds,
        'Currency': '',
        'Status': '',
      });
      monthGross = 0;
      monthRefunds = 0;
    }
    currentMonth = month;

    const gross = Number(item.gross_amount) || 0;
    const refund = Number(item.refund_amount) || 0;
    monthGross += gross;
    monthRefunds += refund;

    rows.push({
      'Date': d.toLocaleDateString(),
      'Transaction ID': item.transaction_id || '',
      'Service Type': item.service_type || '',
      'Gross Amount': gross,
      'Refund Amount': refund,
      'Net Amount': gross - refund,
      'Currency': (item.currency || 'usd').toUpperCase(),
      'Status': item.status || '',
    });
  }

  // Final month subtotal
  if (currentMonth) {
    rows.push({
      'Date': `--- ${currentMonth} SUBTOTAL ---`,
      'Transaction ID': '',
      'Service Type': '',
      'Gross Amount': monthGross,
      'Refund Amount': monthRefunds,
      'Net Amount': monthGross - monthRefunds,
      'Currency': '',
      'Status': '',
    });
  }

  return rows;
};

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

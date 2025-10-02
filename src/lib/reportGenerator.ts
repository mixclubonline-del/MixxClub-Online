import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

export interface ReportConfig {
  title: string;
  subtitle?: string;
  dateRange: { start: Date; end: Date };
  data: any[];
  columns?: string[];
  type: 'financial' | 'analytics' | 'legal' | 'business';
}

export class ReportGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  private addHeader(title: string, subtitle?: string, dateRange?: { start: Date; end: Date }) {
    // Company header
    this.doc.setFontSize(20);
    this.doc.setTextColor(147, 51, 234); // primary color
    this.doc.text('MixClub Financial Report', this.pageWidth / 2, 15, { align: 'center' });

    // Report title
    this.doc.setFontSize(16);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, this.pageWidth / 2, 25, { align: 'center' });

    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(subtitle, this.pageWidth / 2, 32, { align: 'center' });
    }

    // Date range
    if (dateRange) {
      this.doc.setFontSize(10);
      const dateText = `Period: ${format(dateRange.start, 'MMM dd, yyyy')} - ${format(dateRange.end, 'MMM dd, yyyy')}`;
      this.doc.text(dateText, this.pageWidth / 2, 38, { align: 'center' });
    }

    // Generation timestamp
    this.doc.setFontSize(8);
    this.doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, this.pageWidth / 2, 43, { align: 'center' });
  }

  private addFooter(pageNumber: number) {
    this.doc.setFontSize(8);
    this.doc.setTextColor(150, 150, 150);
    this.doc.text(
      `Page ${pageNumber} | MixClub © ${new Date().getFullYear()} | Confidential`,
      this.pageWidth / 2,
      this.pageHeight - 10,
      { align: 'center' }
    );
  }

  generateProfitAndLoss(data: any, dateRange: { start: Date; end: Date }): jsPDF {
    this.addHeader('Profit & Loss Statement', 'Income Statement', dateRange);

    const revenue = data.revenue || [];
    const expenses = data.expenses || [];
    const totalRevenue = revenue.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
    const netIncome = totalRevenue - totalExpenses;

    // Revenue section
    this.doc.autoTable({
      startY: 50,
      head: [['Revenue', 'Amount']],
      body: [
        ...revenue.map((item: any) => [item.description || item.category, `$${item.amount.toFixed(2)}`]),
        ['', ''],
        ['Total Revenue', `$${totalRevenue.toFixed(2)}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    });

    // Expenses section
    const startY = this.doc.lastAutoTable.finalY + 10;
    this.doc.autoTable({
      startY,
      head: [['Expenses', 'Amount']],
      body: [
        ...expenses.map((item: any) => [item.description || item.category, `$${item.amount.toFixed(2)}`]),
        ['', ''],
        ['Total Expenses', `$${totalExpenses.toFixed(2)}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    });

    // Net income
    const netY = this.doc.lastAutoTable.finalY + 10;
    this.doc.autoTable({
      startY: netY,
      body: [['Net Income', `$${netIncome.toFixed(2)}`]],
      theme: 'plain',
      styles: { fontSize: 14, fontStyle: 'bold', fillColor: netIncome >= 0 ? [34, 197, 94] : [239, 68, 68] },
    });

    this.addFooter(1);
    return this.doc;
  }

  generateCashFlow(data: any, dateRange: { start: Date; end: Date }): jsPDF {
    this.addHeader('Cash Flow Statement', 'Statement of Cash Flows', dateRange);

    const operating = data.operating || [];
    const investing = data.investing || [];
    const financing = data.financing || [];

    const operatingTotal = operating.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
    const investingTotal = investing.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
    const financingTotal = financing.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
    const netCashFlow = operatingTotal + investingTotal + financingTotal;

    // Operating activities
    this.doc.autoTable({
      startY: 50,
      head: [['Operating Activities', 'Amount']],
      body: [
        ...operating.map((item: any) => [item.description, `$${item.amount.toFixed(2)}`]),
        ['Net Cash from Operating', `$${operatingTotal.toFixed(2)}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234] },
    });

    // Investing activities
    let startY = this.doc.lastAutoTable.finalY + 10;
    this.doc.autoTable({
      startY,
      head: [['Investing Activities', 'Amount']],
      body: [
        ...investing.map((item: any) => [item.description, `$${item.amount.toFixed(2)}`]),
        ['Net Cash from Investing', `$${investingTotal.toFixed(2)}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234] },
    });

    // Financing activities
    startY = this.doc.lastAutoTable.finalY + 10;
    this.doc.autoTable({
      startY,
      head: [['Financing Activities', 'Amount']],
      body: [
        ...financing.map((item: any) => [item.description, `$${item.amount.toFixed(2)}`]),
        ['Net Cash from Financing', `$${financingTotal.toFixed(2)}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234] },
    });

    // Net cash flow
    startY = this.doc.lastAutoTable.finalY + 10;
    this.doc.autoTable({
      startY,
      body: [['Net Change in Cash', `$${netCashFlow.toFixed(2)}`]],
      theme: 'plain',
      styles: { fontSize: 14, fontStyle: 'bold', fillColor: [240, 240, 240] },
    });

    this.addFooter(1);
    return this.doc;
  }

  generateRevenueAnalytics(data: any, dateRange: { start: Date; end: Date }): jsPDF {
    this.addHeader('Revenue Analytics Report', 'Subscription & Revenue Metrics', dateRange);

    const metrics = [
      ['Metric', 'Value'],
      ['Monthly Recurring Revenue (MRR)', `$${(data.mrr || 0).toFixed(2)}`],
      ['Annual Recurring Revenue (ARR)', `$${(data.arr || 0).toFixed(2)}`],
      ['Average Revenue Per User (ARPU)', `$${(data.arpu || 0).toFixed(2)}`],
      ['Churn Rate', `${(data.churnRate || 0).toFixed(2)}%`],
      ['Active Subscriptions', data.activeSubscriptions || 0],
      ['New Subscriptions', data.newSubscriptions || 0],
      ['Churned Subscriptions', data.churnedSubscriptions || 0],
    ];

    this.doc.autoTable({
      startY: 50,
      head: [metrics[0]],
      body: metrics.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [147, 51, 234] },
    });

    // Revenue breakdown by service
    if (data.revenueByService) {
      const startY = this.doc.lastAutoTable.finalY + 15;
      this.doc.setFontSize(12);
      this.doc.text('Revenue by Service Type', this.margin, startY);

      this.doc.autoTable({
        startY: startY + 5,
        head: [['Service', 'Revenue', 'Subscriptions']],
        body: Object.entries(data.revenueByService).map(([service, info]: [string, any]) => [
          service,
          `$${info.revenue.toFixed(2)}`,
          info.count,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [147, 51, 234] },
      });
    }

    this.addFooter(1);
    return this.doc;
  }

  generateEngineerPayouts(data: any[], dateRange: { start: Date; end: Date }): jsPDF {
    this.addHeader('Engineer Payout Report', 'Contractor Earnings Summary', dateRange);

    const totalPayouts = data.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

    this.doc.autoTable({
      startY: 50,
      head: [['Engineer', 'Projects', 'Base Amount', 'Bonus', 'Total', 'Status']],
      body: data.map((item) => [
        item.engineerName || 'Unknown',
        item.projectCount || 0,
        `$${(item.baseAmount || 0).toFixed(2)}`,
        `$${(item.bonusAmount || 0).toFixed(2)}`,
        `$${(item.totalAmount || 0).toFixed(2)}`,
        item.status || 'pending',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234] },
      foot: [['Total', '', '', '', `$${totalPayouts.toFixed(2)}`, '']],
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    });

    this.addFooter(1);
    return this.doc;
  }

  generateAuditTrail(data: any[], dateRange: { start: Date; end: Date }): jsPDF {
    this.addHeader('Audit Trail Report', 'Transaction & Activity Log', dateRange);

    this.doc.autoTable({
      startY: 50,
      head: [['Timestamp', 'User', 'Action', 'Table', 'Details']],
      body: data.map((item) => [
        format(new Date(item.created_at), 'MMM dd HH:mm'),
        item.userEmail || item.user_id?.substring(0, 8) || 'System',
        item.action,
        item.table_name,
        item.record_id?.substring(0, 8) || '-',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234] },
      styles: { fontSize: 8 },
    });

    this.addFooter(1);
    return this.doc;
  }

  save(filename: string) {
    this.doc.save(filename);
  }

  output(): Blob {
    return this.doc.output('blob');
  }
}

export function exportToCSV(data: any[], filename: string, headers?: string[]) {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  const keys = headers || Object.keys(data[0]);
  const csvContent = [
    keys.join(','),
    ...data.map((row) => keys.map((key) => {
      const value = row[key];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
      return value;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportToExcel(data: any[], filename: string) {
  // Create a simple Excel-compatible format (TSV)
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  const keys = Object.keys(data[0]);
  const tsvContent = [
    keys.join('\t'),
    ...data.map((row) => keys.map((key) => row[key] ?? '').join('\t'))
  ].join('\n');

  const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { CalendarIcon, Download, FileText, FileSpreadsheet, FileBarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { ReportGenerator, exportToCSV, exportToExcel } from "@/lib/reportGenerator";

type ReportType = 
  | "profit-loss"
  | "cash-flow"
  | "revenue-analytics"
  | "engineer-payouts"
  | "audit-trail"
  | "subscription-summary"
  | "tax-summary";

type ExportFormat = "pdf" | "csv" | "excel";

export function DocumentGenerator() {
  const [reportType, setReportType] = useState<ReportType>("profit-loss");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("pdf");
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const quickDateRanges = [
    { label: "Last 7 Days", getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
    { label: "Last 30 Days", getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
    { label: "This Month", getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
    { label: "Last Month", getValue: () => {
      const lastMonth = subMonths(new Date(), 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }},
    { label: "This Year", getValue: () => ({ start: startOfYear(new Date()), end: endOfYear(new Date()) }) },
  ];

  const reportTypes = [
    { value: "profit-loss", label: "Profit & Loss Statement", icon: FileBarChart },
    { value: "cash-flow", label: "Cash Flow Statement", icon: FileBarChart },
    { value: "revenue-analytics", label: "Revenue Analytics", icon: FileSpreadsheet },
    { value: "engineer-payouts", label: "Engineer Payouts", icon: FileText },
    { value: "audit-trail", label: "Audit Trail", icon: FileText },
    { value: "subscription-summary", label: "Subscription Summary", icon: FileSpreadsheet },
    { value: "tax-summary", label: "Tax Summary", icon: FileText },
  ];

  const fetchReportData = async (type: ReportType) => {
    const { start, end } = dateRange;

    switch (type) {
      case "profit-loss": {
        const [paymentsRes, payoutsRes] = await Promise.all([
          supabase
            .from("payments")
            .select("*")
            .eq("status", "completed")
            .gte("created_at", start.toISOString())
            .lte("created_at", end.toISOString()),
          supabase
            .from("payout_requests")
            .select("*")
            .eq("status", "completed")
            .gte("created_at", start.toISOString())
            .lte("created_at", end.toISOString()),
        ]);

        return {
          revenue: paymentsRes.data?.map(p => ({ description: `Payment ${p.payment_method}`, amount: Number(p.amount) })) || [],
          expenses: payoutsRes.data?.map(p => ({ description: `Payout to Engineer`, amount: Number(p.amount) })) || [],
        };
      }

      case "cash-flow": {
        const { data: payments } = await supabase
          .from("payments")
          .select("*")
          .eq("status", "completed")
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString());

        const { data: payouts } = await supabase
          .from("payout_requests")
          .select("*")
          .eq("status", "completed")
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString());

        return {
          operating: payments?.map(p => ({ description: `Customer Payment`, amount: Number(p.amount) })) || [],
          investing: [],
          financing: payouts?.map(p => ({ description: `Engineer Payout`, amount: -Number(p.amount) })) || [],
        };
      }

      case "revenue-analytics": {
        const { data: analytics } = await supabase
          .from("revenue_analytics")
          .select("*")
          .gte("period_start", start.toISOString())
          .lte("period_end", end.toISOString())
          .order("period_start", { ascending: false })
          .limit(1);

        const [masteringSubs, mixingSubs, distributionSubs] = await Promise.all([
          supabase.from("user_mastering_subscriptions").select("*").eq("status", "active"),
          supabase.from("user_mixing_subscriptions").select("*").eq("status", "active"),
          supabase.from("user_distribution_subscriptions").select("*").eq("status", "active"),
        ]);

        const latest = analytics?.[0];
        return {
          mrr: Number(latest?.mrr || 0),
          arr: Number(latest?.arr || 0),
          arpu: Number(latest?.average_revenue_per_user || 0),
          churnRate: Number(latest?.churn_rate || 0),
          activeSubscriptions: (masteringSubs.data?.length || 0) + (mixingSubs.data?.length || 0) + (distributionSubs.data?.length || 0),
          newSubscriptions: Number(latest?.new_customers || 0),
          churnedSubscriptions: Number(latest?.churned_customers || 0),
          revenueByService: {
            Mastering: { revenue: masteringSubs.data?.length || 0 * 50, count: masteringSubs.data?.length || 0 },
            Mixing: { revenue: mixingSubs.data?.length || 0 * 40, count: mixingSubs.data?.length || 0 },
            Distribution: { revenue: distributionSubs.data?.length || 0 * 30, count: distributionSubs.data?.length || 0 },
          },
        };
      }

      case "engineer-payouts": {
        const { data } = await supabase
          .from("engineer_earnings")
          .select(`
            *,
            projects!inner(engineer_id),
            profiles!inner(full_name)
          `)
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString());

        const grouped = data?.reduce((acc: any, curr: any) => {
          const engineerId = curr.engineer_id;
          if (!acc[engineerId]) {
            acc[engineerId] = {
              engineerName: curr.profiles?.full_name || "Unknown",
              projectCount: 0,
              baseAmount: 0,
              bonusAmount: 0,
              totalAmount: 0,
              status: curr.status,
            };
          }
          acc[engineerId].projectCount++;
          acc[engineerId].baseAmount += Number(curr.base_amount || 0);
          acc[engineerId].bonusAmount += Number(curr.bonus_amount || 0);
          acc[engineerId].totalAmount += Number(curr.total_amount || 0);
          return acc;
        }, {});

        return Object.values(grouped || {});
      }

      case "audit-trail": {
        const { data } = await supabase
          .from("audit_logs")
          .select("*")
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString())
          .order("created_at", { ascending: false })
          .limit(100);

        return data || [];
      }

      default:
        return null;
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const data = await fetchReportData(reportType);
      if (!data) {
        toast.error("No data available for selected report");
        return;
      }

      const reportName = reportTypes.find(r => r.value === reportType)?.label || "Report";
      const filename = `${reportName.replace(/\s+/g, '_')}_${format(dateRange.start, 'yyyy-MM-dd')}_to_${format(dateRange.end, 'yyyy-MM-dd')}`;

      if (exportFormat === "pdf") {
        const generator = new ReportGenerator();
        
        switch (reportType) {
          case "profit-loss":
            generator.generateProfitAndLoss(data, dateRange);
            break;
          case "cash-flow":
            generator.generateCashFlow(data, dateRange);
            break;
          case "revenue-analytics":
            generator.generateRevenueAnalytics(data, dateRange);
            break;
          case "engineer-payouts":
            generator.generateEngineerPayouts(Array.isArray(data) ? data : [], dateRange);
            break;
          case "audit-trail":
            generator.generateAuditTrail(Array.isArray(data) ? data : [], dateRange);
            break;
        }
        
        generator.save(`${filename}.pdf`);
      } else if (exportFormat === "csv") {
        const flatData = Array.isArray(data) ? data : (data && typeof data === 'object' ? Object.entries(data).map(([k, v]) => ({ key: k, value: v })) : []);
        exportToCSV(flatData, `${filename}.csv`);
      } else if (exportFormat === "excel") {
        const flatData = Array.isArray(data) ? data : (data && typeof data === 'object' ? Object.entries(data).map(([k, v]) => ({ key: k, value: v })) : []);
        exportToExcel(flatData, `${filename}.xls`);
      }

      toast.success(`${reportName} generated successfully!`);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Generator</CardTitle>
        <CardDescription>
          Generate and export financial statements, reports, and legal documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Report Type</label>
          <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Date Ranges */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quick Date Range</label>
          <div className="flex flex-wrap gap-2">
            {quickDateRanges.map((range) => (
              <Button
                key={range.label}
                variant="outline"
                size="sm"
                onClick={() => setDateRange(range.getValue())}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.start, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.start}
                  onSelect={(date) => date && setDateRange({ ...dateRange, start: date })}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.end, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.end}
                  onSelect={(date) => date && setDateRange({ ...dateRange, end: date })}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Export Format */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Export Format</label>
          <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF Document</SelectItem>
              <SelectItem value="csv">CSV Spreadsheet</SelectItem>
              <SelectItem value="excel">Excel Compatible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generateReport} 
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          <Download className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate & Download Report"}
        </Button>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileSpreadsheet, FileJson, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";

interface ExportConfig {
  table: string;
  format: 'csv' | 'excel' | 'json';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
}

const availableTables = [
  { id: 'users', name: 'Users', recordCount: 1250 },
  { id: 'projects', name: 'Projects', recordCount: 3420 },
  { id: 'payments', name: 'Payments', recordCount: 2180 },
  { id: 'subscriptions', name: 'Subscriptions', recordCount: 680 },
  { id: 'reviews', name: 'Reviews', recordCount: 1540 },
  { id: 'audio_files', name: 'Audio Files', recordCount: 8920 },
  { id: 'sessions', name: 'Sessions', recordCount: 1820 },
  { id: 'notifications', name: 'Notifications', recordCount: 15600 },
];

const recentExports = [
  { id: '1', name: 'Users Export', format: 'csv', records: 1250, date: '2 hours ago' },
  { id: '2', name: 'Payments Report', format: 'excel', records: 2180, date: '1 day ago' },
  { id: '3', name: 'Projects Data', format: 'json', records: 3420, date: '2 days ago' },
];

export function DataExportManager() {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [format, setFormat] = useState<'csv' | 'excel' | 'json'>('csv');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');

  const handleTableToggle = (tableId: string) => {
    setSelectedTables(prev =>
      prev.includes(tableId)
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const handleExport = () => {
    if (selectedTables.length === 0) {
      toast.error('Please select at least one table to export');
      return;
    }

    toast.success(`Exporting ${selectedTables.length} table(s) as ${format.toUpperCase()}`);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <FileText className="h-4 w-4" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'json':
        return <FileJson className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>Select tables and format for data export</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Configuration */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select value={format} onValueChange={(val: any) => setFormat(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={(val: any) => setDateRange(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Tables to Export</label>
            <div className="grid gap-3 md:grid-cols-2">
              {availableTables.map((table) => (
                <div
                  key={table.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedTables.includes(table.id)}
                      onCheckedChange={() => handleTableToggle(table.id)}
                    />
                    <div>
                      <div className="font-medium">{table.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {table.recordCount.toLocaleString()} records
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleExport} 
            className="w-full gap-2"
            disabled={selectedTables.length === 0}
          >
            <Download className="h-4 w-4" />
            Export {selectedTables.length > 0 && `(${selectedTables.length} tables)`}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
          <CardDescription>Previously generated exports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentExports.map((export_) => (
              <div
                key={export_.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getFormatIcon(export_.format)}
                  <div>
                    <div className="font-medium">{export_.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {export_.records.toLocaleString()} records • {export_.date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{export_.format.toUpperCase()}</Badge>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

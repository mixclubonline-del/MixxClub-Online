import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, X, Play, Save, FileText, Download, Calendar, Clock, Trash2, BarChart3, PieChart, TrendingUp, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ReportFilter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface SavedReport {
  id: string;
  name: string;
  description: string;
  dataSource: string;
  fields: string[];
  filters: ReportFilter[];
  visualization: string;
  schedule: string | null;
  lastRun: string | null;
  createdAt: string;
}

interface ReportResult {
  columns: string[];
  rows: Record<string, unknown>[];
  totalCount: number;
}

const dataSources = [
  { id: 'profiles', name: 'Users', fields: ['id', 'email', 'full_name', 'role', 'created_at', 'is_verified', 'points', 'level'] },
  { id: 'projects', name: 'Projects', fields: ['id', 'title', 'status', 'genre', 'budget', 'created_at', 'artist_id'] },
  { id: 'collaboration_sessions', name: 'Sessions', fields: ['id', 'title', 'status', 'host_user_id', 'created_at', 'session_type'] },
  { id: 'engineer_earnings', name: 'Earnings', fields: ['id', 'engineer_id', 'amount', 'status', 'created_at', 'payment_date'] },
  { id: 'marketplace_items', name: 'Marketplace', fields: ['id', 'item_name', 'price', 'status', 'sales_count', 'created_at'] },
  { id: 'job_postings', name: 'Jobs', fields: ['id', 'title', 'status', 'budget', 'genre', 'created_at'] },
];

const operators = [
  { id: 'eq', name: 'equals', symbol: '=' },
  { id: 'neq', name: 'not equals', symbol: '!=' },
  { id: 'gt', name: 'greater than', symbol: '>' },
  { id: 'lt', name: 'less than', symbol: '<' },
  { id: 'gte', name: 'greater or equal', symbol: '>=' },
  { id: 'lte', name: 'less or equal', symbol: '<=' },
  { id: 'like', name: 'contains', symbol: 'LIKE' },
  { id: 'is', name: 'is null', symbol: 'IS NULL' },
  { id: 'not', name: 'is not null', symbol: 'IS NOT NULL' },
];

const visualizations = [
  { id: 'table', name: 'Table', icon: TableIcon },
  { id: 'bar', name: 'Bar Chart', icon: BarChart3 },
  { id: 'pie', name: 'Pie Chart', icon: PieChart },
  { id: 'line', name: 'Line Chart', icon: TrendingUp },
];

export function EnhancedReportBuilder() {
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [visualization, setVisualization] = useState('table');
  const [schedule, setSchedule] = useState<string | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');

  const currentDataSource = dataSources.find(ds => ds.id === dataSource);
  const availableFields = currentDataSource?.fields || [];

  const addFilter = () => {
    if (!dataSource) {
      toast.error('Please select a data source first');
      return;
    }
    const newFilter: ReportFilter = {
      id: Date.now().toString(),
      field: availableFields[0] || '',
      operator: 'eq',
      value: ''
    };
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const updateFilter = (id: string, key: keyof ReportFilter, value: string) => {
    setFilters(filters.map(f => 
      f.id === id ? { ...f, [key]: value } : f
    ));
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleRunReport = async () => {
    if (!dataSource) {
      toast.error('Please select a data source');
      return;
    }

    if (selectedFields.length === 0) {
      toast.error('Please select at least one field');
      return;
    }

    setIsRunning(true);
    try {
      // Use a simple query approach that works with any table
      const { data, error, count } = await supabase
        .from(dataSource as 'profiles')
        .select(selectedFields.join(','), { count: 'exact' })
        .limit(1000);

      if (error) throw error;

      setReportResult({
        columns: selectedFields,
        rows: (data || []) as Record<string, unknown>[],
        totalCount: count || 0,
      });

      toast.success(`Report generated: ${count} records found`);
      setActiveTab('results');
    } catch (error) {
      console.error('Report error:', error);
      toast.error('Failed to run report');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveReport = () => {
    if (!reportName) {
      toast.error('Please enter a report name');
      return;
    }

    if (!dataSource) {
      toast.error('Please select a data source');
      return;
    }

    const newReport: SavedReport = {
      id: Date.now().toString(),
      name: reportName,
      description: reportDescription,
      dataSource,
      fields: selectedFields,
      filters,
      visualization,
      schedule,
      lastRun: null,
      createdAt: new Date().toISOString(),
    };

    setSavedReports([...savedReports, newReport]);
    toast.success(`Report "${reportName}" saved successfully`);
  };

  const handleExportCSV = () => {
    if (!reportResult) return;

    const headers = reportResult.columns.join(',');
    const rows = reportResult.rows.map(row => 
      reportResult.columns.map(col => {
        const val = row[col];
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val}"`;
        }
        return val ?? '';
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName || 'report'}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Report exported as CSV');
  };

  const loadSavedReport = (report: SavedReport) => {
    setReportName(report.name);
    setReportDescription(report.description);
    setDataSource(report.dataSource);
    setSelectedFields(report.fields);
    setFilters(report.filters);
    setVisualization(report.visualization);
    setSchedule(report.schedule);
    setActiveTab('builder');
    toast.info(`Loaded report: ${report.name}`);
  };

  const deleteSavedReport = (id: string) => {
    setSavedReports(savedReports.filter(r => r.id !== id));
    toast.success('Report deleted');
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
          <TabsTrigger value="results" disabled={!reportResult}>Results</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Build Custom Report
              </CardTitle>
              <CardDescription>Create custom data reports with filters and visualizations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Name & Description */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Report Name</Label>
                  <Input
                    placeholder="e.g., Monthly Active Users"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input
                    placeholder="Brief description of this report"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Data Source Selection */}
              <div className="space-y-2">
                <Label>Data Source</Label>
                <Select value={dataSource} onValueChange={(val) => {
                  setDataSource(val);
                  setSelectedFields([]);
                  setFilters([]);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a data source" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataSources.map(ds => (
                      <SelectItem key={ds.id} value={ds.id}>{ds.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Field Selection */}
              {dataSource && (
                <div className="space-y-2">
                  <Label>Select Fields</Label>
                  <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/50">
                    {availableFields.map((field) => (
                      <div key={field} className="flex items-center space-x-2">
                        <Checkbox
                          id={field}
                          checked={selectedFields.includes(field)}
                          onCheckedChange={() => toggleField(field)}
                        />
                        <label
                          htmlFor={field}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {field}
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedFields.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {selectedFields.length} field(s) selected
                    </p>
                  )}
                </div>
              )}

              {/* Filters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Filters</Label>
                  <Button variant="outline" size="sm" onClick={addFilter} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Filter
                  </Button>
                </div>

                {filters.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm border rounded-lg">
                    No filters added. Click "Add Filter" to create conditions.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filters.map((filter, index) => (
                      <div key={filter.id} className="flex gap-3 items-center p-3 rounded-lg border bg-card">
                        {index > 0 && (
                          <Badge variant="outline" className="mr-2">AND</Badge>
                        )}
                        <Select
                          value={filter.field}
                          onValueChange={(val) => updateFilter(filter.id, 'field', val)}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFields.map(field => (
                              <SelectItem key={field} value={field}>{field}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={filter.operator}
                          onValueChange={(val) => updateFilter(filter.id, 'operator', val)}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map(op => (
                              <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {!['is', 'not'].includes(filter.operator) && (
                          <Input
                            placeholder="Value"
                            value={filter.value}
                            onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                            className="flex-1"
                          />
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFilter(filter.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Visualization */}
              <div className="space-y-2">
                <Label>Visualization</Label>
                <div className="flex gap-2">
                  {visualizations.map(viz => {
                    const Icon = viz.icon;
                    return (
                      <Button
                        key={viz.id}
                        variant={visualization === viz.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setVisualization(viz.id)}
                        className="gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {viz.name}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <Label>Schedule (optional)</Label>
                <Select value={schedule || ''} onValueChange={(val) => setSchedule(val || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Run on demand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Run on demand</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={handleRunReport} className="flex-1 gap-2" disabled={isRunning}>
                  <Play className="h-4 w-4" />
                  {isRunning ? 'Running...' : 'Run Report'}
                </Button>
                <Button onClick={handleSaveReport} variant="outline" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          {reportResult && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Report Results</CardTitle>
                    <CardDescription>
                      {reportResult.totalCount} total records • Showing up to 1000
                    </CardDescription>
                  </div>
                  <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        {reportResult.columns.map(col => (
                          <th key={col} className="text-left p-2 font-medium text-sm">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportResult.rows.slice(0, 100).map((row, i) => (
                        <tr key={i} className="border-b hover:bg-muted/50">
                          {reportResult.columns.map(col => (
                            <td key={col} className="p-2 text-sm">
                              {row[col] === null ? (
                                <span className="text-muted-foreground italic">null</span>
                              ) : typeof row[col] === 'object' ? (
                                JSON.stringify(row[col])
                              ) : (
                                String(row[col])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportResult.rows.length > 100 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Showing 100 of {reportResult.rows.length} rows. Export to see all data.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Reports</CardTitle>
              <CardDescription>Quick access to your saved custom reports</CardDescription>
            </CardHeader>
            <CardContent>
              {savedReports.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No saved reports yet</p>
                  <p className="text-sm">Create and save a report to see it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {report.description || 'No description'}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{report.dataSource}</Badge>
                          <Badge variant="secondary">{report.fields.length} fields</Badge>
                          <Badge variant="secondary">{report.filters.length} filters</Badge>
                          {report.schedule && (
                            <Badge variant="default" className="gap-1">
                              <Clock className="h-3 w-3" />
                              {report.schedule}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => loadSavedReport(report)}>
                          Load
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteSavedReport(report.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

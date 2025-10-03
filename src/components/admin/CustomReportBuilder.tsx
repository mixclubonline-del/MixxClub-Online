import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Play, Save, FileText } from "lucide-react";
import { toast } from "sonner";

interface ReportFilter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

const savedReports = [
  { id: '1', name: 'Monthly Revenue Report', filters: 3, lastRun: '2 hours ago' },
  { id: '2', name: 'Active Users Report', filters: 2, lastRun: '1 day ago' },
  { id: '3', name: 'Project Completion Report', filters: 4, lastRun: '3 days ago' },
];

const availableFields = [
  'user_id', 'email', 'created_at', 'status', 'amount', 'project_count',
  'subscription_tier', 'last_active', 'total_revenue', 'rating'
];

const operators = ['equals', 'not equals', 'greater than', 'less than', 'contains', 'starts with'];

export function CustomReportBuilder() {
  const [reportName, setReportName] = useState('');
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const addFilter = () => {
    const newFilter: ReportFilter = {
      id: Date.now().toString(),
      field: availableFields[0],
      operator: operators[0],
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

  const handleRunReport = () => {
    if (!reportName) {
      toast.error('Please enter a report name');
      return;
    }
    toast.success('Running report...');
  };

  const handleSaveReport = () => {
    if (!reportName) {
      toast.error('Please enter a report name');
      return;
    }
    toast.success(`Report "${reportName}" saved successfully`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Build Custom Report
          </CardTitle>
          <CardDescription>Create custom data reports with filters and aggregations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Report Name</label>
            <Input
              placeholder="e.g., Monthly Active Users Report"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>

          {/* Select Fields */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Fields to Include</label>
            <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/50">
              {availableFields.map((field) => (
                <Badge
                  key={field}
                  variant={selectedFields.includes(field) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedFields(prev =>
                      prev.includes(field)
                        ? prev.filter(f => f !== field)
                        : [...prev, field]
                    );
                  }}
                >
                  {field}
                </Badge>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Filters</label>
              <Button variant="outline" size="sm" onClick={addFilter} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Filter
              </Button>
            </div>

            {filters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No filters added. Click "Add Filter" to create conditions.
              </div>
            ) : (
              <div className="space-y-3">
                {filters.map((filter) => (
                  <div key={filter.id} className="flex gap-3 items-center p-3 rounded-lg border bg-card">
                    <Select
                      value={filter.field}
                      onValueChange={(val) => updateFilter(filter.id, 'field', val)}
                    >
                      <SelectTrigger className="w-[180px]">
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
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map(op => (
                          <SelectItem key={op} value={op}>{op}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Value"
                      value={filter.value}
                      onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                      className="flex-1"
                    />

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

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleRunReport} className="flex-1 gap-2">
              <Play className="h-4 w-4" />
              Run Report
            </Button>
            <Button onClick={handleSaveReport} variant="outline" className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Reports</CardTitle>
          <CardDescription>Quick access to your saved custom reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {savedReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div>
                  <div className="font-medium">{report.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {report.filters} filters • Last run {report.lastRun}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    Edit
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

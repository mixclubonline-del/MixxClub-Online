import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

export const AuditLogViewer = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("7days");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["audit-logs", actionFilter, dateRange, currentPage, pageSize],
    queryFn: async () => {
      // Get total count
      let countQuery = supabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true });

      if (actionFilter !== "all") {
        countQuery = countQuery.eq("action", actionFilter);
      }

      const daysAgo = dateRange === "7days" ? 7 : dateRange === "30days" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      countQuery = countQuery.gte("created_at", startDate.toISOString());

      const { count } = await countQuery;

      // Get paginated data
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (actionFilter !== "all") {
        query = query.eq("action", actionFilter);
      }

      query = query.gte("created_at", startDate.toISOString());

      const { data, error } = await query;
      if (error) throw error;
      
      return {
        logs: data || [],
        totalCount: count || 0,
      };
    },
  });

  const logs = logsData?.logs || [];
  const totalCount = logsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const exportLogs = () => {
    if (!logs || logs.length === 0) {
      toast({ title: "No logs to export", variant: "destructive" });
      return;
    }

    const csv = [
      ["Timestamp", "User ID", "Action", "Table", "Record ID"].join(","),
      ...logs.map(log => [
        new Date(log.created_at).toISOString(),
        log.user_id || "system",
        log.action,
        log.table_name,
        log.record_id || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();

    toast({ title: "Logs exported successfully" });
  };

  const filteredLogs = logs?.filter(log =>
    searchTerm === "" ||
    log.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log Viewer</CardTitle>
        <CardDescription>Track all system actions and data changes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="INSERT">Insert</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportLogs} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(pageSize)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {filteredLogs?.map((log) => (
                <Card key={log.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{log.action}</span>
                        <span className="text-sm text-muted-foreground">on {log.table_name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                      {log.user_id && (
                        <div className="text-xs text-muted-foreground">User: {log.user_id}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {log.old_data && (
                        <div className="text-xs bg-destructive/10 px-2 py-1 rounded">Old Data</div>
                      )}
                      {log.new_data && (
                        <div className="text-xs bg-primary/10 px-2 py-1 rounded">New Data</div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {filteredLogs?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No audit logs found
                </div>
              )}
            </div>

            {totalPages > 0 && (
              <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalCount}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

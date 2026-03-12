/**
 * AdminAuditLogViewer — Filterable, color-coded security timeline from audit_logs.
 * Highlights suspicious patterns, supports CSV export and detail expansion.
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Shield, Search, Download, ChevronDown, ChevronRight, AlertTriangle, ChevronLeft, ChevronRight as ChevronRightNav } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GlassPanel, HubHeader, HubSkeleton, EmptyState } from '@/components/crm/design';
import { exportToCSV } from '@/utils/csvExport';

const PAGE_SIZE = 50;

const ACTION_COLORS: Record<string, string> = {
  login_failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  role_change: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  login: 'bg-green-500/20 text-green-400 border-green-500/30',
  signup: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delete: 'bg-red-500/20 text-red-400 border-red-500/30',
  update: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  create: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export const AdminAuditLogViewer = () => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const logs = useQuery({
    queryKey: ['admin-audit-logs', actionFilter, search, page],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (search) {
        query = query.or(`action.ilike.%${search}%,user_id.ilike.%${search}%,table_name.ilike.%${search}%`);
      }

      const { data, count, error } = await query;
      if (error) throw error;
      return { data: data || [], total: count || 0 };
    },
    staleTime: 30_000,
  });

  // Detect suspicious patterns: 5+ failed logins from same IP in recent results
  const suspiciousIps = useMemo(() => {
    if (!logs.data?.data) return new Set<string>();
    const ipCounts: Record<string, number> = {};
    logs.data.data
      .filter((l: any) => l.action === 'login_failed')
      .forEach((l: any) => {
        if (l.ip_address) {
          ipCounts[l.ip_address] = (ipCounts[l.ip_address] || 0) + 1;
        }
      });
    return new Set(Object.entries(ipCounts).filter(([, c]) => c >= 5).map(([ip]) => ip));
  }, [logs.data]);

  const handleExport = () => {
    if (!logs.data?.data?.length) return;
    const exportData = logs.data.data.map((l: any) => ({
      Timestamp: format(new Date(l.created_at), 'PPpp'),
      Action: l.action,
      'User ID': l.user_id || '',
      Table: l.table_name || '',
      'Record ID': l.record_id || '',
      IP: l.ip_address || '',
      'User Agent': l.user_agent || '',
    }));
    exportToCSV(exportData, 'audit-logs');
  };

  const totalPages = Math.ceil((logs.data?.total || 0) / PAGE_SIZE);

  const uniqueActions = useMemo(() => {
    return ['all', 'login', 'login_failed', 'signup', 'create', 'update', 'delete', 'role_change'];
  }, []);

  return (
    <div className="space-y-6">
      <HubHeader
        icon={<Shield className="w-5 h-5 text-cyan-400" />}
        title="Audit Log"
        subtitle={`${logs.data?.total || 0} events tracked`}
        accent="rgba(34, 211, 238, 0.35)"
        action={
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        }
      />

      {/* Filters */}
      <GlassPanel padding="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 items-center">
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(0); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Action type" />
              </SelectTrigger>
              <SelectContent>
                {uniqueActions.map((a) => (
                  <SelectItem key={a} value={a} className="capitalize">{a === 'all' ? 'All Actions' : a.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search action, user, table..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Button variant="ghost" size="icon" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="whitespace-nowrap">{page + 1}/{totalPages || 1}</span>
              <Button variant="ghost" size="icon" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                <ChevronRightNav className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Log Entries */}
      {logs.isLoading ? (
        <HubSkeleton variant="list" count={8} />
      ) : !logs.data?.data?.length ? (
        <EmptyState
          icon={Shield}
          title="No Audit Events"
          description="No events match your current filters."
        />
      ) : (
        <div className="space-y-1.5">
          {logs.data.data.map((log: any) => {
            const isExpanded = expandedId === log.id;
            const colorClass = ACTION_COLORS[log.action] || 'bg-muted/30 text-muted-foreground border-border/50';
            const isSuspicious = log.action === 'login_failed' && log.ip_address && suspiciousIps.has(log.ip_address);

            return (
              <GlassPanel
                key={log.id}
                hoverable
                onClick={() => setExpandedId(isExpanded ? null : log.id)}
                padding="p-3"
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                  <Badge variant="outline" className={`text-[10px] capitalize font-mono ${colorClass}`}>
                    {log.action}
                  </Badge>
                  {isSuspicious && (
                    <Badge variant="outline" className="text-[10px] bg-red-500/20 text-red-400 border-red-500/40 gap-1">
                      <AlertTriangle className="w-3 h-3" /> Suspicious
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {log.table_name && <span className="text-foreground/70 font-mono">{log.table_name}</span>}
                    {log.user_id && <span className="ml-2">User: {log.user_id.slice(0, 8)}…</span>}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border/30 space-y-2 text-xs">
                    {log.user_id && (
                      <div><span className="text-muted-foreground">User ID:</span> <span className="text-foreground font-mono">{log.user_id}</span></div>
                    )}
                    {log.ip_address && (
                      <div><span className="text-muted-foreground">IP:</span> <span className="text-foreground font-mono">{log.ip_address}</span></div>
                    )}
                    {log.user_agent && (
                      <div><span className="text-muted-foreground">User Agent:</span> <span className="text-foreground truncate">{log.user_agent}</span></div>
                    )}
                    {log.record_id && (
                      <div><span className="text-muted-foreground">Record:</span> <span className="text-foreground font-mono">{log.record_id}</span></div>
                    )}
                    {log.old_data && (
                      <div>
                        <span className="text-muted-foreground">Old Data:</span>
                        <pre className="mt-1 p-2 rounded bg-background/50 text-foreground overflow-x-auto text-[11px]">{JSON.stringify(log.old_data, null, 2)}</pre>
                      </div>
                    )}
                    {log.new_data && (
                      <div>
                        <span className="text-muted-foreground">New Data:</span>
                        <pre className="mt-1 p-2 rounded bg-background/50 text-foreground overflow-x-auto text-[11px]">{JSON.stringify(log.new_data, null, 2)}</pre>
                      </div>
                    )}
                    {log.details && (
                      <div>
                        <span className="text-muted-foreground">Details:</span>
                        <pre className="mt-1 p-2 rounded bg-background/50 text-foreground overflow-x-auto text-[11px]">{JSON.stringify(log.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </GlassPanel>
            );
          })}
        </div>
      )}
    </div>
  );
};

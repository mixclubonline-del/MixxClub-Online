import { Card } from '@/components/ui/card';
import { useDatabaseStats } from '@/hooks/useAnalyticsViews';
import { Database, HardDrive, Trash2, Table } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function DatabaseStats() {
  const { data: stats, isLoading } = useDatabaseStats();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Card>
    );
  }

  const totalRows = stats?.reduce((sum, table) => sum + (table.total_rows || 0), 0) || 0;
  const totalDeleted = stats?.reduce((sum, table) => sum + (table.deleted_rows || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Tables</p>
              <p className="text-2xl font-bold">{stats?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Table className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="text-2xl font-bold">{totalRows.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Trash2 className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deleted Records</p>
              <p className="text-2xl font-bold">{totalDeleted.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <HardDrive className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Size</p>
              <p className="text-2xl font-bold">
                {stats?.reduce((sum, table) => {
                  const size = table.table_size?.match(/(\d+)\s*(\w+)/);
                  if (!size) return sum;
                  const value = parseInt(size[1]);
                  const unit = size[2];
                  if (unit === 'GB') return sum + value * 1024;
                  if (unit === 'MB') return sum + value;
                  return sum;
                }, 0).toFixed(0)} MB
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Table Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Table Name</th>
                <th className="text-right py-3 px-4 font-medium">Total Rows</th>
                <th className="text-right py-3 px-4 font-medium">Active Rows</th>
                <th className="text-right py-3 px-4 font-medium">Deleted Rows</th>
                <th className="text-right py-3 px-4 font-medium">Size</th>
              </tr>
            </thead>
            <tbody>
              {stats?.map((table) => (
                <tr key={table.table_name} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-mono text-sm">{table.table_name}</td>
                  <td className="py-3 px-4 text-right">{table.total_rows?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    {table.active_rows !== null ? table.active_rows.toLocaleString() : '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {table.deleted_rows !== null ? (
                      <span className={table.deleted_rows > 0 ? 'text-orange-500' : ''}>
                        {table.deleted_rows.toLocaleString()}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm">{table.table_size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

interface DataExporterProps<T> {
  data: T[];
  filename?: string;
  headers?: Record<keyof T, string>;
}

export function DataExporter<T extends Record<string, any>>({
  data,
  filename = 'export',
  headers,
}: DataExporterProps<T>) {
  const exportToJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadFile(blob, `${filename}.json`);
    toast.success('Exported to JSON');
  };

  const exportToCSV = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const keys = Object.keys(data[0]) as (keyof T)[];
    const headerRow = headers
      ? keys.map(key => headers[key] || String(key)).join(',')
      : keys.join(',');

    const rows = data.map(item =>
      keys.map(key => {
        const value = item[key];
        // Handle values with commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    );

    const csv = [headerRow, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadFile(blob, `${filename}.csv`);
    toast.success('Exported to CSV');
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

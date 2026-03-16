import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileSpreadsheet, FileJson } from 'lucide-react';
import { format, subDays, startOfYear } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface RevenueFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onExportCSV?: () => void;
  onExportJSON?: () => void;
  onExportTax?: () => void;
  showTaxExport?: boolean;
}

const PRESETS = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: 'YTD', days: -1 },
  { label: 'All', days: 0 },
] as const;

export function RevenueFilters({
  dateRange, onDateRangeChange, onExportCSV, onExportJSON, onExportTax, showTaxExport,
}: RevenueFiltersProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const applyPreset = (days: number) => {
    if (days === 0) {
      onDateRangeChange({ from: undefined, to: undefined });
    } else if (days === -1) {
      onDateRangeChange({ from: startOfYear(new Date()), to: new Date() });
    } else {
      onDateRangeChange({ from: subDays(new Date(), days), to: new Date() });
    }
  };

  const displayLabel = dateRange.from && dateRange.to
    ? `${format(dateRange.from, 'MMM d')} – ${format(dateRange.to, 'MMM d, yyyy')}`
    : 'All time';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preset buttons */}
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
        {PRESETS.map(p => (
          <Button
            key={p.label}
            variant="ghost"
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => applyPreset(p.days)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Custom date range */}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <CalendarIcon className="w-3.5 h-3.5" />
            {displayLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
            onSelect={(range) => {
              onDateRangeChange({ from: range?.from, to: range?.to });
              if (range?.from && range?.to) setCalendarOpen(false);
            }}
            numberOfMonths={2}
            className={cn('p-3 pointer-events-auto')}
          />
        </PopoverContent>
      </Popover>

      {/* Export dropdown */}
      {(onExportCSV || onExportJSON || onExportTax) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export Format</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {onExportCSV && (
              <DropdownMenuItem onClick={onExportCSV}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
            )}
            {onExportJSON && (
              <DropdownMenuItem onClick={onExportJSON}>
                <FileJson className="w-4 h-4 mr-2" />
                Export JSON
              </DropdownMenuItem>
            )}
            {showTaxExport && onExportTax && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onExportTax}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Tax-Ready Export
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

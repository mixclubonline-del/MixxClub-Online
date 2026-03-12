import React, { useMemo, useState } from 'react';
import { ScenarioKey, REVENUE_STREAMS, projectStream, projectAll } from './projectionModels';
import { GlassPanel } from '@/components/crm/design';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpDown } from 'lucide-react';

interface Props { scenario: ScenarioKey; }

type SortKey = 'name' | 'mo1' | 'mo6' | 'mo12' | 'annual' | 'pct';

export const StreamProjectionTable: React.FC<Props> = React.memo(({ scenario }) => {
  const [sortKey, setSortKey] = useState<SortKey>('annual');
  const [sortAsc, setSortAsc] = useState(false);

  const rows = useMemo(() => {
    const proj = projectAll(scenario);
    return REVENUE_STREAMS.map((s, idx) => {
      const monthly = proj.streamData[idx].monthly;
      const annual = monthly.reduce((a, b) => a + b, 0);
      return { stream: s, mo1: monthly[0], mo6: monthly[5], mo12: monthly[11], annual, pct: (annual / proj.annualTotal) * 100 };
    });
  }, [scenario]);

  const sorted = useMemo(() => {
    const arr = [...rows];
    const dir = sortAsc ? 1 : -1;
    arr.sort((a, b) => {
      if (sortKey === 'name') return dir * a.stream.name.localeCompare(b.stream.name);
      return dir * ((a[sortKey] as number) - (b[sortKey] as number));
    });
    return arr;
  }, [rows, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortBtn = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <button onClick={() => toggleSort(k)} className="flex items-center gap-1 hover:text-foreground transition-colors">
      {children}
      <ArrowUpDown className="w-3 h-3 opacity-40" />
    </button>
  );

  return (
    <GlassPanel className="w-full overflow-hidden" padding="p-0">
      <div className="p-4 sm:p-6 pb-2">
        <h3 className="text-sm font-semibold text-foreground">Revenue Streams Breakdown</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5">
              <TableHead><SortBtn k="name">Stream</SortBtn></TableHead>
              <TableHead className="text-right"><SortBtn k="mo1">Mo 1</SortBtn></TableHead>
              <TableHead className="text-right"><SortBtn k="mo6">Mo 6</SortBtn></TableHead>
              <TableHead className="text-right"><SortBtn k="mo12">Mo 12</SortBtn></TableHead>
              <TableHead className="text-right"><SortBtn k="annual">Annual</SortBtn></TableHead>
              <TableHead className="text-right"><SortBtn k="pct">% Rev</SortBtn></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map(r => (
              <TableRow key={r.stream.id} className="border-white/5 hover:bg-white/5">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.stream.color }} />
                    <span className="text-sm">{r.stream.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm font-mono">{formatCurrency(r.mo1)}</TableCell>
                <TableCell className="text-right text-sm font-mono">{formatCurrency(r.mo6)}</TableCell>
                <TableCell className="text-right text-sm font-mono">{formatCurrency(r.mo12)}</TableCell>
                <TableCell className="text-right text-sm font-mono font-semibold">{formatCurrency(r.annual)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(r.pct, 100)}%`, background: r.stream.color }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">{r.pct.toFixed(1)}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </GlassPanel>
  );
});

StreamProjectionTable.displayName = 'StreamProjectionTable';

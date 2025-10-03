import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMobileDetect } from '@/hooks/useMobileDetect';

interface MobileTableRow {
  id: string;
  cells: {
    label: string;
    value: ReactNode;
    className?: string;
  }[];
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  actions?: ReactNode;
}

interface MobileAdminTableProps {
  rows: MobileTableRow[];
  emptyMessage?: string;
}

export const MobileAdminTable = ({ rows, emptyMessage = 'No data available' }: MobileAdminTableProps) => {
  const { isMobile } = useMobileDetect();

  if (!isMobile) return null;

  if (rows.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <Card key={row.id} className="overflow-hidden touch-manipulation">
          <CardContent className="p-4 space-y-3">
            {/* Badge if present */}
            {row.badge && (
              <div className="flex justify-end">
                <Badge variant={row.badge.variant || 'default'}>
                  {row.badge.label}
                </Badge>
              </div>
            )}

            {/* Table cells as key-value pairs */}
            <div className="space-y-2">
              {row.cells.map((cell, index) => (
                <div key={index} className="flex justify-between items-start gap-2">
                  <span className="text-sm text-muted-foreground font-medium min-w-[100px]">
                    {cell.label}:
                  </span>
                  <span className={`text-sm text-right flex-1 ${cell.className || ''}`}>
                    {cell.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            {row.actions && (
              <div className="pt-2 border-t flex gap-2 flex-wrap">
                {row.actions}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface ResponsiveTableWrapperProps {
  mobileView: ReactNode;
  desktopView: ReactNode;
}

export const ResponsiveTableWrapper = ({ mobileView, desktopView }: ResponsiveTableWrapperProps) => {
  const { isMobile } = useMobileDetect();

  return (
    <>
      <div className={isMobile ? 'block' : 'hidden'}>
        {mobileView}
      </div>
      <div className={isMobile ? 'hidden' : 'block'}>
        {desktopView}
      </div>
    </>
  );
};

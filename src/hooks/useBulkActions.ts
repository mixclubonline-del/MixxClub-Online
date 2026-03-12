import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BulkProgress {
  total: number;
  completed: number;
  failed: number;
  isRunning: boolean;
}

export function useBulkActions() {
  const [progress, setProgress] = useState<BulkProgress>({
    total: 0, completed: 0, failed: 0, isRunning: false,
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const executeBatch = useCallback(async (
    table: string,
    ids: string[],
    updateData: Record<string, unknown>,
    label: string = 'items'
  ) => {
    if (ids.length === 0) return;

    setProgress({ total: ids.length, completed: 0, failed: 0, isRunning: true });

    const BATCH_SIZE = 25;
    let completed = 0;
    let failed = 0;

    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batch = ids.slice(i, i + BATCH_SIZE);
      try {
        const { error } = await (supabase.from as any)(table)
          .update(updateData)
          .in('id', batch);
        if (error) throw error;
        completed += batch.length;
      } catch {
        failed += batch.length;
      }
      setProgress({ total: ids.length, completed, failed, isRunning: true });
    }

    setProgress({ total: ids.length, completed, failed, isRunning: false });

    if (failed === 0) {
      toast.success(`Successfully updated ${completed} ${label}`);
    } else {
      toast.warning(`Updated ${completed} ${label}, ${failed} failed`);
    }

    clearSelection();
    return { completed, failed };
  }, [clearSelection]);

  return {
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    executeBatch,
    progress,
    hasSelection: selectedIds.size > 0,
  };
}

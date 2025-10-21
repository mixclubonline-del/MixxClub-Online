import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface OptimisticUpdateOptions<T> {
  onUpdate: (data: T) => Promise<void>;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticUpdate<T>(options: OptimisticUpdateOptions<T>) {
  const [isUpdating, setIsUpdating] = useState(false);

  const update = useCallback(async (
    optimisticData: T,
    actualUpdate: () => Promise<T>
  ) => {
    setIsUpdating(true);

    // Apply optimistic update immediately
    try {
      await options.onUpdate(optimisticData);
    } catch (error) {
      console.error('Failed to apply optimistic update:', error);
    }

    try {
      // Perform actual update
      const result = await actualUpdate();
      
      // Apply real result
      await options.onUpdate(result);

      if (options.successMessage) {
        toast({
          title: 'Success',
          description: options.successMessage,
        });
      }

      setIsUpdating(false);
      return result;
    } catch (error) {
      // Revert optimistic update on error
      if (options.onError) {
        options.onError(error as Error);
      }

      toast({
        variant: 'destructive',
        title: 'Error',
        description: options.errorMessage || 'Failed to update. Please try again.',
      });

      setIsUpdating(false);
      throw error;
    }
  }, [options]);

  return { update, isUpdating };
}

// Optimistic list operations
export function useOptimisticList<T extends { id: string | number }>(initialItems: T[]) {
  const [items, setItems] = useState(initialItems);

  const addItem = useCallback(async (
    item: T,
    actualAdd: () => Promise<T>
  ) => {
    // Optimistically add
    setItems(prev => [...prev, item]);

    try {
      const result = await actualAdd();
      // Replace optimistic item with real one
      setItems(prev => prev.map(i => i.id === item.id ? result : i));
      return result;
    } catch (error) {
      // Revert on error
      setItems(prev => prev.filter(i => i.id !== item.id));
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add item',
      });
      throw error;
    }
  }, []);

  const updateItem = useCallback(async (
    id: string | number,
    updates: Partial<T>,
    actualUpdate: () => Promise<T>
  ) => {
    // Store original for rollback
    const original = items.find(i => i.id === id);
    
    // Optimistically update
    setItems(prev => prev.map(i => 
      i.id === id ? { ...i, ...updates } : i
    ));

    try {
      const result = await actualUpdate();
      setItems(prev => prev.map(i => i.id === id ? result : i));
      return result;
    } catch (error) {
      // Revert on error
      if (original) {
        setItems(prev => prev.map(i => i.id === id ? original : i));
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update item',
      });
      throw error;
    }
  }, [items]);

  const deleteItem = useCallback(async (
    id: string | number,
    actualDelete: () => Promise<void>
  ) => {
    // Store original for rollback
    const original = items.find(i => i.id === id);
    
    // Optimistically delete
    setItems(prev => prev.filter(i => i.id !== id));

    try {
      await actualDelete();
    } catch (error) {
      // Revert on error
      if (original) {
        setItems(prev => [...prev, original]);
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete item',
      });
      throw error;
    }
  }, [items]);

  return {
    items,
    setItems,
    addItem,
    updateItem,
    deleteItem,
  };
}

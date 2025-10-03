import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface OptimisticUpdateOptions<T, V> {
  queryKey: string[];
  mutationFn: (variables: V) => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  optimisticUpdate?: (variables: V, currentData: any) => any;
}

export function useOptimisticUpdate<T, V>({
  queryKey,
  mutationFn,
  onSuccess,
  onError,
  optimisticUpdate,
}: OptimisticUpdateOptions<T, V>) {
  const queryClient = useQueryClient();
  const [isOptimistic, setIsOptimistic] = useState(false);

  const mutation = useMutation({
    mutationFn,
    onMutate: async (variables) => {
      setIsOptimistic(true);
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update
      if (optimisticUpdate && previousData) {
        queryClient.setQueryData(queryKey, optimisticUpdate(variables, previousData));
      }

      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      setIsOptimistic(false);
      onError?.(error as Error);
    },
    onSuccess: (data) => {
      setIsOptimistic(false);
      onSuccess?.(data);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    ...mutation,
    isOptimistic,
  };
}

// Specific hook for project updates
export function useOptimisticProjectUpdate() {
  return useOptimisticUpdate({
    queryKey: ['projects'],
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      // Your API call here
      return { id, ...updates };
    },
    optimisticUpdate: (variables, currentData: any[]) => {
      return currentData.map(project =>
        project.id === variables.id
          ? { ...project, ...variables.updates }
          : project
      );
    },
  });
}

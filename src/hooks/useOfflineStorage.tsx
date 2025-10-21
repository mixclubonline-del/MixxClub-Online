import { useState, useEffect, useCallback } from 'react';

interface CacheConfig {
  key: string;
  ttl?: number; // Time to live in milliseconds
}

export const useOfflineStorage = <T,>(config: CacheConfig) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);

  const getCachedData = useCallback(() => {
    try {
      const cached = localStorage.getItem(config.key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      
      if (config.ttl) {
        const age = Date.now() - timestamp;
        if (age > config.ttl) {
          setIsStale(true);
        }
      }

      return data as T;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }, [config.key, config.ttl]);

  const setCachedData = useCallback((newData: T) => {
    try {
      const cacheEntry = {
        data: newData,
        timestamp: Date.now(),
      };
      localStorage.setItem(config.key, JSON.stringify(cacheEntry));
      setData(newData);
      setIsStale(false);
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }, [config.key]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(config.key);
    setData(null);
    setIsStale(false);
  }, [config.key]);

  const fetchWithCache = useCallback(async (
    fetcher: () => Promise<T>,
    options?: { forceRefresh?: boolean }
  ) => {
    setIsLoading(true);

    // Try to load from cache first
    if (!options?.forceRefresh) {
      const cached = getCachedData();
      if (cached) {
        setData(cached);
        setIsLoading(false);
        
        // Fetch in background if stale
        if (isStale) {
          try {
            const fresh = await fetcher();
            setCachedData(fresh);
          } catch (error) {
            console.error('Background fetch failed:', error);
          }
        }
        return cached;
      }
    }

    // No cache or force refresh
    try {
      const fresh = await fetcher();
      setCachedData(fresh);
      setIsLoading(false);
      return fresh;
    } catch (error) {
      // If fetch fails, try to return stale cache
      const cached = getCachedData();
      if (cached) {
        setData(cached);
        setIsStale(true);
      }
      setIsLoading(false);
      throw error;
    }
  }, [getCachedData, setCachedData, isStale]);

  useEffect(() => {
    const cached = getCachedData();
    if (cached) {
      setData(cached);
    }
    setIsLoading(false);
  }, [getCachedData]);

  return {
    data,
    isLoading,
    isStale,
    setData: setCachedData,
    clearCache,
    fetchWithCache,
  };
};

// Simple in-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class ResponseCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  
  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }
  
  set(key: string, data: T, ttlMs: number): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs
    });
  }
  
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

// Export singleton instances for different cache types
export const analysisCache = new ResponseCache(50); // Audio analysis results
export const businessMetricsCache = new ResponseCache(10); // Business metrics for admin
export const audioProcessingCache = new ResponseCache(30); // Processed audio metadata

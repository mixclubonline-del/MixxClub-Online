/**
 * State Manager - Handles persistence and recovery of application state
 */

const STATE_VERSION = '1.0';
const STATE_PREFIX = 'mixxclub_state_';

interface StoredState<T> {
  version: string;
  timestamp: number;
  data: T;
}

class StateManager {
  private memoryCache = new Map<string, any>();
  private saveTimers = new Map<string, NodeJS.Timeout>();

  /**
   * Save state to localStorage with debouncing
   */
  saveState<T>(key: string, data: T, debounceMs: number = 500): void {
    // Clear existing timer
    const existingTimer = this.saveTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Update memory cache immediately
    this.memoryCache.set(key, data);

    // Debounce localStorage write
    const timer = setTimeout(() => {
      try {
        const stored: StoredState<T> = {
          version: STATE_VERSION,
          timestamp: Date.now(),
          data
        };
        localStorage.setItem(STATE_PREFIX + key, JSON.stringify(stored));
        this.saveTimers.delete(key);
      } catch (error) {
        console.error(`Failed to save state for ${key}:`, error);
      }
    }, debounceMs);

    this.saveTimers.set(key, timer);
  }

  /**
   * Load state from localStorage with fallback to memory cache
   */
  loadState<T>(key: string, maxAge?: number): T | null {
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // Load from localStorage
    try {
      const stored = localStorage.getItem(STATE_PREFIX + key);
      if (!stored) return null;

      const parsed: StoredState<T> = JSON.parse(stored);

      // Check version compatibility
      if (parsed.version !== STATE_VERSION) {
        console.warn(`State version mismatch for ${key}, clearing old data`);
        this.clearState(key);
        return null;
      }

      // Check age if maxAge specified
      if (maxAge && Date.now() - parsed.timestamp > maxAge) {
        
        this.clearState(key);
        return null;
      }

      // Cache in memory
      this.memoryCache.set(key, parsed.data);
      return parsed.data;
    } catch (error) {
      console.error(`Failed to load state for ${key}:`, error);
      return null;
    }
  }

  /**
   * Clear specific state
   */
  clearState(key: string): void {
    this.memoryCache.delete(key);
    const timer = this.saveTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.saveTimers.delete(key);
    }
    try {
      localStorage.removeItem(STATE_PREFIX + key);
    } catch (error) {
      console.error(`Failed to clear state for ${key}:`, error);
    }
  }

  /**
   * Clear all app state
   */
  clearAllState(): void {
    this.memoryCache.clear();
    this.saveTimers.forEach(timer => clearTimeout(timer));
    this.saveTimers.clear();
    
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(STATE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear all state:', error);
    }
  }

  /**
   * Get all stored keys
   */
  getAllKeys(): string[] {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(STATE_PREFIX))
      .map(key => key.replace(STATE_PREFIX, ''));
  }

  /**
   * Cleanup on unmount
   */
  cleanup(): void {
    this.saveTimers.forEach(timer => clearTimeout(timer));
    this.saveTimers.clear();
  }
}

export const stateManager = new StateManager();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    stateManager.cleanup();
  });
}

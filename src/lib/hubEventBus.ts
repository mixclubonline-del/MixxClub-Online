// Cross-Hub Event Bus for unified data flow
type EventCallback<T = unknown> = (payload: T) => void;

export type HubEventType =
  | 'client:created'
  | 'client:updated'
  | 'client:deleted'
  | 'deal:created'
  | 'deal:updated'
  | 'deal:won'
  | 'deal:lost'
  | 'project:created'
  | 'project:updated'
  | 'project:completed'
  | 'project:status_changed'
  | 'milestone:created'
  | 'milestone:completed'
  | 'milestone:payment_received'
  | 'session:created'
  | 'session:completed'
  | 'message:sent'
  | 'message:received'
  | 'match:contacted'
  | 'match:accepted'
  | 'revenue:received'
  | 'activity:logged'
  | 'navigation:hub_changed'
  // Energy/Pulse events
  | 'energy:changed'
  | 'energy:transition_started'
  | 'energy:transition_completed'
  // Depth layer events
  | 'depth:layer_changed'
   | 'depth:capability_unlocked'
   // Scene flow events
   | 'scene:transition_started'
   | 'scene:changed'
   | 'scene:transition_completed';

export interface HubEvent<T = unknown> {
  type: HubEventType;
  payload: T;
  timestamp: number;
  source: string;
}

class HubEventBus {
  private listeners: Map<HubEventType | '*', Set<EventCallback<HubEvent>>> = new Map();
  private eventHistory: HubEvent[] = [];
  private maxHistorySize = 100;

  // Subscribe to specific event type
  subscribe<T = unknown>(eventType: HubEventType | '*', callback: EventCallback<HubEvent<T>>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback as EventCallback<HubEvent>);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback as EventCallback<HubEvent>);
    };
  }

  // Publish an event
  publish<T = unknown>(type: HubEventType, payload: T, source: string = 'unknown'): void {
    const event: HubEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
      source,
    };

    // Add to history
    this.eventHistory.unshift(event as HubEvent);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.pop();
    }

    // Notify specific listeners
    this.listeners.get(type)?.forEach(callback => {
      try {
        callback(event as HubEvent);
      } catch (error) {
        console.error(`Error in event listener for ${type}:`, error);
      }
    });

    // Notify wildcard listeners
    this.listeners.get('*')?.forEach(callback => {
      try {
        callback(event as HubEvent);
      } catch (error) {
        console.error(`Error in wildcard event listener:`, error);
      }
    });
  }

  // Get recent events
  getHistory(limit: number = 20, filterType?: HubEventType): HubEvent[] {
    const filtered = filterType 
      ? this.eventHistory.filter(e => e.type === filterType)
      : this.eventHistory;
    return filtered.slice(0, limit);
  }

  // Clear all listeners
  clear(): void {
    this.listeners.clear();
    this.eventHistory = [];
  }
}

// Singleton instance
export const hubEventBus = new HubEventBus();

// Convenience hooks for React components
import { useEffect, useCallback, useState } from 'react';

export function useHubEvent<T = unknown>(
  eventType: HubEventType | '*',
  callback: (event: HubEvent<T>) => void
): void {
  useEffect(() => {
    const unsubscribe = hubEventBus.subscribe(eventType, callback as EventCallback<HubEvent>);
    return unsubscribe;
  }, [eventType, callback]);
}

export function useHubEventHistory(limit: number = 20, filterType?: HubEventType): HubEvent[] {
  const [history, setHistory] = useState<HubEvent[]>(() => hubEventBus.getHistory(limit, filterType));

  useEffect(() => {
    const unsubscribe = hubEventBus.subscribe('*', () => {
      setHistory(hubEventBus.getHistory(limit, filterType));
    });
    return unsubscribe;
  }, [limit, filterType]);

  return history;
}

export function usePublishHubEvent() {
  return useCallback(<T = unknown>(type: HubEventType, payload: T, source: string = 'user') => {
    hubEventBus.publish(type, payload, source);
  }, []);
}

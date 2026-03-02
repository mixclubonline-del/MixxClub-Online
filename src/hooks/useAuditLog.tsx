import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { uuid } from '@/lib/uuid';

export interface AuditLogEntry {
  id?: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

export function useAuditLog() {
  const logAction = async (entry: Omit<AuditLogEntry, 'id' | 'created_at' | 'ip_address' | 'user_agent'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No user found for audit log');
        return;
      }

      // Get user agent and basic client info
      const userAgent = navigator.userAgent;
      
      const auditEntry: Omit<AuditLogEntry, 'id' | 'created_at'> = {
        ...entry,
        user_agent: userAgent,
        metadata: {
          ...entry.metadata,
          timestamp: new Date().toISOString(),
          browser: getBrowserInfo(),
        }
      };

      // In a real implementation, this would insert into an audit_logs table
      // For now, we'll log to console and could send to an analytics service
      console.log('[AUDIT LOG]', auditEntry);

      // Store in localStorage for demo purposes (in production, use a proper audit log table)
      const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      logs.push({ ...auditEntry, id: uuid(), created_at: new Date().toISOString() });
      
      // Keep only last 1000 entries
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }
      
      localStorage.setItem('audit_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  };

  const getAuditLogs = (filters?: {
    resourceType?: string;
    resourceId?: string;
    action?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): AuditLogEntry[] => {
    try {
      const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]') as AuditLogEntry[];
      
      if (!filters) return logs;

      return logs.filter(log => {
        if (filters.resourceType && log.resource_type !== filters.resourceType) return false;
        if (filters.resourceId && log.resource_id !== filters.resourceId) return false;
        if (filters.action && log.action !== filters.action) return false;
        if (filters.userId && log.user_id !== filters.userId) return false;
        if (filters.startDate && log.created_at && new Date(log.created_at) < filters.startDate) return false;
        if (filters.endDate && log.created_at && new Date(log.created_at) > filters.endDate) return false;
        return true;
      });
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return [];
    }
  };

  return {
    logAction,
    getAuditLogs,
  };
}

function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  
  return browser;
}

// Hook to automatically log component mount/unmount
export function useComponentAudit(componentName: string, metadata?: Record<string, any>) {
  const { logAction } = useAuditLog();

  useEffect(() => {
    logAction({
      user_id: 'system',
      action: 'component_mount',
      resource_type: 'component',
      resource_id: componentName,
      metadata: { ...metadata, component: componentName },
    });

    return () => {
      logAction({
        user_id: 'system',
        action: 'component_unmount',
        resource_type: 'component',
        resource_id: componentName,
        metadata: { ...metadata, component: componentName },
      });
    };
  }, [componentName]);
}

import { useState, useEffect } from 'react';

export interface DashboardWidget {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
  lastUpdated: string;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'quick-stats', title: 'Quick Stats', visible: true, order: 0 },
  { id: 'usage-growth', title: 'Projects & Users Growth', visible: true, order: 1 },
  { id: 'department-distribution', title: 'Department Distribution', visible: true, order: 2 },
  { id: 'storage-trend', title: 'Storage Usage Trend', visible: true, order: 3 },
  { id: 'team-activity', title: 'Weekly Team Activity', visible: true, order: 4 },
  { id: 'activity-stats', title: 'Activity Statistics', visible: true, order: 5 },
  { id: 'revenue-growth', title: 'Revenue Growth', visible: true, order: 6 },
  { id: 'contract-activity', title: 'Contract Activity', visible: true, order: 7 },
  { id: 'revenue-metrics', title: 'Key Revenue Metrics', visible: true, order: 8 },
];

const STORAGE_KEY = 'enterprise-dashboard-layout';

/**
 * Hook to manage dashboard layout preferences
 */
export function useDashboardLayout() {
  const [layout, setLayout] = useState<DashboardLayout>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DashboardLayout;
        // Merge with defaults to handle new widgets
        const mergedWidgets = DEFAULT_WIDGETS.map(defaultWidget => {
          const storedWidget = parsed.widgets.find(w => w.id === defaultWidget.id);
          return storedWidget || defaultWidget;
        });
        return {
          widgets: mergedWidgets.sort((a, b) => a.order - b.order),
          lastUpdated: parsed.lastUpdated,
        };
      }
    } catch (error) {
      console.error('Error loading dashboard layout:', error);
    }
    return {
      widgets: DEFAULT_WIDGETS,
      lastUpdated: new Date().toISOString(),
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch (error) {
      console.error('Error saving dashboard layout:', error);
    }
  }, [layout]);

  const toggleWidgetVisibility = (widgetId: string) => {
    setLayout(prev => ({
      widgets: prev.widgets.map(w =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      ),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const moveWidget = (widgetId: string, direction: 'up' | 'down') => {
    setLayout(prev => {
      const widgets = [...prev.widgets].sort((a, b) => a.order - b.order);
      const index = widgets.findIndex(w => w.id === widgetId);
      
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === widgets.length - 1)
      ) {
        return prev;
      }

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = widgets[index].order;
      widgets[index].order = widgets[targetIndex].order;
      widgets[targetIndex].order = temp;

      return {
        widgets,
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const resetLayout = () => {
    setLayout({
      widgets: DEFAULT_WIDGETS,
      lastUpdated: new Date().toISOString(),
    });
  };

  const isWidgetVisible = (widgetId: string): boolean => {
    const widget = layout.widgets.find(w => w.id === widgetId);
    return widget?.visible ?? true;
  };

  const getWidgetOrder = (widgetId: string): number => {
    const widget = layout.widgets.find(w => w.id === widgetId);
    return widget?.order ?? 999;
  };

  return {
    layout,
    toggleWidgetVisibility,
    moveWidget,
    resetLayout,
    isWidgetVisible,
    getWidgetOrder,
  };
}

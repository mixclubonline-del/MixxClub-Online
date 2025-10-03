import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardWidget } from './DashboardWidget';
import { RealtimeActivityFeed } from './RealtimeActivityFeed';
import { OnlineUsersWidget } from './OnlineUsersWidget';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { Plus, LayoutGrid } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface Widget {
  id: string;
  type: 'activity' | 'users' | 'performance' | 'stats';
  title: string;
}

const AVAILABLE_WIDGETS = [
  { type: 'activity' as const, title: 'Live Activity Feed', icon: '📊' },
  { type: 'users' as const, title: 'Online Users', icon: '👥' },
  { type: 'performance' as const, title: 'Performance Monitor', icon: '⚡' },
  { type: 'stats' as const, title: 'Quick Stats', icon: '📈' },
];

export function CustomizableDashboard() {
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: '1', type: 'activity', title: 'Live Activity Feed' },
    { id: '2', type: 'users', title: 'Online Users' },
  ]);

  const addWidget = (type: Widget['type'], title: string) => {
    const newWidget: Widget = {
      id: Date.now().toString(),
      type,
      title,
    };
    setWidgets([...widgets, newWidget]);
    toast.success(`Added ${title} widget`);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
    toast.success('Widget removed');
  };

  const renderWidgetContent = (type: Widget['type']) => {
    switch (type) {
      case 'activity':
        return <RealtimeActivityFeed />;
      case 'users':
        return <OnlineUsersWidget />;
      case 'performance':
        return (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              System performance metrics
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>CPU Usage</span>
                <span className="font-medium">24%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Memory</span>
                <span className="font-medium">1.2 GB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Response Time</span>
                <span className="font-medium">45ms</span>
              </div>
            </div>
          </Card>
        );
      case 'stats':
        return (
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
              <div>
                <p className="text-2xl font-bold">89</p>
                <p className="text-xs text-muted-foreground">Active Now</p>
              </div>
              <div>
                <p className="text-2xl font-bold">456</p>
                <p className="text-xs text-muted-foreground">Projects</p>
              </div>
              <div>
                <p className="text-2xl font-bold">$12.5k</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Customizable Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Add, remove, and arrange widgets to customize your view
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {AVAILABLE_WIDGETS.map((widget) => (
              <DropdownMenuItem
                key={widget.type}
                onClick={() => addWidget(widget.type, widget.title)}
              >
                <span className="mr-2">{widget.icon}</span>
                {widget.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {widgets.length === 0 ? (
        <Card className="p-12 text-center">
          <LayoutGrid className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-semibold mb-2">No widgets added</h3>
          <p className="text-muted-foreground mb-4">
            Add widgets to customize your dashboard
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Widget
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              {AVAILABLE_WIDGETS.map((widget) => (
                <DropdownMenuItem
                  key={widget.type}
                  onClick={() => addWidget(widget.type, widget.title)}
                >
                  <span className="mr-2">{widget.icon}</span>
                  {widget.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {widgets.map((widget) => (
            <div key={widget.id} className="min-h-[300px]">
              {renderWidgetContent(widget.type)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

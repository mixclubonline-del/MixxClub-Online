import { ReactNode } from 'react';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Home, Briefcase, Search, DollarSign, User, Music, Award, Headphones, Truck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface CRMLayoutProps {
  children: ReactNode;
  userType: 'artist' | 'engineer';
  profile: any;
  stats: Array<{
    icon: ReactNode;
    label: string;
    value: number | string;
    color: string;
  }>;
  quickActions: Array<{
    label: string;
    icon: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'outline';
  }>;
}

export const CRMLayout = ({ children, userType, profile, stats, quickActions }: CRMLayoutProps) => {
  const isMobile = useIsMobile();
  
  const getLevelProgress = () => {
    if (!profile) return 0;
    const currentLevelPoints = (profile.level - 1) * 1000;
    const progressInLevel = profile.points - currentLevelPoints;
    return (progressInLevel / 1000) * 100;
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: userType === 'engineer' ? '/engineer-crm' : '/artist-crm',
      section: 'dashboard',
    },
    {
      title: 'Studio',
      icon: Headphones,
      path: userType === 'engineer' ? '/engineer-crm?tab=studio' : '/artist-crm?tab=studio',
      section: 'studio',
    },
    {
      title: 'Active Work',
      icon: Briefcase,
      path: userType === 'engineer' ? '/engineer-crm?tab=active-work' : '/artist-crm?tab=active-work',
      section: 'active-work',
    },
    {
      title: 'Opportunities',
      icon: Search,
      path: userType === 'engineer' ? '/engineer-crm?tab=opportunities' : '/artist-crm?tab=opportunities',
      section: 'opportunities',
    },
    {
      title: 'Distribution',
      icon: Truck,
      path: '/distribution',
      section: 'distribution',
    },
    {
      title: 'Business',
      icon: DollarSign,
      path: userType === 'engineer' ? '/engineer-crm?tab=business' : '/artist-crm?tab=business',
      section: 'business',
    },
    {
      title: 'Profile',
      icon: User,
      path: userType === 'engineer' ? '/engineer-crm?tab=profile' : '/artist-crm?tab=profile',
      section: 'profile',
    },
  ];

  // Mobile layout - simplified without nested sidebar
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="pt-20 pb-20 px-4 md:px-6">
          {/* Mobile Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">
              {userType === 'engineer' ? 'Pro Studio' : 'Your Studio'}
            </h1>
            <p className="text-muted-foreground">
              {userType === 'engineer' 
                ? "Let's create some magic today 🎚️"
                : "Let's make some hits today 🎵"
              }
            </p>
          </div>

          {/* Mobile Quick Stats */}
          <ScrollArea className="w-full pb-4">
            <div className="flex gap-3 pb-2">
              {stats.map((stat, index) => (
                <Card key={index} className="p-3 min-w-[140px] flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                      <div className="text-lg font-semibold">{stat.value}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <Card className="p-4 mb-6">
            <h3 className="font-semibold mb-3 text-sm">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || 'outline'}
                  size="sm"
                  className="gap-2"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          </Card>

          {/* Main Content */}
          {children}
        </div>
      </div>
    );
  }

  // Desktop layout with sidebar
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full pt-20">
          <Sidebar className="border-r z-[90] w-64 lg:w-72" collapsible="icon">
            <SidebarContent>
              {/* Welcome Section */}
              <div className="p-4 border-b">
                <div className="mb-3">
                  <h3 className="font-semibold mb-1">
                    {profile?.full_name || (userType === 'engineer' ? 'Pro' : 'Artist')}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Level {profile?.level || 1} • {profile?.points || 0} points
                  </p>
                </div>
                <Progress value={getLevelProgress()} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">
                  {1000 - ((profile?.points || 0) % 1000)} to Level {(profile?.level || 1) + 1}
                </p>
              </div>

              {/* Navigation */}
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.section}>
                        <SidebarMenuButton asChild>
                          <NavLink 
                            to={item.path}
                            className={({ isActive }) => 
                              isActive ? 'bg-primary/10 text-primary' : ''
                            }
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Quick Stats */}
              <SidebarGroup className="mt-auto border-t pt-4">
                <SidebarGroupLabel>Quick Stats</SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="space-y-3 px-3">
                    {stats.slice(0, 3).map((stat, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${stat.color}`}>
                          {stat.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted-foreground truncate">{stat.label}</div>
                          <div className="text-sm font-semibold">{stat.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 overflow-auto">
            <div className="max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <SidebarTrigger className="mb-2" />
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {userType === 'engineer' ? 'Pro Studio' : 'Your Studio'}
                  </h1>
                  <p className="text-muted-foreground">
                    {userType === 'engineer' 
                      ? "Let's create some magic today 🎚️"
                      : "Let's make some hits today 🎵"
                    }
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <Card className="p-4 md:p-6 mb-6">
                <h3 className="font-semibold mb-3 text-sm">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      onClick={action.onClick}
                      variant={action.variant || 'outline'}
                      size="sm"
                      className="gap-2"
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Main Content */}
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

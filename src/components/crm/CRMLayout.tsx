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
import { Home, Briefcase, Search, DollarSign, User, Music, Award, Headphones, Truck, Sparkles, Zap } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navigation />
        
        <div className="pt-20 pb-20 px-4 md:px-6">
          {/* Mobile Header with Gamification */}
          <div className="mb-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                {userType === 'engineer' ? 'Pro Studio' : 'Your Studio'}
              </h1>
              <Sparkles className="w-6 h-6 text-primary animate-pulse-glow" />
            </div>
            <p className="text-muted-foreground text-lg">
              {userType === 'engineer' 
                ? "Let's create some magic today 🎚️"
                : "Let's make some hits today 🎵"
              }
            </p>
            
            {/* Level Progress */}
            {profile && (
              <Card className="mt-4 p-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary-glow/10 border-primary/20 animate-in slide-in-from-top duration-500">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Level {profile.level || 1}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {profile.points || 0} points
                  </span>
                </div>
                <Progress value={getLevelProgress()} className="h-2 bg-muted" />
                <p className="text-xs text-muted-foreground mt-2">
                  {1000 - ((profile?.points || 0) % 1000)} XP to Level {(profile?.level || 1) + 1}
                </p>
              </Card>
            )}
          </div>

          {/* Mobile Quick Stats - Colorful Cards */}
          <ScrollArea className="w-full pb-4">
            <div className="flex gap-3 pb-2">
              {stats.map((stat, index) => (
                <Card 
                  key={index} 
                  className={cn(
                    "p-4 min-w-[160px] flex-shrink-0 border-2 transition-all duration-300 hover:scale-105 animate-in slide-in-from-left",
                    "hover:shadow-glow cursor-pointer"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col gap-2">
                    <div className={cn("p-2 rounded-lg w-fit", stat.color)}>
                      {stat.icon}
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Quick Actions - Colorful Buttons */}
          <Card className="p-6 mb-6 glass-hover animate-in slide-in-from-bottom duration-700">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary animate-pulse" />
              <h3 className="font-bold text-lg">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || 'outline'}
                  size="lg"
                  className={cn(
                    "gap-2 h-auto py-4 flex-col items-center justify-center transition-all duration-300 hover:scale-105",
                    "border-2 hover:shadow-glow animate-in zoom-in",
                    index === 0 && "bg-gradient-to-br from-primary/20 to-primary/5 border-primary/40 hover:border-primary",
                    index === 1 && "bg-gradient-to-br from-accent/20 to-accent/5 border-accent/40 hover:border-accent",
                    index === 2 && "bg-gradient-to-br from-primary-glow/20 to-primary-glow/5 border-primary-glow/40 hover:border-primary-glow",
                  )}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {action.icon}
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </Card>

          {/* Main Content */}
          <div className="animate-in fade-in duration-1000">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout with sidebar
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full pt-20">
          <Sidebar className="border-r border-primary/20 z-[90] w-64 lg:w-72 bg-card/50 backdrop-blur-sm" collapsible="icon">
            <SidebarContent>
              {/* Welcome Section - Gamified */}
              <div className="p-4 border-b border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">
                      {profile?.full_name || (userType === 'engineer' ? 'Pro' : 'Artist')}
                    </h3>
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-accent" />
                    <p className="text-sm font-medium text-primary">
                      Level {profile?.level || 1}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      • {profile?.points || 0} XP
                    </span>
                  </div>
                </div>
                <Progress value={getLevelProgress()} className="h-2 bg-muted" />
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  {1000 - ((profile?.points || 0) % 1000)} XP to Level {(profile?.level || 1) + 1} 🎯
                </p>
              </div>

              {/* Navigation */}
              <SidebarGroup>
                <SidebarGroupLabel className="text-primary font-semibold">Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item, index) => (
                      <SidebarMenuItem key={item.section}>
                        <SidebarMenuButton asChild>
                          <NavLink 
                            to={item.path}
                            className={({ isActive }) => 
                              cn(
                                "transition-all duration-300 hover:scale-105",
                                isActive 
                                  ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-semibold border-l-4 border-primary shadow-glow' 
                                  : 'hover:bg-primary/5'
                              )
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

              {/* Quick Stats - Colorful */}
              <SidebarGroup className="mt-auto border-t border-primary/20 pt-4 bg-gradient-to-t from-primary/5 to-transparent">
                <SidebarGroupLabel className="text-primary font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Quick Stats
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="space-y-3 px-3">
                    {stats.slice(0, 3).map((stat, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105 cursor-pointer"
                      >
                        <div className={cn("p-2 rounded-lg", stat.color)}>
                          {stat.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-lg font-bold">{stat.value}</div>
                          <div className="text-xs text-muted-foreground truncate">{stat.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 overflow-auto">
            <div className="max-w-screen-2xl mx-auto p-6 lg:p-10">
              {/* Header - Vibrant */}
              <div className="mb-8 animate-fade-in">
                <SidebarTrigger className="mb-4" />
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
                    {userType === 'engineer' ? 'Pro Studio' : 'Your Studio'}
                  </h1>
                  <Sparkles className="w-8 h-8 text-primary animate-pulse-glow" />
                </div>
                <p className="text-muted-foreground text-lg">
                  {userType === 'engineer' 
                    ? "Let's create some magic today 🎚️"
                    : "Let's make some hits today 🎵"
                  }
                </p>
              </div>

              {/* Quick Actions - Colorful Cards */}
              <div className="mb-8 animate-in slide-in-from-bottom duration-700">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-6 h-6 text-primary animate-pulse" />
                  <h3 className="font-bold text-xl">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      onClick={action.onClick}
                      variant={action.variant || 'outline'}
                      size="lg"
                      className={cn(
                        "h-auto py-6 px-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-110",
                        "border-2 hover:shadow-glow animate-in zoom-in group relative overflow-hidden",
                        index % 6 === 0 && "bg-gradient-to-br from-primary/20 to-primary/5 border-primary/40 hover:border-primary hover:from-primary/30 hover:to-primary/10",
                        index % 6 === 1 && "bg-gradient-to-br from-accent/20 to-accent/5 border-accent/40 hover:border-accent hover:from-accent/30 hover:to-accent/10",
                        index % 6 === 2 && "bg-gradient-to-br from-primary-glow/20 to-primary-glow/5 border-primary-glow/40 hover:border-primary-glow hover:from-primary-glow/30 hover:to-primary-glow/10",
                        index % 6 === 3 && "bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/40 hover:border-purple-500 hover:from-purple-500/30 hover:to-purple-500/10",
                        index % 6 === 4 && "bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/40 hover:border-blue-500 hover:from-blue-500/30 hover:to-blue-500/10",
                        index % 6 === 5 && "bg-gradient-to-br from-pink-500/20 to-pink-500/5 border-pink-500/40 hover:border-pink-500 hover:from-pink-500/30 hover:to-pink-500/10",
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative">
                        {action.icon}
                        <div className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300">
                          {action.icon}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-center leading-tight">
                        {action.label}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Main Content with bloom animation */}
              <div className="animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
                {children}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

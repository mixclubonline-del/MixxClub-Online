import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { getNavigationForRole, UserRole } from '@/config/navigationConfig';
import mixclub3DLogo from '@/assets/mixclub-3d-logo.png';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AppSidebar() {
  const location = useLocation();
  const { userRole, signOut, user } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const role = (userRole || null) as UserRole;
  const navCategories = getNavigationForRole(role);

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link 
          to={userRole === 'engineer' ? '/engineer-crm' : userRole === 'admin' ? '/admin' : '/artist-crm'} 
          className="flex items-center gap-3 group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img 
              src={mixclub3DLogo} 
              alt="MixClub" 
              className="w-10 h-8 object-contain relative z-10" 
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">
                MixClub <span className="text-primary">Online</span>
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {navCategories.map((category) => (
          <SidebarGroup key={category.label}>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-3 mb-2">
                {category.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {category.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={isCollapsed ? item.label : undefined}
                      >
                        <Link 
                          to={item.path}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                            active 
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                              : 'hover:bg-sidebar-accent/50'
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
                          {!isCollapsed && (
                            <div className="flex items-center justify-between flex-1">
                              <span>{item.label}</span>
                              {item.badge && (
                                <Badge 
                                  variant="secondary" 
                                  className="text-[10px] px-1.5 py-0 h-5 bg-primary/20 text-primary border-primary/30"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                              {item.featured && (
                                <Badge 
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 h-5 bg-gradient-to-r from-primary via-accent-blue to-accent-cyan animate-pulse-glow"
                                >
                                  NEW
                                </Badge>
                              )}
                            </div>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {user && (
        <SidebarFooter className="border-t border-sidebar-border p-4">
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full justify-start gap-3 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Sign Out</span>}
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

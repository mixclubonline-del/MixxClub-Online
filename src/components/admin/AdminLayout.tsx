import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import { useMobileDetect } from '@/hooks/useMobileDetect';
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
import {
  LayoutDashboard,
  Users,
  Shield,
  Briefcase,
  Headphones,
  Music,
  Image,
  FileText,
  BarChart3,
  DollarSign,
  Wallet,
  Package,
  CreditCard,
  ShoppingBag,
  Award,
  Trophy,
  TrendingUp,
  Bell,
  Mail,
  Sparkles,
  Plug,
  Activity,
  GraduationCap,
  Monitor,
  LogOut,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigationGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    label: 'User Management',
    items: [
      { name: 'Users', href: '/admin/users', icon: Users },
      { name: 'Security', href: '/admin/security', icon: Shield },
    ],
  },
  {
    label: 'Content & Media',
    items: [
      { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
      { name: 'Audio', href: '/admin/audio', icon: Headphones },
      { name: 'Beat Files', href: '/admin/beat-files', icon: Music },
      { name: 'Media', href: '/admin/media', icon: Image },
      { name: 'Content', href: '/admin/content', icon: FileText },
    ],
  },
  {
    label: 'Business Operations',
    items: [
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { name: 'Financial', href: '/admin/financial', icon: DollarSign },
      { name: 'Payouts', href: '/admin/payouts', icon: Wallet },
      { name: 'Packages', href: '/admin/packages', icon: Package },
      { name: 'Test Payments', href: '/admin/test-payments', icon: CreditCard },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { name: 'Marketplace', href: '/admin/marketplace', icon: ShoppingBag, featured: true },
    ],
  },
  {
    label: 'Community & Engagement',
    items: [
      { name: 'Achievements', href: '/admin/achievements', icon: Award },
      { name: 'Milestones', href: '/admin/milestones', icon: Trophy },
    ],
  },
  {
    label: 'Communications',
    items: [
      { name: 'Notifications', href: '/admin/notifications', icon: Bell },
      { name: 'Contacts', href: '/admin/contacts', icon: Mail },
    ],
  },
  {
    label: 'System Settings',
    items: [
      { name: 'Features', href: '/admin/features', icon: Sparkles },
      { name: 'Integrations', href: '/admin/integrations', icon: Plug },
      { name: 'Legal Documents', href: '/admin/legal-documents', icon: FileText },
      { name: 'Sessions', href: '/admin/sessions', icon: Activity },
      { name: 'Education', href: '/admin/education', icon: GraduationCap },
      { name: 'Presentation', href: '/admin/system-presentation', icon: Monitor },
    ],
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut } = useAuth();
  const { isMobile } = useMobileDetect();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen w-full pt-20">
          <Sidebar 
            className="border-r z-[90]" 
            collapsible="offcanvas"
          >
            <SidebarContent>
              {/* Admin Profile Section */}
              <div className="p-4 border-b">
                <div className="mb-2">
                  <h3 className="font-semibold">Admin</h3>
                  <Badge variant="default" className="mt-1">Administrator</Badge>
                </div>
              </div>

              {/* Navigation Groups */}
              {navigationGroups.map((group) => (
                <SidebarGroup key={group.label}>
                  <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild>
                            <NavLink
                              to={item.href}
                              end={item.href === '/admin'}
                              className={({ isActive }) =>
                                isActive ? 'bg-primary/10 text-primary font-medium' : ''
                              }
                            >
                              <item.icon className="w-4 h-4" />
                              <span>{item.name}</span>
                              {item.featured && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  Featured
                                </Badge>
                              )}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}

              {/* Sign Out */}
              <SidebarGroup className="mt-auto border-t pt-4">
                <SidebarGroupContent>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={signOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 overflow-x-hidden">
            <div className={isMobile ? 'p-4' : 'p-6'}>
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

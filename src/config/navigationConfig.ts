import { 
  Home, 
  Briefcase, 
  Music, 
  Sparkles, 
  Share2, 
  ShoppingBag,
  Rocket,
  HelpCircle,
  Users,
  BarChart3,
  Settings,
  Headphones,
  Mic2,
  Award,
  UserCircle,
  Coins,
  LucideIcon
} from 'lucide-react';

export type UserRole = 'artist' | 'engineer' | 'admin' | null;

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: UserRole[];
  category?: string;
  badge?: string;
  featured?: boolean;
}

export interface NavCategory {
  label: string;
  items: NavItem[];
}

const navigationItems: NavItem[] = [
  // Dashboard
  {
    label: 'Dashboard',
    path: '/artist-crm',
    icon: Home,
    roles: ['artist'],
    category: 'Main',
  },
  {
    label: 'Dashboard',
    path: '/engineer-crm',
    icon: Home,
    roles: ['engineer'],
    category: 'Main',
  },
  {
    label: 'Admin Dashboard',
    path: '/admin',
    icon: BarChart3,
    roles: ['admin'],
    category: 'Main',
  },

  // CRM
  {
    label: 'Clients',
    path: '/artist-crm?tab=clients',
    icon: UserCircle,
    roles: ['artist'],
    category: 'CRM',
  },
  {
    label: 'Clients',
    path: '/engineer-crm?tab=clients',
    icon: UserCircle,
    roles: ['engineer'],
    category: 'CRM',
  },

  // Services
  {
    label: 'Mixing Magic',
    path: '/services/mixing',
    icon: Headphones,
    roles: ['artist', 'engineer', null],
    category: 'Services',
  },
  {
    label: 'Mastering Polish',
    path: '/services/mastering',
    icon: Mic2,
    roles: ['artist', 'engineer', null],
    category: 'Services',
  },
  {
    label: 'For Artists',
    path: '/for-artists',
    icon: Music,
    roles: ['artist', 'engineer', null],
    category: 'Services',
  },
  {
    label: 'Distribution',
    path: '/services/distribution',
    icon: Share2,
    roles: ['artist', 'engineer'],
    category: 'Services',
    featured: true,
  },

  // Opportunities
  {
    label: 'Job Board',
    path: '/jobs',
    icon: Briefcase,
    roles: ['artist', 'engineer'],
    category: 'Opportunities',
  },
  {
    label: 'For Engineers',
    path: '/for-engineers',
    icon: Users,
    roles: [null],
    category: 'Opportunities',
  },

  // Shop
  {
    label: 'Merch Store',
    path: '/merch',
    icon: ShoppingBag,
    roles: ['artist', 'engineer', null],
    category: 'Shop',
  },

  // Economy
  {
    label: 'MixxCoinz',
    path: '/economy',
    icon: Coins,
    roles: ['artist', 'engineer'],
    category: 'Economy',
    badge: 'NEW',
  },

  // Discover
  {
    label: 'Coming Soon',
    path: '/coming-soon',
    icon: Rocket,
    roles: ['artist', 'engineer', null],
    category: 'Discover',
  },
];

export const getNavigationForRole = (role: UserRole): NavCategory[] => {
  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(role)
  );

  // Group by category
  const categories = [...new Set(filteredItems.map(item => item.category))];
  
  return categories.map(category => ({
    label: category || 'Other',
    items: filteredItems.filter(item => item.category === category),
  }));
};

export const getAllNavigationItems = (): NavItem[] => {
  return navigationItems;
};

export const getNavItemByPath = (path: string): NavItem | undefined => {
  return navigationItems.find(item => item.path === path);
};

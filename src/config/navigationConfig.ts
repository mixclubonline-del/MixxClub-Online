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
  LucideIcon,
  Disc3,
  Heart,
  Compass,
  Star,
  Radio,
  UsersRound,
  Video
} from 'lucide-react';

export type UserRole = 'artist' | 'engineer' | 'producer' | 'fan' | 'admin' | null;

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
  {
    label: 'Dashboard',
    path: '/producer-crm',
    icon: Disc3,
    roles: ['producer'],
    category: 'Main',
  },
  {
    label: 'My Feed',
    path: '/fan-hub',
    icon: Compass,
    roles: ['fan'],
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
  {
    label: 'Catalog',
    path: '/producer-crm?tab=catalog',
    icon: Music,
    roles: ['producer'],
    category: 'CRM',
  },
  {
    label: 'Day 1s',
    path: '/fan-hub?tab=day1s',
    icon: Star,
    roles: ['fan'],
    category: 'Discovery',
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
    label: 'Beat Store',
    path: '/marketplace',
    icon: Disc3,
    roles: ['producer', 'artist', null],
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
  {
    label: 'MixxCoinz',
    path: '/economy',
    icon: Coins,
    roles: ['producer', 'fan'],
    category: 'Economy',
    badge: 'NEW',
  },

  // Discover
  {
    label: 'Sessions',
    path: '/sessions',
    icon: Radio,
    roles: ['artist', 'engineer', 'producer', 'fan'],
    category: 'Discover',
  },
  {
    label: 'Community',
    path: '/community',
    icon: UsersRound,
    roles: ['artist', 'engineer', 'producer', 'fan'],
    category: 'Discover',
  },
  {
    label: 'Live',
    path: '/live',
    icon: Video,
    roles: ['artist', 'engineer', 'producer', 'fan'],
    category: 'Discover',
  },

  // Settings
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    roles: ['artist', 'engineer', 'producer', 'fan', 'admin'],
    category: 'Account',
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

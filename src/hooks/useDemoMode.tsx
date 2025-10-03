import { useState, useEffect } from 'react';

export const useDemoMode = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const checkDemoMode = () => {
      const demoMode = localStorage.getItem('demo_mode') === 'true';
      setIsDemoMode(demoMode);
    };

    checkDemoMode();

    // Listen for storage changes
    window.addEventListener('storage', checkDemoMode);
    return () => window.removeEventListener('storage', checkDemoMode);
  }, []);

  return { isDemoMode };
};

// Sample demo data generators
export const getDemoProjects = () => [
  {
    id: 'demo-1',
    title: 'Summer Vibes - Radio Mix',
    client_name: 'Artist Alex',
    engineer_name: 'Pro Engineer Sarah',
    status: 'in_progress',
    progress: 75,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    budget: 500
  },
  {
    id: 'demo-2',
    title: 'Midnight Dreams EP',
    client_name: 'Producer Mike',
    engineer_name: 'Expert Chris',
    status: 'completed',
    progress: 100,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    budget: 1200
  },
  {
    id: 'demo-3',
    title: 'Urban Beats Vol 2',
    client_name: 'DJ Brooklyn',
    engineer_name: 'Master Engineer James',
    status: 'in_progress',
    progress: 45,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    budget: 800
  }
];

export const getDemoUsers = () => [
  {
    id: 'demo-user-1',
    full_name: 'Artist Alex',
    role: 'artist',
    avatar_url: null,
    joined: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    projects_count: 12,
    rating: 4.8
  },
  {
    id: 'demo-user-2',
    full_name: 'Pro Engineer Sarah',
    role: 'engineer',
    avatar_url: null,
    joined: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    projects_count: 47,
    rating: 4.9
  },
  {
    id: 'demo-user-3',
    full_name: 'Producer Mike',
    role: 'artist',
    avatar_url: null,
    joined: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    projects_count: 8,
    rating: 4.7
  }
];

export const getDemoMetrics = () => ({
  totalRevenue: 47580,
  activeProjects: 23,
  completedProjects: 156,
  activeUsers: 89,
  avgProjectValue: 650,
  satisfaction: 4.8,
  growthRate: 28,
  conversionRate: 12.5
});

export const getDemoActivity = () => [
  {
    id: 'act-1',
    type: 'project_created',
    message: 'New project "Sunset Groove" started',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 'act-2',
    type: 'project_completed',
    message: 'Project "Urban Beats" completed',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: 'act-3',
    type: 'user_joined',
    message: 'New engineer "Alex Martinez" joined',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: 'act-4',
    type: 'payment_received',
    message: 'Payment of $850 received',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  }
];

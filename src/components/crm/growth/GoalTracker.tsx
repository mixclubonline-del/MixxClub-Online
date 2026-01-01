import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, CheckCircle, Clock, AlertCircle, ChevronRight, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface GoalTrackerProps {
  userType: 'artist' | 'engineer';
  searchQuery: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  deadline: string;
  status: 'on-track' | 'at-risk' | 'completed' | 'overdue';
  category: string;
  milestones: { title: string; completed: boolean }[];
}

export const GoalTracker: React.FC<GoalTrackerProps> = ({ userType, searchQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const goals: Goal[] = userType === 'artist' ? [
    {
      id: '1',
      title: 'Release 3 Singles This Quarter',
      description: 'Focus on consistent releases to build momentum',
      progress: 66,
      deadline: 'Mar 31, 2026',
      status: 'on-track',
      category: 'releases',
      milestones: [
        { title: 'Single 1 - Mixed & Mastered', completed: true },
        { title: 'Single 2 - Mixed & Mastered', completed: true },
        { title: 'Single 3 - In Production', completed: false },
      ],
    },
    {
      id: '2',
      title: 'Grow Streaming to 10K Monthly',
      description: 'Increase Spotify monthly listeners through playlist placement',
      progress: 45,
      deadline: 'Apr 15, 2026',
      status: 'at-risk',
      category: 'growth',
      milestones: [
        { title: 'Reach 5K listeners', completed: true },
        { title: 'Get on 3 editorial playlists', completed: false },
        { title: 'Hit 10K milestone', completed: false },
      ],
    },
    {
      id: '3',
      title: 'Complete Vocal Training Course',
      description: 'Master advanced vocal techniques',
      progress: 100,
      deadline: 'Feb 28, 2026',
      status: 'completed',
      category: 'skills',
      milestones: [
        { title: 'Complete Module 1-3', completed: true },
        { title: 'Complete Module 4-6', completed: true },
        { title: 'Pass Final Assessment', completed: true },
      ],
    },
  ] : [
    {
      id: '1',
      title: 'Complete 20 Mix Projects',
      description: 'Build portfolio with diverse genre projects',
      progress: 70,
      deadline: 'Mar 31, 2026',
      status: 'on-track',
      category: 'projects',
      milestones: [
        { title: 'Complete 10 projects', completed: true },
        { title: 'Complete 15 projects', completed: true },
        { title: 'Complete 20 projects', completed: false },
      ],
    },
    {
      id: '2',
      title: 'Earn Pro Tools Certification',
      description: 'Get officially certified in Pro Tools',
      progress: 80,
      deadline: 'Feb 15, 2026',
      status: 'on-track',
      category: 'skills',
      milestones: [
        { title: 'Complete coursework', completed: true },
        { title: 'Pass practice exams', completed: true },
        { title: 'Schedule & pass final', completed: false },
      ],
    },
    {
      id: '3',
      title: 'Reach $5K Monthly Revenue',
      description: 'Grow client base and increase rates',
      progress: 60,
      deadline: 'Apr 30, 2026',
      status: 'at-risk',
      category: 'revenue',
      milestones: [
        { title: 'Reach $3K/month', completed: true },
        { title: 'Land 2 recurring clients', completed: false },
        { title: 'Hit $5K milestone', completed: false },
      ],
    },
  ];

  const categories = ['all', ...new Set(goals.map(g => g.category))];

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || goal.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'on-track': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'at-risk': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'overdue': return <Clock className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: Goal['status']) => {
    const variants: Record<string, string> = {
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      'on-track': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'at-risk': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return variants[status] || variants['on-track'];
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
        <Button variant="outline" size="sm" className="ml-auto gap-2">
          <Plus className="w-4 h-4" />
          Add Goal
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredGoals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all h-full">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(goal.status)}
                      <Badge className={`${getStatusBadge(goal.status)} capitalize text-xs`}>
                        {goal.status.replace('-', ' ')}
                      </Badge>
                      <Badge variant="outline" className="capitalize text-xs">
                        {goal.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>

                {/* Milestones */}
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Milestones</span>
                  <div className="space-y-1">
                    {goal.milestones.map((milestone, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle 
                          className={`w-3 h-3 ${milestone.completed ? 'text-green-500' : 'text-muted-foreground/30'}`} 
                        />
                        <span className={milestone.completed ? 'text-muted-foreground line-through' : ''}>
                          {milestone.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border/50">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {goal.deadline}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

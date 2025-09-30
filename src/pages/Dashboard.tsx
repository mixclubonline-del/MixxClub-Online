import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Music, 
  Users, 
  Zap, 
  TrendingUp, 
  Award, 
  Clock,
  Play,
  Mic,
  Headphones,
  BarChart3,
  Radio,
  ArrowRight,
  Plus,
  Upload
} from 'lucide-react';
import { AdvancedMixingStudio } from '@/components/mixing/AdvancedMixingStudio';
import { AIAudioProcessor } from '@/components/mixing/AIAudioProcessor';
import { LiveCollaborationStudio } from '@/components/mixing/LiveCollaborationStudio';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  const quickStats = [
    { label: 'Active Projects', value: 12, icon: Music, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Live Sessions', value: 3, icon: Radio, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Collaborators', value: 28, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Completed', value: 156, icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  const recentActivity = [
    { action: 'New mix completed', project: 'Summer Vibes EP', time: '2 min ago' },
    { action: 'AI enhancement applied', project: 'Midnight Dreams', time: '5 min ago' },
    { action: 'Collaboration started', project: 'Urban Beat', time: '12 min ago' },
    { action: 'Engineer assigned', project: 'Acoustic Session', time: '1 hour ago' },
  ];

  const activeProjects = [
    { 
      name: 'Summer Vibes EP', 
      progress: 85, 
      status: 'mixing', 
      engineer: 'Sarah Chen',
      deadline: '2 days'
    },
    { 
      name: 'Midnight Dreams', 
      progress: 60, 
      status: 'production', 
      engineer: 'Mike Rodriguez',
      deadline: '5 days'
    },
    { 
      name: 'Urban Beat', 
      progress: 30, 
      status: 'recording', 
      engineer: 'Alex Kim',
      deadline: '1 week'
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user.email?.split('@')[0]}!</h1>
            <p className="text-muted-foreground">Your creative workspace awaits</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Online
            </Badge>
            <Link to="/artist-crm">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2 mb-4">
              <Button
                variant={activeTab === 'overview' ? 'default' : 'outline'}
                onClick={() => setActiveTab('overview')}
                size="sm"
              >
                Overview
              </Button>
              <Button
                variant={activeTab === 'mixing' ? 'default' : 'outline'}
                onClick={() => setActiveTab('mixing')}
                size="sm"
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Mixing Studio
              </Button>
              <Button
                variant={activeTab === 'ai' ? 'default' : 'outline'}
                onClick={() => setActiveTab('ai')}
                size="sm"
                className="gap-2"
              >
                <Zap className="w-4 h-4" />
                AI Tools
              </Button>
              <Button
                variant={activeTab === 'collaboration' ? 'default' : 'outline'}
                onClick={() => setActiveTab('collaboration')}
                size="sm"
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                Live Session
              </Button>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Projects</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeProjects.map((project, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{project.name}</h3>
                          <Badge variant="outline">{project.status}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Engineer: {project.engineer}</span>
                            <span>Due in {project.deadline}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Link to="/artist-crm">
                        <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                          <Upload className="w-6 h-6" />
                          Upload Track
                        </Button>
                      </Link>
                      <Link to="/mixing">
                        <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                          <Mic className="w-6 h-6" />
                          Start Mixing
                        </Button>
                      </Link>
                      <Link to="/engineer-dashboard">
                        <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                          <Users className="w-6 h-6" />
                          Find Engineer
                        </Button>
                      </Link>
                      <Link to="/jobs">
                        <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                          <Radio className="w-6 h-6" />
                          Join Session
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'mixing' && <AdvancedMixingStudio />}
            {activeTab === 'ai' && <AIAudioProcessor />}
            {activeTab === 'collaboration' && <LiveCollaborationStudio />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.project}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>This Month</span>
                    <span className="text-green-500">+23%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Quality Score</span>
                    <span className="text-blue-500">9.2/10</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>On-time Delivery</span>
                    <span className="text-primary">95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Explore More</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/engineer-dashboard">
                  <Button variant="outline" className="w-full justify-between">
                    Browse Engineers
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/mixing">
                  <Button variant="outline" className="w-full justify-between">
                    Learning Hub
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/jobs">
                  <Button variant="outline" className="w-full justify-between">
                    Community Forum
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Users, 
    BarChart3, 
    FileText, 
    Settings, 
    Shield, 
    Plus, 
    Mail, 
    CheckCircle,
    Building2,
    DollarSign
} from 'lucide-react';
import { AnalyticsDashboard } from '@/backend-integration';
import { InviteMemberDialog } from '@/components/enterprise/InviteMemberDialog';
import { CreateContractDialog } from '@/components/enterprise/CreateContractDialog';

const EnterpriseDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // Mock data for initial UI (will be replaced by backend hook)
    const [teamMembers, setTeamMembers] = useState([
        { id: 1, name: 'Alice Chen', role: 'Admin', email: 'alice@label.com', status: 'Active' },
        { id: 2, name: 'Bob Smith', role: 'A&R', email: 'bob@label.com', status: 'Active' },
        { id: 3, name: 'Charlie Day', role: 'Manager', email: 'charlie@label.com', status: 'Pending' },
    ]);

    const handleInviteMember = (newMember: any) => {
        setTeamMembers([...teamMembers, newMember]);
    };

    const [contracts, setContracts] = useState([
        { id: 1, title: 'Artist Agreement - Lunar Echo', status: 'Signed', date: '2025-01-15', value: '$12,000' },
        { id: 2, title: 'Distribution Deal - Neon Waves', status: 'Review', date: '2025-01-20', value: '$45,000' },
        { id: 3, title: 'Producer Split - Midnight vibes', status: 'Draft', date: '2025-01-24', value: 'TBD' },
    ]);

    const handleCreateContract = (newContract: any) => {
        setContracts([newContract, ...contracts]);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <h2 className="text-xl font-semibold text-slate-700">Enterprise Portal</h2>
                    <p className="text-slate-500 mb-4">Please sign in to access your organization.</p>
                    <Button onClick={() => navigate('/auth')}>Sign In</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navigation />
            
            <div className="container mx-auto px-6 pt-24 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h1 className="text-3xl font-bold text-slate-900">Enterprise Dashboard</h1>
                            <Badge className="bg-blue-600">Pro Label</Badge>
                        </div>
                        <p className="text-slate-600">Manage your organization, team, and assets.</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2">
                            <Settings className="w-4 h-4" />
                            Settings
                        </Button>
                        <InviteMemberDialog onInvite={handleInviteMember} />
                    </div>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-white border p-1 rounded-lg">
                        <TabsTrigger value="overview" className="gap-2">
                            <BarChart3 className="w-4 h-4" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value="team" className="gap-2">
                            <Users className="w-4 h-4" /> Team
                        </TabsTrigger>
                        <TabsTrigger value="contracts" className="gap-2">
                            <FileText className="w-4 h-4" /> Contracts
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2">
                            <Shield className="w-4 h-4" /> Integration
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Analytics Component from Backend Integration */}
                        <AnalyticsDashboard userId={user.id} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
                                    <Users className="w-4 h-4 text-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{teamMembers.length}</div>
                                    <p className="text-xs text-muted-foreground">1 pending invite</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Contracts</CardTitle>
                                    <FileText className="w-4 h-4 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{contracts.length}</div>
                                    <p className="text-xs text-muted-foreground">+2 this month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                                    <DollarSign className="w-4 h-4 text-amber-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">$124,500</div>
                                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Team Tab */}
                    <TabsContent value="team">
                        <Card>
                            <CardHeader>
                                <CardTitle>Team Management</CardTitle>
                                <CardDescription>Manage your organization's members and permissions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {teamMembers.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{member.name}</h3>
                                                    <p className="text-sm text-slate-500">{member.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant={member.status === 'Active' ? 'default' : 'secondary'} className={member.status === 'Active' ? 'bg-green-600' : ''}>
                                                    {member.status}
                                                </Badge>
                                                <span className="text-sm text-slate-500 w-20">{member.role}</span>
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t">
                                        <InviteMemberDialog onInvite={handleInviteMember} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Contracts Tab */}
                    <TabsContent value="contracts">
                        <Card>
                            <CardHeader>
                                <CardTitle>Latest Contracts</CardTitle>
                                <CardDescription>View and manage your smart contracts.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {contracts.map((contract) => (
                                        <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-slate-100 rounded text-slate-600">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{contract.title}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <span>{contract.date}</span>
                                                        <span>•</span>
                                                        <span>{contract.value}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant="outline" className={`
                                                    ${contract.status === 'Signed' ? 'text-green-600 border-green-200 bg-green-50' : ''}
                                                    ${contract.status === 'Review' ? 'text-amber-600 border-amber-200 bg-amber-50' : ''}
                                                    ${contract.status === 'Draft' ? 'text-slate-600 border-slate-200 bg-slate-50' : ''}
                                                `}>
                                                    {contract.status}
                                                </Badge>
                                                <Button variant="ghost" size="sm">View</Button>
                                            </div>
                                        </div>
                                    ))}
                                    <CreateContractDialog onCreate={handleCreateContract} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default EnterpriseDashboard;

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, BarChart3, Settings, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Import enterprise system
import {
    useEnterpriseStore,
    useEnterpriseManagement,
    useTeamManagement,
    useContractManagement,
    EnterpriseService
} from '@/integrations/enterprise';

export default function EnterpriseDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // Enterprise hooks
    const {
        selectedAccount,
        accounts,
        teamMembers,
        activeContracts,
        metrics
    } = useEnterpriseStore();

    const {
        createAccount,
        updateAccount,
        deleteAccount,
        upgradePackage,
        pauseAccount,
        reactivateAccount,
        loadAccounts
    } = useEnterpriseManagement();

    const {
        inviteTeamMember,
        changeRole,
        suspendMember,
        removeMember,
        loadTeamMembers
    } = useTeamManagement();

    const {
        createContract,
        updateContract,
        getContracts,
        renewContract,
        terminateContract
    } = useContractManagement();

    // Load data on mount
    useEffect(() => {
        if (!selectedAccount && accounts.length > 0) {
            useEnterpriseStore.setState({ selectedAccount: accounts[0] });
        }
        loadAccounts();
        if (selectedAccount) {
            loadTeamMembers(selectedAccount.id);
            getContracts(selectedAccount.id);
        }
    }, [selectedAccount?.id]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-slate-300 mb-4">Please log in to access Enterprise Dashboard</p>
                    <Button onClick={() => navigate('/auth')}>Sign In</Button>
                </div>
            </div>
        );
    }

    const isAdmin = user.role === 'admin' || user.role === 'enterprise_admin';

    return (
        <div className="min-h-screen bg-slate-900">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Enterprise Dashboard</h1>
                    <p className="text-slate-400">Manage accounts, teams, contracts, and billing</p>
                </div>

                {/* Account Selector */}
                {accounts.length > 0 && (
                    <div className="mb-8">
                        <Card className="bg-slate-800 border-slate-700 p-6">
                            <h3 className="text-sm font-semibold text-slate-300 mb-3">SELECT ACCOUNT</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {accounts.map((account) => (
                                    <button
                                        key={account.id}
                                        onClick={() => useEnterpriseStore.setState({ selectedAccount: account })}
                                        className={`p-4 rounded-lg border-2 transition-all text-left ${selectedAccount?.id === account.id
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-slate-700 hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="font-semibold text-white">{account.name}</div>
                                        <div className="text-sm text-slate-400">{account.packageType}</div>
                                        <Badge className="mt-2" variant={account.status === 'active' ? 'default' : 'secondary'}>
                                            {account.status}
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}

                {selectedAccount && (
                    <>
                        {/* Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-b border-slate-700">
                                <TabsTrigger value="overview" className="text-slate-400">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="team" className="text-slate-400">
                                    <Users className="w-4 h-4 mr-2" />
                                    Team
                                </TabsTrigger>
                                <TabsTrigger value="contracts" className="text-slate-400">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Contracts
                                </TabsTrigger>
                                <TabsTrigger value="billing" className="text-slate-400">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Billing
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="text-slate-400">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Settings
                                </TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Card className="bg-slate-800 border-slate-700 p-6">
                                        <div className="text-slate-400 text-sm mb-2">Account Status</div>
                                        <div className="text-2xl font-bold text-white capitalize mb-2">{selectedAccount.status}</div>
                                        <Badge className="capitalize">{selectedAccount.packageType}</Badge>
                                    </Card>

                                    <Card className="bg-slate-800 border-slate-700 p-6">
                                        <div className="text-slate-400 text-sm mb-2">Team Members</div>
                                        <div className="text-2xl font-bold text-white">{teamMembers.length}</div>
                                        <p className="text-xs text-slate-500 mt-2">Active users</p>
                                    </Card>

                                    <Card className="bg-slate-800 border-slate-700 p-6">
                                        <div className="text-slate-400 text-sm mb-2">Active Contracts</div>
                                        <div className="text-2xl font-bold text-white">{activeContracts.length}</div>
                                        <p className="text-xs text-slate-500 mt-2">Service agreements</p>
                                    </Card>

                                    <Card className="bg-slate-800 border-slate-700 p-6">
                                        <div className="text-slate-400 text-sm mb-2">Monthly Usage</div>
                                        <div className="text-2xl font-bold text-white">
                                            {metrics?.monthlyUsage || 0}%
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">Platform usage</p>
                                    </Card>
                                </div>

                                {/* Metrics */}
                                <Card className="bg-slate-800 border-slate-700 p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                                            <span className="text-slate-300">Revenue This Month</span>
                                            <span className="text-xl font-bold text-green-400">
                                                ${metrics?.monthlyRevenue || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                                            <span className="text-slate-300">Active Users</span>
                                            <span className="text-xl font-bold text-white">{metrics?.activeUsers || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-300">Average Session Duration</span>
                                            <span className="text-xl font-bold text-white">{metrics?.avgSessionDuration || 0} min</span>
                                        </div>
                                    </div>
                                </Card>

                                {/* Account Details */}
                                <Card className="bg-slate-800 border-slate-700 p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm text-slate-400">Account Name</label>
                                            <p className="text-white">{selectedAccount.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-400">Package</label>
                                            <p className="text-white capitalize">{selectedAccount.packageType}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-400">Created On</label>
                                            <p className="text-white">
                                                {new Date(selectedAccount.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-400">Billing Contact</label>
                                            <p className="text-white">{selectedAccount.contactEmail}</p>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>

                            {/* Team Tab */}
                            <TabsContent value="team" className="space-y-6">
                                <Card className="bg-slate-800 border-slate-700 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-white">Team Members</h3>
                                        <Button
                                            onClick={() => {
                                                // Show invite modal
                                                console.log('Invite team member');
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Invite Member
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {teamMembers.length > 0 ? (
                                            teamMembers.map((member) => (
                                                <div key={member.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                                                    <div>
                                                        <div className="font-semibold text-white">{member.name}</div>
                                                        <div className="text-sm text-slate-400">{member.email}</div>
                                                        <Badge className="mt-2 capitalize">{member.role}</Badge>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                // Show role change modal
                                                                console.log('Change role');
                                                            }}
                                                        >
                                                            Change Role
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-400 hover:text-red-500"
                                                            onClick={() => removeMember(selectedAccount.id, member.id)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-slate-400">
                                                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                                <p>No team members yet. Start by inviting your team!</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <Card className="bg-slate-800 border-slate-700 p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Role Permissions</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {[
                                            { role: 'Owner', perms: 7 },
                                            { role: 'Admin', perms: 6 },
                                            { role: 'Manager', perms: 4 },
                                            { role: 'Member', perms: 3 }
                                        ].map((item) => (
                                            <div key={item.role} className="p-3 bg-slate-700/50 rounded">
                                                <div className="font-semibold text-white">{item.role}</div>
                                                <div className="text-sm text-slate-400">{item.perms} permissions</div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </TabsContent>

                            {/* Contracts Tab */}
                            <TabsContent value="contracts" className="space-y-6">
                                <Card className="bg-slate-800 border-slate-700 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-white">Service Contracts</h3>
                                        <Button
                                            onClick={() => {
                                                // Show create contract modal
                                                console.log('Create contract');
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            New Contract
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {activeContracts.length > 0 ? (
                                            activeContracts.map((contract) => (
                                                <div key={contract.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                                        <div>
                                                            <div className="text-xs text-slate-400 uppercase">Contract Type</div>
                                                            <div className="font-semibold text-white capitalize">{contract.type}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-slate-400 uppercase">Duration</div>
                                                            <div className="font-semibold text-white">{contract.duration} months</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-slate-400 uppercase">Monthly Fee</div>
                                                            <div className="font-semibold text-white">${contract.monthlyFee}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-slate-400 uppercase">Status</div>
                                                            <Badge className="capitalize">{contract.status}</Badge>
                                                        </div>
                                                    </div>

                                                    {contract.serviceLevel && (
                                                        <div className="mb-4 p-3 bg-slate-800 rounded border border-slate-600">
                                                            <div className="text-sm font-semibold text-slate-300 mb-2">SLA Terms</div>
                                                            <ul className="text-sm text-slate-400 space-y-1">
                                                                <li>• Response Time: {contract.serviceLevel.responseTime}</li>
                                                                <li>• Uptime Guarantee: {contract.serviceLevel.uptime}%</li>
                                                            </ul>
                                                        </div>
                                                    )}

                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                // Show renewal modal
                                                                console.log('Renew contract');
                                                            }}
                                                        >
                                                            Renew
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                // Show edit modal
                                                                console.log('Edit contract');
                                                            }}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-400 hover:text-red-500"
                                                            onClick={() => terminateContract(selectedAccount.id, contract.id)}
                                                        >
                                                            Terminate
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-slate-400">
                                                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                                <p>No active contracts. Create one to get started.</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </TabsContent>

                            {/* Billing Tab */}
                            <TabsContent value="billing" className="space-y-6">
                                <Card className="bg-slate-800 border-slate-700 p-6">
                                    <h3 className="text-lg font-semibold text-white mb-6">Billing Information</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="p-4 bg-slate-700/50 rounded-lg">
                                            <div className="text-slate-400 text-sm mb-2">Monthly Bill</div>
                                            <div className="text-3xl font-bold text-white">${selectedAccount.billingInfo?.monthlyBill || 0}</div>
                                        </div>
                                        <div className="p-4 bg-slate-700/50 rounded-lg">
                                            <div className="text-slate-400 text-sm mb-2">Billing Cycle</div>
                                            <div className="text-xl font-semibold text-white capitalize">
                                                {selectedAccount.billingInfo?.billingCycle || 'monthly'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-700 pt-6">
                                        <h4 className="font-semibold text-white mb-4">Payment Method</h4>
                                        <div className="p-4 bg-slate-700/50 rounded-lg">
                                            <p className="text-slate-300">
                                                {selectedAccount.billingInfo?.paymentMethod || 'No payment method on file'}
                                            </p>
                                            <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                                                Update Payment Method
                                            </Button>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="bg-slate-800 border-slate-700 p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Recent Invoices</h3>
                                    <div className="space-y-3">
                                        {/* Placeholder for invoices */}
                                        <div className="p-3 bg-slate-700/50 rounded flex items-center justify-between">
                                            <span className="text-slate-300">Invoice #INV-001</span>
                                            <Button variant="ghost" size="sm">Download</Button>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>

                            {/* Settings Tab */}
                            <TabsContent value="settings" className="space-y-6">
                                <Card className="bg-slate-800 border-slate-700 p-6">
                                    <h3 className="text-lg font-semibold text-white mb-6">Account Settings</h3>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-slate-300 font-semibold mb-2">Account Name</label>
                                            <input
                                                type="text"
                                                defaultValue={selectedAccount.name}
                                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-300 font-semibold mb-2">Contact Email</label>
                                            <input
                                                type="email"
                                                defaultValue={selectedAccount.contactEmail}
                                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                                            />
                                        </div>

                                        <div className="pt-4 border-t border-slate-700">
                                            <h4 className="font-semibold text-white mb-4">Package Management</h4>
                                            <div className="p-4 bg-slate-700/50 rounded mb-4">
                                                <p className="text-slate-300 mb-2">Current: <span className="font-semibold capitalize">{selectedAccount.packageType}</span></p>
                                                <Button
                                                    onClick={() => {
                                                        // Show upgrade modal
                                                        console.log('Upgrade package');
                                                    }}
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Change Package
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-700">
                                            <h4 className="font-semibold text-white mb-4">Account Status</h4>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant={selectedAccount.status === 'active' ? 'default' : 'outline'}
                                                    onClick={() => pauseAccount(selectedAccount.id, 'User requested pause')}
                                                >
                                                    {selectedAccount.status === 'active' ? 'Pause Account' : 'Account Paused'}
                                                </Button>
                                                {selectedAccount.status === 'paused' && (
                                                    <Button
                                                        onClick={() => reactivateAccount(selectedAccount.id)}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        Reactivate
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-700 flex gap-4">
                                            <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                                            <Button variant="outline">Cancel</Button>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </>
                )}

                {accounts.length === 0 && (
                    <Card className="bg-slate-800 border-slate-700 p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Enterprise Accounts</h3>
                        <p className="text-slate-400 mb-6">You don't have any enterprise accounts yet.</p>
                        <Button
                            onClick={() => navigate('/enterprise')}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Explore Enterprise Plans
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
}

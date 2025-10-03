import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Key, Copy, Eye, EyeOff, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed: string;
  created: string;
  status: 'active' | 'revoked';
}

const demoKeys: APIKey[] = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'sk_live_xxxxxxxxxxxxxxxxxxxxxxxx',
    permissions: ['read', 'write'],
    lastUsed: '2 hours ago',
    created: '2024-01-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Development API Key',
    key: 'sk_test_yyyyyyyyyyyyyyyyyyyyyyyy',
    permissions: ['read'],
    lastUsed: '5 hours ago',
    created: '2024-02-01',
    status: 'active'
  },
  {
    id: '3',
    name: 'Webhook Integration',
    key: 'sk_live_zzzzzzzzzzzzzzzzzzzzzzzz',
    permissions: ['webhook'],
    lastUsed: '1 day ago',
    created: '2024-01-20',
    status: 'active'
  },
];

export function APIKeyManager() {
  const [keys, setKeys] = useState(demoKeys);
  const [newKeyName, setNewKeyName] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  const createNewKey = () => {
    if (!newKeyName) {
      toast.error('Please enter a key name');
      return;
    }
    
    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk_live_${Math.random().toString(36).substring(2, 15)}`,
      permissions: ['read', 'write'],
      lastUsed: 'Never',
      created: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    
    setKeys([...keys, newKey]);
    setNewKeyName('');
    toast.success('New API key created');
  };

  const revokeKey = (keyId: string) => {
    setKeys(keys.map(k => 
      k.id === keyId ? { ...k, status: 'revoked' as const } : k
    ));
    toast.success('API key revoked');
  };

  const maskKey = (key: string, show: boolean) => {
    if (show) return key;
    const prefix = key.substring(0, 8);
    return `${prefix}${'*'.repeat(20)}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Create New API Key
          </CardTitle>
          <CardDescription>Generate API keys for external integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Enter key name (e.g., Production API)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={createNewKey} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Key
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active API Keys</CardTitle>
          <CardDescription>Manage your API keys and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{apiKey.name}</h4>
                      <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                        {apiKey.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created {apiKey.created} • Last used {apiKey.lastUsed}
                    </div>
                  </div>
                  
                  {apiKey.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeKey(apiKey.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2 p-2 rounded bg-muted/50 font-mono text-sm mb-3">
                  <span className="flex-1">{maskKey(apiKey.key, showKeys[apiKey.id])}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                  >
                    {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(apiKey.key)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  {apiKey.permissions.map(permission => (
                    <Badge key={permission} variant="outline">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

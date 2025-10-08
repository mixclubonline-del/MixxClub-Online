import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionBrowser } from '@/components/mixxmaster/SessionBrowser';
import { RealtimeCollaboration } from '@/components/mixxmaster/RealtimeCollaboration';
import { AISuggestions } from '@/components/mixxmaster/AISuggestions';
import { VersionComparator } from '@/components/mixxmaster/VersionComparator';
import { PluginChainTemplates } from '@/components/mixxmaster/PluginChainTemplates';
import { Badge } from '@/components/ui/badge';
import { Sparkles, GitBranch, Layers, Database } from 'lucide-react';

export default function MixxMasterStudio() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">MixxMaster Studio</h1>
              <p className="text-muted-foreground">
                Universal session container for cross-DAW collaboration
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1">
              <Database className="h-3 w-3" />
              Format v1.0
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </Badge>
            <Badge variant="outline" className="gap-1">
              <GitBranch className="h-3 w-3" />
              Version Control
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sessions">
              <Database className="h-4 w-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="ai" disabled={!selectedSessionId}>
              <Sparkles className="h-4 w-4 mr-2" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="versions" disabled={!selectedSessionId}>
              <GitBranch className="h-4 w-4 mr-2" />
              Versions
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Layers className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SessionBrowser onSessionSelect={setSelectedSessionId} />
              </div>
              {selectedSessionId && (
                <div>
                  <RealtimeCollaboration sessionId={selectedSessionId} />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            {selectedSessionId ? (
              <div className="grid grid-cols-1 gap-6">
                <AISuggestions sessionId={selectedSessionId} />
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Select a session to view AI suggestions
              </div>
            )}
          </TabsContent>

          <TabsContent value="versions" className="space-y-6">
            {selectedSessionId ? (
              <div className="grid grid-cols-1 gap-6">
                <VersionComparator sessionId={selectedSessionId} />
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Select a session to compare versions
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <PluginChainTemplates />
            </div>
          </TabsContent>
        </Tabs>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t">
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Universal Format
            </h3>
            <p className="text-sm text-muted-foreground">
              Work seamlessly across Pro Tools, Logic, Ableton, FL Studio, and more with the MixxMaster format.
            </p>
          </div>
          
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI-Powered Analysis
            </h3>
            <p className="text-sm text-muted-foreground">
              Get intelligent mixing suggestions, frequency analysis, and plugin recommendations from PrimeBot AI.
            </p>
          </div>
          
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Version Control
            </h3>
            <p className="text-sm text-muted-foreground">
              Track every change with engineer signatures, checksums, and detailed version history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

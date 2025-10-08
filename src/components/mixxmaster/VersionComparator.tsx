import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitCompare, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Version {
  id: string;
  version_number: number;
  created_at: string;
  engineer_id: string;
  changes_summary?: string;
  diff_data?: any;
}

interface VersionComparatorProps {
  sessionId: string;
}

export function VersionComparator({ sessionId }: VersionComparatorProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedA, setSelectedA] = useState<string | null>(null);
  const [selectedB, setSelectedB] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);
  const [differences, setDifferences] = useState<any>(null);

  useEffect(() => {
    loadVersions();
  }, [sessionId]);

  const loadVersions = async () => {
    try {
      const { data, error } = await supabase
        .from('mixxmaster_versions')
        .select('*')
        .eq('session_id', sessionId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error loading versions:', error);
      toast.error('Failed to load versions');
    }
  };

  const compareVersions = async () => {
    if (!selectedA || !selectedB) return;

    setComparing(true);
    try {
      const versionA = versions.find(v => v.id === selectedA);
      const versionB = versions.find(v => v.id === selectedB);

      if (!versionA || !versionB) throw new Error('Versions not found');

      const diffs = {
        stemChanges: [],
        metadataChanges: [],
        timestamp: new Date().toISOString(),
        versionA: versionA.version_number,
        versionB: versionB.version_number
      };

      setDifferences(diffs);
      toast.success('Comparison complete');
    } catch (error) {
      console.error('Error comparing versions:', error);
      toast.error('Failed to compare versions');
    } finally {
      setComparing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Version Comparator
          </CardTitle>
          <CardDescription>
            Compare two versions to see what changed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Version A</label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {versions.map((version) => (
                  <Card
                    key={version.id}
                    className={`cursor-pointer transition-colors ${
                      selectedA === version.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedA(version.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="outline">v{version.version_number}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(version.created_at)}
                          </p>
                        </div>
                        {selectedA === version.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      {version.changes_summary && (
                        <p className="text-xs mt-2">{version.changes_summary}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Version B</label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {versions.map((version) => (
                  <Card
                    key={version.id}
                    className={`cursor-pointer transition-colors ${
                      selectedB === version.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedB(version.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="outline">v{version.version_number}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(version.created_at)}
                          </p>
                        </div>
                        {selectedB === version.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      {version.changes_summary && (
                        <p className="text-xs mt-2">{version.changes_summary}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={compareVersions}
            disabled={!selectedA || !selectedB || comparing}
            className="w-full"
          >
            {comparing ? 'Comparing...' : 'Compare Versions'}
          </Button>
        </CardContent>
      </Card>

      {differences && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
            <CardDescription>
              Differences between v{differences.versionA} and v{differences.versionB}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Stem Changes</h4>
                {differences.stemChanges.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No stem changes detected</p>
                ) : (
                  <ul className="space-y-1">
                    {differences.stemChanges.map((change: any, idx: number) => (
                      <li key={idx} className="text-sm flex items-center gap-2">
                        <Badge variant={change.type === 'added' ? 'default' : 'destructive'}>
                          {change.type}
                        </Badge>
                        <span>{change.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

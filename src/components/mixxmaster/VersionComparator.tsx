import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GitCompare, Plus, Minus, Edit } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface VersionComparatorProps {
  sessionId: string;
}

interface Version {
  id: string;
  version_number: number;
  engineer_signature: string | null;
  changes_summary: string;
  diff_data: any;
  created_at: string;
}

export const VersionComparator = ({ sessionId }: VersionComparatorProps) => {
  const [versionA, setVersionA] = useState<string>('');
  const [versionB, setVersionB] = useState<string>('');

  const { data: versions, isLoading } = useQuery({
    queryKey: ['mixxmaster-versions', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mixxmaster_versions')
        .select('*')
        .eq('session_id', sessionId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data as Version[];
    },
  });

  const selectedVersionA = versions?.find(v => v.id === versionA);
  const selectedVersionB = versions?.find(v => v.id === versionB);

  const renderDiff = (diff: any) => {
    if (!diff) return null;

    return (
      <div className="space-y-3">
        {diff.added && diff.added.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Plus className="h-4 w-4 text-green-500" />
              <p className="font-medium text-sm">Added</p>
            </div>
            <ul className="space-y-1 ml-6">
              {diff.added.map((item: string, i: number) => (
                <li key={i} className="text-sm text-green-600">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {diff.modified && diff.modified.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Edit className="h-4 w-4 text-blue-500" />
              <p className="font-medium text-sm">Modified</p>
            </div>
            <ul className="space-y-1 ml-6">
              {diff.modified.map((item: string, i: number) => (
                <li key={i} className="text-sm text-blue-600">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {diff.removed && diff.removed.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Minus className="h-4 w-4 text-red-500" />
              <p className="font-medium text-sm">Removed</p>
            </div>
            <ul className="space-y-1 ml-6">
              {diff.removed.map((item: string, i: number) => (
                <li key={i} className="text-sm text-red-600">{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5" />
          Version Comparator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading versions...</p>
        ) : versions && versions.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Version A</label>
                <Select value={versionA} onValueChange={setVersionA}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        v{version.version_number} - {new Date(version.created_at).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Version B</label>
                <Select value={versionB} onValueChange={setVersionB}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        v{version.version_number} - {new Date(version.created_at).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedVersionA && selectedVersionB && (
              <div className="pt-4 border-t space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Badge variant="outline" className="mb-2">Version {selectedVersionA.version_number}</Badge>
                    <p className="text-sm">{selectedVersionA.changes_summary}</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">Version {selectedVersionB.version_number}</Badge>
                    <p className="text-sm">{selectedVersionB.changes_summary}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-medium mb-3">Changes</p>
                  {renderDiff(selectedVersionB.diff_data)}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No versions available for comparison</p>
        )}
      </CardContent>
    </Card>
  );
};

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GitBranch, Clock, User, RotateCcw, Eye, 
  CheckCircle, AlertCircle
} from "lucide-react";

interface Version {
  id: string;
  version: string;
  author: string;
  timestamp: string;
  changes: string;
  status: 'current' | 'previous' | 'archived';
  wordCount: number;
  changesSummary: {
    added: number;
    removed: number;
    modified: number;
  };
}

const versions: Version[] = [
  {
    id: '1',
    version: 'v1.5',
    author: 'John Smith',
    timestamp: '2 hours ago',
    changes: 'Updated introduction and added new section on AI features',
    status: 'current',
    wordCount: 2847,
    changesSummary: { added: 234, removed: 45, modified: 89 }
  },
  {
    id: '2',
    version: 'v1.4',
    author: 'Sarah Johnson',
    timestamp: '1 day ago',
    changes: 'Fixed typos and improved formatting',
    status: 'previous',
    wordCount: 2658,
    changesSummary: { added: 12, removed: 8, modified: 34 }
  },
  {
    id: '3',
    version: 'v1.3',
    author: 'John Smith',
    timestamp: '3 days ago',
    changes: 'Added code examples and screenshots',
    status: 'previous',
    wordCount: 2654,
    changesSummary: { added: 456, removed: 23, modified: 67 }
  },
  {
    id: '4',
    version: 'v1.2',
    author: 'Mike Davis',
    timestamp: '5 days ago',
    changes: 'Restructured content flow',
    status: 'previous',
    wordCount: 2221,
    changesSummary: { added: 89, removed: 123, modified: 201 }
  },
  {
    id: '5',
    version: 'v1.1',
    author: 'Sarah Johnson',
    timestamp: '1 week ago',
    changes: 'Initial draft review and edits',
    status: 'previous',
    wordCount: 2255,
    changesSummary: { added: 345, removed: 234, modified: 456 }
  },
  {
    id: '6',
    version: 'v1.0',
    author: 'Admin Team',
    timestamp: '2 weeks ago',
    changes: 'Initial version created',
    status: 'archived',
    wordCount: 2144,
    changesSummary: { added: 2144, removed: 0, modified: 0 }
  }
];

export function ContentVersionControl() {
  const getStatusBadge = (status: Version['status']) => {
    switch (status) {
      case 'current':
        return <Badge className="gap-1"><CheckCircle className="h-3 w-3" />Current</Badge>;
      case 'previous':
        return <Badge variant="secondary">Previous</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Version History
        </CardTitle>
        <CardDescription>Track changes and restore previous versions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Version Timeline */}
          <div className="relative">
            {versions.map((version, index) => (
              <div key={version.id} className="relative pl-8 pb-8 last:pb-0">
                {/* Timeline line */}
                {index < versions.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
                )}

                {/* Timeline dot */}
                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  version.status === 'current' 
                    ? 'bg-primary border-primary' 
                    : 'bg-background border-border'
                }`}>
                  {version.status === 'current' ? (
                    <CheckCircle className="h-3 w-3 text-primary-foreground" />
                  ) : (
                    <Clock className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>

                {/* Version Content */}
                <div className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{version.version}</h3>
                        {getStatusBadge(version.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {version.changes}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {version.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {version.timestamp}
                        </span>
                        <span>{version.wordCount.toLocaleString()} words</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {version.status !== 'current' && (
                        <Button variant="ghost" size="sm">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Changes Summary */}
                  <div className="flex items-center gap-4 pt-3 border-t text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-muted-foreground">
                        +{version.changesSummary.added} added
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-muted-foreground">
                        -{version.changesSummary.removed} removed
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-muted-foreground">
                        ~{version.changesSummary.modified} modified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold">{versions.length}</div>
              <div className="text-xs text-muted-foreground">Total Versions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {versions.filter(v => new Date().getTime() - new Date(v.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000).length}
              </div>
              <div className="text-xs text-muted-foreground">Last 7 Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Array.from(new Set(versions.map(v => v.author))).length}
              </div>
              <div className="text-xs text-muted-foreground">Contributors</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

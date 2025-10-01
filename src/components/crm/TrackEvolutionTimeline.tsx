import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, Download, Music, Sparkles, TrendingUp, 
  Award, Clock, FileAudio 
} from 'lucide-react';

interface Version {
  id: string;
  name: string;
  date: string;
  type: 'raw' | 'mix' | 'revision' | 'master';
  fileSize: string;
  changes: string[];
  engineer?: string;
}

interface TrackEvolutionTimelineProps {
  projectId: string;
}

export const TrackEvolutionTimeline = ({ projectId }: TrackEvolutionTimelineProps) => {
  const versions: Version[] = [
    {
      id: '1',
      name: 'Raw Stems',
      date: '2025-01-15',
      type: 'raw',
      fileSize: '85 MB',
      changes: ['Original tracks uploaded', '8 stems included'],
    },
    {
      id: '2',
      name: 'First Mix',
      date: '2025-01-18',
      type: 'mix',
      fileSize: '45 MB',
      changes: [
        'Initial balance and levels',
        'Basic EQ and compression',
        'Reverb and spatial effects added'
      ],
      engineer: 'Alex Martinez'
    },
    {
      id: '3',
      name: 'Revision 1',
      date: '2025-01-20',
      type: 'revision',
      fileSize: '45 MB',
      changes: [
        'Vocals pushed forward 2dB',
        'Bass tightened with sidechain',
        'Added more air on top end',
        'Snare adjusted per artist feedback'
      ],
      engineer: 'Alex Martinez'
    },
    {
      id: '4',
      name: 'Final Master',
      date: '2025-01-22',
      type: 'master',
      fileSize: '12 MB',
      changes: [
        'Mastering chain applied',
        'Optimized for streaming platforms',
        'Final loudness: -14 LUFS',
        'Ready for distribution'
      ],
      engineer: 'Sarah Chen'
    }
  ];

  const getTypeInfo = (type: string) => {
    const typeMap = {
      raw: { 
        label: 'Raw Upload', 
        color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        icon: FileAudio 
      },
      mix: { 
        label: 'Mix Version', 
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        icon: Music 
      },
      revision: { 
        label: 'Revision', 
        color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        icon: TrendingUp 
      },
      master: { 
        label: 'Master', 
        color: 'bg-green-500/10 text-green-500 border-green-500/20',
        icon: Award 
      }
    };
    return typeMap[type as keyof typeof typeMap] || typeMap.raw;
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Track Evolution Story
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Follow the journey from raw tracks to final master
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/5">
            {versions.length} versions
          </Badge>
        </div>

        {/* Timeline */}
        <div className="relative space-y-6 pl-8">
          {/* Vertical Line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-purple-500 to-green-500" />

          {versions.map((version, index) => {
            const typeInfo = getTypeInfo(version.type);
            const TypeIcon = typeInfo.icon;
            const isLatest = index === versions.length - 1;

            return (
              <div key={version.id} className="relative">
                {/* Timeline Dot */}
                <div className={`absolute -left-8 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center ${
                  isLatest ? 'bg-primary' : 'bg-background shadow-md'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    isLatest ? 'bg-background' : 'bg-primary'
                  }`} />
                </div>

                {/* Content Card */}
                <Card className={`p-5 ${isLatest ? 'border-primary shadow-lg' : ''}`}>
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={typeInfo.color}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {typeInfo.label}
                          </Badge>
                          {isLatest && (
                            <Badge className="bg-primary text-primary-foreground">
                              Latest
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-lg font-semibold mb-1">{version.name}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(version.date).toLocaleDateString()}
                          </div>
                          <span>•</span>
                          <span>{version.fileSize}</span>
                          {version.engineer && (
                            <>
                              <span>•</span>
                              <span>by {version.engineer}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Changes List */}
                    <div className="space-y-1.5 pl-4 border-l-2 border-primary/20">
                      {version.changes.map((change, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          • {change}
                        </p>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Before/After Compare */}
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold mb-1">Compare Before & After</p>
              <p className="text-sm text-muted-foreground">
                Listen to the transformation from raw to mastered
              </p>
            </div>
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Compare
            </Button>
          </div>
        </Card>
      </div>
    </Card>
  );
};
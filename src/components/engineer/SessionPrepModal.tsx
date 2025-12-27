import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PrimeAvatar } from '@/components/prime/PrimeAvatar';
import { Sparkles, Music, Activity, Target, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SessionPrepModalProps {
  open: boolean;
  onClose: () => void;
  onStartSession: () => void;
  project: any;
  aiAnalysis?: any;
}

export const SessionPrepModal = ({
  open,
  onClose,
  onStartSession,
  project,
  aiAnalysis,
}: SessionPrepModalProps) => {
  const analysisItems = [
    { 
      icon: Music, 
      label: 'Genre', 
      value: aiAnalysis?.detected_genre || 'Not detected',
      confidence: 92,
      color: 'text-blue-500',
    },
    { 
      icon: Target, 
      label: 'Key Signature', 
      value: aiAnalysis?.key_signature || 'Not detected',
      confidence: 98,
      color: 'text-purple-500',
    },
    { 
      icon: TrendingUp, 
      label: 'Tempo', 
      value: aiAnalysis?.tempo_bpm ? `${aiAnalysis.tempo_bpm} BPM` : 'Not detected',
      confidence: 100,
      color: 'text-green-500',
    },
    { 
      icon: Activity, 
      label: 'Complexity', 
      value: aiAnalysis?.complexity_score ? `${Math.round(aiAnalysis.complexity_score * 100)}%` : 'Not analyzed',
      confidence: 87,
      color: 'text-yellow-500',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <PrimeAvatar size="md" />
            Session Prep: {project?.title || 'Untitled Project'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="analysis" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="files">Audio Files</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>

          {/* AI Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6 mt-6">
            {aiAnalysis ? (
              <>
                {/* Quick Stats */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analysisItems.map((item, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${item.color}`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground">{item.label}</div>
                          <div className="font-bold">{item.value}</div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Confidence</span>
                          <span className="font-semibold">{item.confidence}%</span>
                        </div>
                        <Progress value={item.confidence} className="h-1" />
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Detailed Analysis */}
                <Card className="p-6 bg-primary/5">
                  <div className="flex items-start gap-3">
                    <PrimeAvatar size="md" />
                    <div className="flex-1">
                      <h3 className="font-bold mb-2">MIXXCLUB Session Brief</h3>
                      <div className="space-y-3 text-sm">
                        <p>
                          This track is a <strong>{aiAnalysis?.detected_genre || 'modern'}</strong> production 
                          in <strong>{aiAnalysis?.key_signature || 'unknown key'}</strong> at <strong>{aiAnalysis?.tempo_bpm || '—'} BPM</strong>.
                        </p>
                        
                        {aiAnalysis?.mood_analysis && (
                          <div>
                            <div className="font-semibold mb-2">Mood Profile:</div>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(aiAnalysis.mood_analysis).slice(0, 4).map(([mood, score]: [string, any]) => (
                                <Badge key={mood} variant="secondary">
                                  {mood}: {Math.round(score * 100)}%
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {aiAnalysis?.instrumentation && aiAnalysis.instrumentation.length > 0 && (
                          <div>
                            <div className="font-semibold mb-2">Detected Instruments:</div>
                            <div className="flex flex-wrap gap-2">
                              {aiAnalysis.instrumentation.map((instrument: string, i: number) => (
                                <Badge key={i} variant="outline">
                                  {instrument}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-3 border-t">
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-semibold">Ready to mix</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-bold mb-2">AI Analysis Pending</h3>
                <p className="text-sm text-muted-foreground">
                  MIXXCLUB will analyze this track when you start the session
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Audio Files Tab */}
          <TabsContent value="files" className="space-y-4 mt-6">
            {project?.audio_files && project.audio_files.length > 0 ? (
              project.audio_files.map((file: any, i: number) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Music className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{file.file_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {file.file_type} • {file.duration_seconds ? `${Math.floor(file.duration_seconds / 60)}:${String(file.duration_seconds % 60).padStart(2, '0')}` : 'Unknown duration'}
                      </div>
                    </div>
                    {file.stem_type && (
                      <Badge variant="secondary">{file.stem_type}</Badge>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No audio files uploaded yet</p>
              </Card>
            )}
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4 mt-6">
            <Card className="p-6 bg-accent/5">
              <div className="flex items-start gap-3">
                <PrimeAvatar size="md" />
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold mb-2">Session Tips</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Start with level balancing across all elements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Pay special attention to vocal clarity and presence</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Consider the genre-specific frequency balance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Reference against commercial tracks in this style</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">Estimated Session Time</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Based on similar projects: <strong className="text-foreground">2-4 hours</strong>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t">
          <Button onClick={onStartSession} size="lg" className="flex-1 gap-2">
            <Sparkles className="w-5 h-5" />
            Start Session
          </Button>
          <Button onClick={onClose} variant="outline" size="lg">
            Review Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

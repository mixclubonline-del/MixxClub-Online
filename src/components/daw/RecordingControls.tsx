import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Mic, Circle, Square, SkipForward, SkipBack } from 'lucide-react';
import { toast } from 'sonner';

interface Take {
  id: string;
  number: number;
  duration: number;
  timestamp: Date;
}

export const RecordingControls = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPunchEnabled, setIsPunchEnabled] = useState(false);
  const [punchIn, setPunchIn] = useState(0);
  const [punchOut, setPunchOut] = useState(4);
  const [takes, setTakes] = useState<Take[]>([]);
  const [currentTake, setCurrentTake] = useState(1);
  const [inputDevice, setInputDevice] = useState('default');
  const [countIn, setCountIn] = useState(false);

  const handleRecord = () => {
    if (isRecording) {
      // Stop recording
      const newTake: Take = {
        id: `take-${Date.now()}`,
        number: currentTake,
        duration: Math.random() * 60 + 30,
        timestamp: new Date(),
      };
      setTakes([...takes, newTake]);
      setCurrentTake(currentTake + 1);
      setIsRecording(false);
      toast.success(`Take ${currentTake} saved`);
    } else {
      // Start recording
      setIsRecording(true);
      toast.success(countIn ? 'Recording starting after count-in...' : 'Recording started');
    }
  };

  const handleDeleteTake = (takeId: string) => {
    setTakes(takes.filter(t => t.id !== takeId));
    toast.success('Take deleted');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border" style={{
      background: 'hsl(220, 20%, 12%)',
      borderColor: 'hsl(220, 20%, 20%)',
    }}>
      {/* Input Device Selection */}
      <div className="space-y-2">
        <Label className="text-xs">Input Device</Label>
        <Select value={inputDevice} onValueChange={setInputDevice}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Microphone</SelectItem>
            <SelectItem value="usb">USB Audio Interface</SelectItem>
            <SelectItem value="built-in">Built-in Microphone</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Recording Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Count-in (2 bars)</Label>
          <Switch checked={countIn} onCheckedChange={setCountIn} />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Punch In/Out</Label>
          <Switch checked={isPunchEnabled} onCheckedChange={setIsPunchEnabled} />
        </div>

        {isPunchEnabled && (
          <div className="grid grid-cols-2 gap-2 pl-4">
            <div>
              <Label className="text-xs">Punch In (bars)</Label>
              <Select value={punchIn.toString()} onValueChange={(v) => setPunchIn(Number(v))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 16 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Punch Out (bars)</Label>
              <Select value={punchOut.toString()} onValueChange={(v) => setPunchOut(Number(v))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 32 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Record Button */}
      <Button
        onClick={handleRecord}
        className={`w-full gap-2 ${isRecording ? 'bg-red-600 hover:bg-red-700' : ''}`}
        variant={isRecording ? 'destructive' : 'default'}
      >
        {isRecording ? (
          <>
            <Square className="w-4 h-4" />
            Stop Recording
          </>
        ) : (
          <>
            <Circle className="w-4 h-4 fill-current" />
            Record Take {currentTake}
          </>
        )}
      </Button>

      {/* Takes List */}
      {takes.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs">Takes</Label>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {takes.map(take => (
              <div
                key={take.id}
                className="flex items-center gap-2 p-2 rounded"
                style={{ background: 'hsl(220, 20%, 14%)' }}
              >
                <Mic className="w-4 h-4" style={{ color: 'hsl(0, 80%, 60%)' }} />
                <div className="flex-1">
                  <div className="text-sm font-medium">Take {take.number}</div>
                  <div className="text-xs" style={{ color: 'hsl(220, 20%, 60%)' }}>
                    {formatDuration(take.duration)} • {take.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => toast.success(`Playing Take ${take.number}`)}
                  >
                    <SkipForward className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => handleDeleteTake(take.id)}
                  >
                    <Square className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

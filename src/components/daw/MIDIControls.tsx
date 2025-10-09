import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Piano, Cable, Power, Radio, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface MIDIDevice {
  id: string;
  name: string;
  type: 'input' | 'output';
  connected: boolean;
}

export const MIDIControls = () => {
  const [devices, setDevices] = useState<MIDIDevice[]>([
    { id: 'dev-1', name: 'USB MIDI Keyboard', type: 'input', connected: true },
    { id: 'dev-2', name: 'Virtual MIDI Bus', type: 'output', connected: false },
    { id: 'dev-3', name: 'MIDI Controller', type: 'input', connected: true },
  ]);
  const [selectedInput, setSelectedInput] = useState<string>('dev-1');
  const [selectedOutput, setSelectedOutput] = useState<string>('dev-2');
  const [midiThru, setMidiThru] = useState(false);
  const [midiLearn, setMidiLearn] = useState(false);
  const [activity, setActivity] = useState<{ input: boolean; output: boolean }>({ 
    input: false, 
    output: false 
  });

  const inputDevices = devices.filter(d => d.type === 'input');
  const outputDevices = devices.filter(d => d.type === 'output');

  const handleRefreshDevices = () => {
    // Simulate device refresh
    toast.success('MIDI devices refreshed');
    // In a real implementation, this would use Web MIDI API:
    // navigator.requestMIDIAccess().then(...)
  };

  const handleToggleMidiLearn = () => {
    setMidiLearn(!midiLearn);
    toast.success(midiLearn ? 'MIDI Learn disabled' : 'MIDI Learn enabled');
  };

  const handleTestNote = () => {
    setActivity({ ...activity, input: true });
    setTimeout(() => setActivity({ ...activity, input: false }), 200);
    toast.success('MIDI note received');
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Piano className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">MIDI Settings</h3>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshDevices}
          className="gap-2"
        >
          <Radio className="w-4 h-4" />
          Refresh Devices
        </Button>
      </div>

      {/* Input Device */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>MIDI Input</Label>
          {activity.input && (
            <Activity className="w-4 h-4 text-green-500 animate-pulse" />
          )}
        </div>
        <Select value={selectedInput} onValueChange={setSelectedInput}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {inputDevices.map(device => (
              <SelectItem key={device.id} value={device.id}>
                <div className="flex items-center gap-2">
                  <Cable className="w-3 h-3" />
                  {device.name}
                  {device.connected && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Connected
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
            {inputDevices.length === 0 && (
              <SelectItem value="none" disabled>
                No input devices found
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Output Device */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>MIDI Output</Label>
          {activity.output && (
            <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
          )}
        </div>
        <Select value={selectedOutput} onValueChange={setSelectedOutput}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {outputDevices.map(device => (
              <SelectItem key={device.id} value={device.id}>
                <div className="flex items-center gap-2">
                  <Cable className="w-3 h-3" />
                  {device.name}
                  {device.connected && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Connected
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
            {outputDevices.length === 0 && (
              <SelectItem value="none" disabled>
                No output devices found
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* MIDI Options */}
      <div className="space-y-3 pt-2 border-t">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>MIDI Thru</Label>
            <p className="text-xs text-muted-foreground">
              Pass input directly to output
            </p>
          </div>
          <Switch
            checked={midiThru}
            onCheckedChange={setMidiThru}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>MIDI Learn</Label>
            <p className="text-xs text-muted-foreground">
              Map controls to MIDI CC
            </p>
          </div>
          <Switch
            checked={midiLearn}
            onCheckedChange={handleToggleMidiLearn}
          />
        </div>
      </div>

      {/* Test Controls */}
      <div className="pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={handleTestNote}
        >
          <Activity className="w-4 h-4" />
          Test MIDI Input
        </Button>
      </div>

      {/* Device Status */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
        <div className="flex items-center justify-between">
          <span>Connected Devices:</span>
          <span className="font-medium">
            {devices.filter(d => d.connected).length} / {devices.length}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>MIDI Learn:</span>
          <Badge variant={midiLearn ? "default" : "outline"} className="text-xs">
            {midiLearn ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

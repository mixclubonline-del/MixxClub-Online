import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, FileCode } from 'lucide-react';
import { DAWConverter, DAWFormat } from '@/lib/mixxmaster/daw-converter';
import { toast } from 'sonner';

interface DAWExporterProps {
  sessionId: string;
}

export function DAWExporter({ sessionId }: DAWExporterProps) {
  const [selectedFormat, setSelectedFormat] = useState<DAWFormat>('protools');
  const [includePlugins, setIncludePlugins] = useState(true);
  const [includeAutomation, setIncludeAutomation] = useState(true);
  const [sampleRate, setSampleRate] = useState('48000');
  const [exporting, setExporting] = useState(false);

  const formats = DAWConverter.getAvailableFormats();

  const handleExport = async () => {
    setExporting(true);
    try {
      // Simulated export - in production, this would fetch the session and convert
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Exported to ${formats.find(f => f.id === selectedFormat)?.name} format`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export session');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode className="h-5 w-5" />
          DAW Export
        </CardTitle>
        <CardDescription>
          Convert your session to DAW-specific format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Target DAW</Label>
          <Select value={selectedFormat} onValueChange={(v) => setSelectedFormat(v as DAWFormat)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formats.map((format) => (
                <SelectItem key={format.id} value={format.id}>
                  {format.name} ({format.extension})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Sample Rate</Label>
          <Select value={sampleRate} onValueChange={setSampleRate}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="44100">44.1 kHz</SelectItem>
              <SelectItem value="48000">48 kHz</SelectItem>
              <SelectItem value="96000">96 kHz</SelectItem>
              <SelectItem value="192000">192 kHz</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="plugins">Include Plugins</Label>
            <Switch
              id="plugins"
              checked={includePlugins}
              onCheckedChange={setIncludePlugins}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="automation">Include Automation</Label>
            <Switch
              id="automation"
              checked={includeAutomation}
              onCheckedChange={setIncludeAutomation}
            />
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={exporting}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export Session'}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded">
          <p className="font-medium">Export includes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>All audio stems with volume/pan settings</li>
            {includePlugins && <li>Plugin chains with parameter mappings</li>}
            {includeAutomation && <li>Automation curves and envelopes</li>}
            <li>Tempo and time signature information</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

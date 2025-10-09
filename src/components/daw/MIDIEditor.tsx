import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Music, Pencil, Eraser, Hand, Grid3x3 } from 'lucide-react';

interface MIDINote {
  id: string;
  pitch: number; // 0-127 (MIDI note number)
  time: number; // in beats
  duration: number; // in beats
  velocity: number; // 0-127
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PIANO_KEYS = 88; // Standard piano range
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B

export const MIDIEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [notes, setNotes] = useState<MIDINote[]>([
    { id: '1', pitch: 60, time: 0, duration: 1, velocity: 100 }, // Middle C
    { id: '2', pitch: 64, time: 1, duration: 1, velocity: 90 },  // E
    { id: '3', pitch: 67, time: 2, duration: 2, velocity: 110 }, // G
  ]);
  const [tool, setTool] = useState<'draw' | 'erase' | 'select'>('draw');
  const [snap, setSnap] = useState<number>(4); // Snap to 1/4 notes
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);

  const GRID_HEIGHT = 12; // Height per note
  const BEATS_PER_BAR = 4;
  const VISIBLE_OCTAVES = 7;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background
      ctx.fillStyle = 'hsl(220, 20%, 10%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Piano roll background (white/black keys)
      const noteRange = 12 * VISIBLE_OCTAVES; // 7 octaves
      const startNote = 36; // C2
      
      for (let i = 0; i < noteRange; i++) {
        const noteInOctave = (startNote + i) % 12;
        const y = canvas.height - ((i + 1) * GRID_HEIGHT);
        const isWhiteKey = WHITE_KEYS.includes(noteInOctave);
        
        ctx.fillStyle = isWhiteKey ? 'hsl(220, 20%, 14%)' : 'hsl(220, 20%, 10%)';
        ctx.fillRect(0, y, canvas.width, GRID_HEIGHT);
        
        // Grid lines
        ctx.strokeStyle = 'hsl(220, 20%, 16%)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Vertical grid lines (beats)
      const beatWidth = 80 * zoom;
      const numBeats = Math.ceil(canvas.width / beatWidth);
      
      for (let i = 0; i <= numBeats; i++) {
        const x = i * beatWidth;
        ctx.strokeStyle = i % BEATS_PER_BAR === 0 
          ? 'hsl(220, 20%, 25%)' // Bar line
          : 'hsl(220, 20%, 16%)'; // Beat line
        ctx.lineWidth = i % BEATS_PER_BAR === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Draw MIDI notes
      notes.forEach(note => {
        const x = note.time * beatWidth;
        const y = canvas.height - ((note.pitch - startNote + 1) * GRID_HEIGHT);
        const width = note.duration * beatWidth;
        const height = GRID_HEIGHT - 2;
        
        // Note color based on velocity
        const hue = 200;
        const lightness = 30 + (note.velocity / 127) * 30;
        
        ctx.fillStyle = selectedNote === note.id 
          ? `hsl(50, 100%, ${lightness}%)`
          : `hsl(${hue}, 70%, ${lightness}%)`;
        
        ctx.fillRect(x, y, width, height);
        
        // Note border
        ctx.strokeStyle = 'hsl(220, 20%, 20%)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // Velocity bar
        const velocityHeight = (note.velocity / 127) * height;
        ctx.fillStyle = `hsla(${hue}, 100%, 60%, 0.3)`;
        ctx.fillRect(x, y + height - velocityHeight, 4, velocityHeight);
      });
    };

    draw();
  }, [notes, selectedNote, zoom, VISIBLE_OCTAVES]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const beatWidth = 80 * zoom;
    const time = Math.round((x / beatWidth) * snap) / snap;
    const pitch = 36 + Math.floor((canvas.height - y) / GRID_HEIGHT);
    
    if (tool === 'draw') {
      // Check if clicking on existing note
      const clickedNote = notes.find(note => {
        const noteX = note.time * beatWidth;
        const noteY = canvas.height - ((note.pitch - 36 + 1) * GRID_HEIGHT);
        const noteWidth = note.duration * beatWidth;
        const noteHeight = GRID_HEIGHT - 2;
        
        return x >= noteX && x <= noteX + noteWidth && 
               y >= noteY && y <= noteY + noteHeight;
      });
      
      if (clickedNote) {
        setSelectedNote(clickedNote.id);
        setIsDragging(true);
      } else {
        // Add new note
        const newNote: MIDINote = {
          id: `note-${Date.now()}`,
          pitch,
          time,
          duration: 1 / snap,
          velocity: 100,
        };
        setNotes([...notes, newNote]);
      }
    } else if (tool === 'erase') {
      // Remove clicked note
      const beatWidth = 80 * zoom;
      const clickedNote = notes.find(note => {
        const noteX = note.time * beatWidth;
        const noteY = canvas.height - ((note.pitch - 36 + 1) * GRID_HEIGHT);
        const noteWidth = note.duration * beatWidth;
        const noteHeight = GRID_HEIGHT - 2;
        
        return x >= noteX && x <= noteX + noteWidth && 
               y >= noteY && y <= noteY + noteHeight;
      });
      
      if (clickedNote) {
        setNotes(notes.filter(n => n.id !== clickedNote.id));
        setSelectedNote(null);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedNote) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const beatWidth = 80 * zoom;
    const time = Math.max(0, Math.round((x / beatWidth) * snap) / snap);
    const pitch = Math.max(0, Math.min(127, 36 + Math.floor((canvas.height - y) / GRID_HEIGHT)));
    
    setNotes(notes.map(n => 
      n.id === selectedNote ? { ...n, time, pitch } : n
    ));
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">MIDI Editor</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Tools */}
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={tool === 'select' ? 'default' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setTool('select')}
            >
              <Hand className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'draw' ? 'default' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setTool('draw')}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'erase' ? 'default' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setTool('erase')}
            >
              <Eraser className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Snap */}
          <Select value={snap.toString()} onValueChange={(v) => setSnap(Number(v))}>
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1/1</SelectItem>
              <SelectItem value="2">1/2</SelectItem>
              <SelectItem value="4">1/4</SelectItem>
              <SelectItem value="8">1/8</SelectItem>
              <SelectItem value="16">1/16</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Zoom */}
          <div className="flex items-center gap-2 w-32">
            <Grid3x3 className="w-4 h-4" />
            <Slider
              value={[zoom]}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={(v) => setZoom(v[0])}
            />
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={1200}
        height={GRID_HEIGHT * 12 * VISIBLE_OCTAVES}
        className="w-full border rounded cursor-crosshair"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      />

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>Notes: {notes.length}</span>
        {selectedNote && (
          <span>
            Selected: {NOTE_NAMES[notes.find(n => n.id === selectedNote)?.pitch! % 12]}
            {Math.floor((notes.find(n => n.id === selectedNote)?.pitch || 0) / 12) - 1}
          </span>
        )}
      </div>
    </div>
  );
};
